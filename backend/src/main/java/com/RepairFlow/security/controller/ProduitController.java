package com.RepairFlow.security.controller;

import com.RepairFlow.security.email.EmailService;
import com.RepairFlow.security.user.*;
import com.RepairFlow.security.user.repository.CategorieProduitRepository;
import com.RepairFlow.security.user.repository.ProduitRepository;
import com.RepairFlow.security.user.repository.ProduitRequest;
import com.RepairFlow.security.user.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/produits")
@RequiredArgsConstructor
public class ProduitController {

    private final ProduitRepository produitRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CategorieProduitRepository categorieProduitRepository;
    private final EmailService emailService;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;


    @GetMapping
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<List<Produit>> getProduits() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur reparateur = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));
        return ResponseEntity.ok(produitRepository.findByReparateur(reparateur));
    }

    @PostMapping
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Produit> creerProduit(@RequestBody ProduitRequest request) {

        Utilisateur client = utilisateurRepository.findByEmail(request.getClientEmail())
                .filter(u -> u.getRole() == Role.CLIENT)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur reparateur = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));

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

        return ResponseEntity.ok(produitRepository.save(produit));
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Produit> modifierStatut(@PathVariable Long id, @RequestParam StatutReparation statut) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

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

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/observation")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Produit> modifierObservation(@PathVariable Long id, @RequestParam String observation) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        produit.setObservation(observation);
        return ResponseEntity.ok(produitRepository.save(produit));
    }

    @PostMapping("/{id}/photo")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Produit> uploaderPhoto(@PathVariable Long id, @RequestParam("photo") org.springframework.web.multipart.MultipartFile photo) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        if (photo.isEmpty()) {
            throw new RuntimeException("Fichier photo vide");
        }

        String contentType = photo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Le fichier doit être une image");
        }

        try {
            String dossier = uploadDir + File.separator + "produits";
            java.nio.file.Path dossierPath = java.nio.file.Paths.get(dossier);
            java.nio.file.Files.createDirectories(dossierPath);

            String extension = "";
            String nomOriginal = photo.getOriginalFilename();
            if (nomOriginal != null && nomOriginal.contains(".")) {
                extension = nomOriginal.substring(nomOriginal.lastIndexOf('.'));
            }
            String nomFichier = "produit_" + id + "_" + System.currentTimeMillis() + extension;

            java.nio.file.Path cible = dossierPath.resolve(nomFichier);
            photo.transferTo(cible);

            produit.setPhotoUrl("/uploads/produits/" + nomFichier);
            return ResponseEntity.ok(produitRepository.save(produit));
        } catch (java.io.IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de la photo", e);
        }
    }

    @GetMapping("/mes-produits")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<Produit>> mesProduits() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Utilisateur client = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.CLIENT)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        return ResponseEntity.ok(produitRepository.findByClient(client));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produit> getProduit(@PathVariable Long id) {
        return ResponseEntity.ok(produitRepository.findById(id).orElseThrow());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Void> supprimerProduit(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur reparateur = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));

        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        if (produit.getReparateur() == null || !produit.getReparateur().getId().equals(reparateur.getId())) {
            throw new RuntimeException("Ce produit ne vous appartient pas");
        }

        produitRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}