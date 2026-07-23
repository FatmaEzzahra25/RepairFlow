package com.RepairFlow.security.controller;

import com.RepairFlow.security.auth.AuthenticationResponse;
import com.RepairFlow.security.auth.RegisterRequest;
import com.RepairFlow.security.email.EmailService;
import com.RepairFlow.security.user.*;
import com.RepairFlow.security.user.config.JwtService;
import com.RepairFlow.security.user.repository.CategorieProduitRepository;
import com.RepairFlow.security.user.repository.ProduitRepository;
import com.RepairFlow.security.user.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UtilisateurRepository utilisateurRepository;
    private final ProduitRepository produitRepository;
    private final CategorieProduitRepository categorieProduitRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        List<Utilisateur> utilisateurs = utilisateurRepository.findAll();
        List<Produit> produits = produitRepository.findAll();

        long totalUtilisateurs = utilisateurs.size();
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

        Map<String, Long> activiteParJour = new java.util.LinkedHashMap<>();
        java.time.LocalDate aujourdhui = java.time.LocalDate.now();
        for (int i = 15; i >= 0; i--) {
            java.time.LocalDate jour = aujourdhui.minusDays(i);
            long count = produits.stream()
                    .filter(p -> p.getDateDepot() != null && p.getDateDepot().toLocalDate().equals(jour))
                    .count();
            activiteParJour.put(jour.toString(), count);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUtilisateurs", totalUtilisateurs);
        stats.put("totalReparateurs", totalReparateurs);
        stats.put("totalClients", totalClients);
        stats.put("totalProduits", produits.size());
        stats.put("produitsParCategorie", produitsParCategorie);
        stats.put("produitsParStatut", produitsParStatut);
        stats.put("activiteParJour", activiteParJour);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reparateurs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Utilisateur>> getReparateurs() {
        List<Utilisateur> reparateurs = utilisateurRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .toList();

        return ResponseEntity.ok(reparateurs);
    }

    @PostMapping("/reparateurs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthenticationResponse> creerReparateur(@RequestBody RegisterRequest request) {

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

        var jwtToken = jwtService.generateToken(reparateur);
        return ResponseEntity.ok(AuthenticationResponse.builder().token(jwtToken).build());
    }

    @PutMapping("/reparateurs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Utilisateur> modifierReparateur(@PathVariable Long id, @RequestBody RegisterRequest request) {
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
        return ResponseEntity.ok(utilisateurRepository.save(reparateur));
    }

    @DeleteMapping("/reparateurs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimerReparateur(@PathVariable Long id) {
        utilisateurRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategorieProduit> creerCategorie(@RequestBody CategorieProduit categorie) {
        return ResponseEntity.ok(categorieProduitRepository.save(categorie));
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'REPARATEUR')")
    public ResponseEntity<List<CategorieProduit>> listerCategories() {
        List<CategorieProduit> categories = categorieProduitRepository.findAll();
        List<Produit> tousLesProduits = produitRepository.findAll();

        for (CategorieProduit cat : categories) {
            long count = tousLesProduits.stream()
                    .filter(p -> p.getCategorie() != null && p.getCategorie().getId().equals(cat.getId()))
                    .count();
            cat.setNbProduits((int) count);
        }

        return ResponseEntity.ok(categories);
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategorieProduit> modifierCategorie(@PathVariable Long id, @RequestBody CategorieProduit categorie) {
        CategorieProduit existing = categorieProduitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        existing.setLibelle(categorie.getLibelle());
        existing.setDescription(categorie.getDescription());
        return ResponseEntity.ok(categorieProduitRepository.save(existing));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimerCategorie(@PathVariable Long id) {
        categorieProduitRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/produits")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Produit>> listerTousLesProduits() {
        return ResponseEntity.ok(produitRepository.findAll());
    }

    @GetMapping("/produits/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Produit> getProduit(@PathVariable Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        return ResponseEntity.ok(produit);
    }

    @DeleteMapping("/produits/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimerProduit(@PathVariable Long id) {
        if (!produitRepository.existsById(id)) {
            throw new RuntimeException("Produit non trouvé");
        }
        produitRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}