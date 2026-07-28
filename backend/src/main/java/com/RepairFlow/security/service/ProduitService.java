package com.RepairFlow.security.service;

import com.RepairFlow.security.email.EmailService;
import com.RepairFlow.security.model.*;
import com.RepairFlow.security.repository.CategorieProduitRepository;
import com.RepairFlow.security.repository.ProduitRepository;
import com.RepairFlow.security.repository.ProduitRequest;
import com.RepairFlow.security.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProduitService {

    private final ProduitRepository produitRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CategorieProduitRepository categorieProduitRepository;
    private final EmailService emailService;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public List<Produit> getProduitsDuReparateur(String emailReparateur, String statut, String categorieId, String q) {
        Utilisateur reparateur = getReparateurParEmail(emailReparateur);

        StatutReparation statutFiltre = null;
        if (statut != null && !statut.trim().isEmpty() && !"TOUS".equalsIgnoreCase(statut.trim())) {
            try {
                statutFiltre = StatutReparation.valueOf(statut.trim());
            } catch (IllegalArgumentException ignored) {
                // valeur inconnue -> pas de filtre plutot qu'une erreur 400
            }
        }

        Long categorieIdFiltre = null;
        if (categorieId != null && !categorieId.trim().isEmpty() && !"TOUS".equalsIgnoreCase(categorieId.trim())) {
            try {
                categorieIdFiltre = Long.valueOf(categorieId.trim());
            } catch (NumberFormatException ignored) {
                // valeur inconnue -> pas de filtre
            }
        }

        String recherche = (q == null || q.trim().isEmpty()) ? null : q.trim();

        return produitRepository.findByReparateurFiltered(reparateur, statutFiltre, categorieIdFiltre, recherche);
    }

    public List<Produit> getProduitsDuClient(String emailClient) {
        Utilisateur client = getClientParEmail(emailClient);
        return produitRepository.findByClient(client);
    }

    public Produit getProduitParId(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
    }

    public Produit creerProduit(ProduitRequest request, String emailReparateur) {
        Utilisateur client = utilisateurRepository.findByEmail(request.getClientEmail())
                .filter(u -> u.getRole() == Role.CLIENT)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Utilisateur reparateur = getReparateurParEmail(emailReparateur);

        CategorieProduit categorie = null;
        if (request.getCategorieId() != null) {
            categorie = categorieProduitRepository.findById(request.getCategorieId())
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        }

        Produit produit = Produit.builder()
                .nom(request.getNom())
                .descriptionPanne(request.getDescriptionPanne())
                .dateDepot(LocalDateTime.now())
                .statut(StatutReparation.RECU)
                .client(client)
                .reparateur(reparateur)
                .categorie(categorie)
                .build();

        return produitRepository.save(produit);
    }

    public Produit modifierStatut(Long id, StatutReparation statut) {
        Produit produit = getProduitParId(id);

        StatutReparation ancienStatut = produit.getStatut();
        produit.setStatut(statut);
        Produit saved = produitRepository.save(produit);

        boolean vientDePasserPret = statut == StatutReparation.PRET && ancienStatut != StatutReparation.PRET;
        if (vientDePasserPret && produit.getClient() != null && produit.getClient().getEmail() != null) {
            emailService.envoyerProduitPret(
                    produit.getClient().getEmail(),
                    produit.getClient().getPrenom(),
                    produit.getNom()
            );
        }

        return saved;
    }

    public Produit modifierObservation(Long id, String observation) {
        Produit produit = getProduitParId(id);
        produit.setObservation(observation);
        return produitRepository.save(produit);
    }

    public Produit uploaderPhoto(Long id, MultipartFile photo) {
        Produit produit = getProduitParId(id);

        if (photo.isEmpty()) {
            throw new RuntimeException("Fichier photo vide");
        }

        String contentType = photo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Le fichier doit être une image");
        }

        try {
            String dossier = uploadDir + File.separator + "produits";
            Path dossierPath = Paths.get(dossier);
            Files.createDirectories(dossierPath);

            String extension = "";
            String nomOriginal = photo.getOriginalFilename();
            if (nomOriginal != null && nomOriginal.contains(".")) {
                extension = nomOriginal.substring(nomOriginal.lastIndexOf('.'));
            }
            String nomFichier = "produit_" + id + "_" + System.currentTimeMillis() + extension;

            Path cible = dossierPath.resolve(nomFichier);
            photo.transferTo(cible);

            produit.setPhotoUrl("/uploads/produits/" + nomFichier);
            return produitRepository.save(produit);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de la photo", e);
        }
    }

    public void supprimerProduit(Long id, String emailReparateur) {
        Utilisateur reparateur = getReparateurParEmail(emailReparateur);
        Produit produit = getProduitParId(id);

        if (produit.getReparateur() == null || !produit.getReparateur().getId().equals(reparateur.getId())) {
            throw new RuntimeException("Ce produit ne vous appartient pas");
        }

        produitRepository.deleteById(id);
    }

    private Utilisateur getReparateurParEmail(String email) {
        return utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));
    }

    private Utilisateur getClientParEmail(String email) {
        return utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.CLIENT)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
    }
}