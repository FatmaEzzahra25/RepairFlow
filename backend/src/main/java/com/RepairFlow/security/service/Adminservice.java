package com.RepairFlow.security.service;

import com.RepairFlow.security.auth.RegisterRequest;
import com.RepairFlow.security.email.EmailService;
import com.RepairFlow.security.model.*;
import com.RepairFlow.security.config.JwtService;
import com.RepairFlow.security.repository.CategorieProduitRepository;
import com.RepairFlow.security.repository.ProduitRepository;
import com.RepairFlow.security.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class Adminservice {

    private final UtilisateurRepository utilisateurRepository;
    private final ProduitRepository produitRepository;
    private final CategorieProduitRepository categorieProduitRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public Map<String, Object> getDashboard() {
        List<Utilisateur> utilisateurs = utilisateurRepository.findAll();
        List<Produit> produits = produitRepository.findAll();

        long totalReparateurs = utilisateurs.stream().filter(u -> u.getRole() == Role.REPARATEUR).count();
        long totalClients = utilisateurs.stream().filter(u -> u.getRole() == Role.CLIENT).count();

        Map<String, Long> produitsParCategorie = new HashMap<>();
        for (Produit p : produits) {
            String cat = p.getCategorie() != null ? p.getCategorie().getLibelle() : "Non catégorisé";
            produitsParCategorie.put(cat, produitsParCategorie.getOrDefault(cat, 0L) + 1);
        }

        Map<String, Long> produitsParStatut = new HashMap<>();
        for (Produit p : produits) {
            String statut = p.getStatut() != null ? p.getStatut().name() : "INCONNU";
            produitsParStatut.put(statut, produitsParStatut.getOrDefault(statut, 0L) + 1);
        }

        Map<String, Long> activiteParJour = new LinkedHashMap<>();
        LocalDate aujourdhui = LocalDate.now();
        for (int i = 15; i >= 0; i--) {
            LocalDate jour = aujourdhui.minusDays(i);
            long count = produits.stream()
                    .filter(p -> p.getDateDepot() != null && p.getDateDepot().toLocalDate().equals(jour))
                    .count();
            activiteParJour.put(jour.toString(), count);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUtilisateurs", (long) utilisateurs.size());
        stats.put("totalReparateurs", totalReparateurs);
        stats.put("totalClients", totalClients);
        stats.put("totalProduits", produits.size());
        stats.put("produitsParCategorie", produitsParCategorie);
        stats.put("produitsParStatut", produitsParStatut);
        stats.put("activiteParJour", activiteParJour);

        return stats;
    }

    public List<Utilisateur> getReparateurs() {
        return utilisateurRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .toList();
    }

    public String creerReparateur(RegisterRequest request) {
        var reparateur = Utilisateur.builder()
                .prenom(request.getPrenom())
                .nom(request.getNom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .role(Role.REPARATEUR)
                .build();

        utilisateurRepository.save(reparateur);

        emailService.envoyerIdentifiantsReparateur(
                request.getEmail(),
                request.getPrenom(),
                request.getMotDePasse()
        );

        return jwtService.generateToken(reparateur);
    }

    public Utilisateur modifierReparateur(Long id, RegisterRequest request) {
        Utilisateur reparateur = utilisateurRepository.findById(id)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));

        reparateur.setPrenom(request.getPrenom());
        reparateur.setNom(request.getNom());
        reparateur.setEmail(request.getEmail());
        reparateur.setTelephone(request.getTelephone());
        reparateur.setAdresse(request.getAdresse());

        if (request.getMotDePasse() != null && !request.getMotDePasse().isEmpty()) {
            reparateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
            emailService.envoyerMotDePasseModifieReparateur(
                    reparateur.getEmail(),
                    reparateur.getPrenom(),
                    request.getMotDePasse()
            );
        }

        return utilisateurRepository.save(reparateur);
    }

    public void supprimerReparateur(Long id) {
        utilisateurRepository.deleteById(id);
    }

    public CategorieProduit creerCategorie(CategorieProduit categorie) {
        return categorieProduitRepository.save(categorie);
    }

    public List<CategorieProduit> listerCategories() {
        List<CategorieProduit> categories = categorieProduitRepository.findAll();
        List<Produit> tousLesProduits = produitRepository.findAll();

        for (CategorieProduit cat : categories) {
            long count = tousLesProduits.stream()
                    .filter(p -> p.getCategorie() != null && p.getCategorie().getId().equals(cat.getId()))
                    .count();
            cat.setNbProduits((int) count);
        }

        return categories;
    }

    public CategorieProduit modifierCategorie(Long id, CategorieProduit categorie) {
        CategorieProduit existing = categorieProduitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        existing.setLibelle(categorie.getLibelle());
        existing.setDescription(categorie.getDescription());
        return categorieProduitRepository.save(existing);
    }

    public void supprimerCategorie(Long id) {
        categorieProduitRepository.deleteById(id);
    }

    public List<Produit> listerTousLesProduits() {
        return produitRepository.findAll();
    }

    public Produit getProduit(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
    }

    public void supprimerProduit(Long id) {
        if (!produitRepository.existsById(id)) {
            throw new RuntimeException("Produit non trouvé");
        }
        produitRepository.deleteById(id);
    }
}