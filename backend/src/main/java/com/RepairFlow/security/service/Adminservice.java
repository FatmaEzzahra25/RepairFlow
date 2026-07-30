package com.RepairFlow.security.service;

import com.RepairFlow.security.auth.RegisterRequest;
import com.RepairFlow.security.config.JwtService;
import com.RepairFlow.security.email.EmailService;
import com.RepairFlow.security.model.*;
import com.RepairFlow.security.repository.CategorieProduitRepository;
import com.RepairFlow.security.repository.ProduitRepository;
import com.RepairFlow.security.repository.ReclamationRepository;
import com.RepairFlow.security.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final ReclamationRepository reclamationRepository;
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

    public Map<String, Object> getStatistiques(int jours) {
        LocalDate aujourdhui = LocalDate.now();
        LocalDate debut = aujourdhui.minusDays(jours - 1L);

        List<Produit> produits = produitRepository.findAll().stream()
                .filter(p -> p.getDateDepot() != null && !p.getDateDepot().toLocalDate().isBefore(debut))
                .toList();

        List<Reclamation> reclamations = reclamationRepository.findAll().stream()
                .filter(r -> r.getDate() != null && !r.getDate().toLocalDate().isBefore(debut))
                .toList();

        Map<String, Long> produitsParStatut = new HashMap<>();
        for (Produit p : produits) {
            String statut = p.getStatut() != null ? p.getStatut().name() : "INCONNU";
            produitsParStatut.merge(statut, 1L, Long::sum);
        }

        Map<String, Long> produitsParCategorie = new HashMap<>();
        for (Produit p : produits) {
            String cat = p.getCategorie() != null ? p.getCategorie().getLibelle() : "Non catégorisé";
            produitsParCategorie.merge(cat, 1L, Long::sum);
        }

        long reclamationsOuvertes = reclamations.stream()
                .filter(r -> "OUVERT".equalsIgnoreCase(r.getStatut()))
                .count();
        long reclamationsFermees = reclamations.size() - reclamationsOuvertes;

        boolean granulariteMois = jours > 60;
        Map<String, Long> activiteParPeriode = new LinkedHashMap<>();

        if (granulariteMois) {
            LocalDate curseur = debut.withDayOfMonth(1);
            LocalDate finMois = aujourdhui.withDayOfMonth(1);
            while (!curseur.isAfter(finMois)) {
                LocalDate moisCourant = curseur;
                long count = produits.stream()
                        .filter(p -> {
                            LocalDate d = p.getDateDepot().toLocalDate();
                            return d.getYear() == moisCourant.getYear() && d.getMonthValue() == moisCourant.getMonthValue();
                        })
                        .count();
                activiteParPeriode.put(moisCourant.getYear() + "-" + String.format("%02d", moisCourant.getMonthValue()), count);
                curseur = curseur.plusMonths(1);
            }
        } else {
            for (int i = jours - 1; i >= 0; i--) {
                LocalDate jour = aujourdhui.minusDays(i);
                long count = produits.stream()
                        .filter(p -> p.getDateDepot().toLocalDate().equals(jour))
                        .count();
                activiteParPeriode.put(jour.toString(), count);
            }
        }

        List<Utilisateur> reparateurs = utilisateurRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .toList();

        Map<String, Map<String, Long>> activiteParReparateur = new LinkedHashMap<>();
        for (Utilisateur reparateur : reparateurs) {
            String nomComplet = (reparateur.getPrenom() + " " + reparateur.getNom()).trim();
            Map<String, Long> serie = new LinkedHashMap<>();

            if (granulariteMois) {
                LocalDate curseur = debut.withDayOfMonth(1);
                LocalDate finMois = aujourdhui.withDayOfMonth(1);
                while (!curseur.isAfter(finMois)) {
                    LocalDate moisCourant = curseur;
                    long count = produits.stream()
                            .filter(p -> p.getReparateur() != null && reparateur.getId().equals(p.getReparateur().getId()))
                            .filter(p -> {
                                LocalDate d = p.getDateDepot().toLocalDate();
                                return d.getYear() == moisCourant.getYear() && d.getMonthValue() == moisCourant.getMonthValue();
                            })
                            .count();
                    serie.put(moisCourant.getYear() + "-" + String.format("%02d", moisCourant.getMonthValue()), count);
                    curseur = curseur.plusMonths(1);
                }
            } else {
                for (int i = jours - 1; i >= 0; i--) {
                    LocalDate jour = aujourdhui.minusDays(i);
                    long count = produits.stream()
                            .filter(p -> p.getReparateur() != null && reparateur.getId().equals(p.getReparateur().getId()))
                            .filter(p -> p.getDateDepot().toLocalDate().equals(jour))
                            .count();
                    serie.put(jour.toString(), count);
                }
            }

            activiteParReparateur.put(nomComplet, serie);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("periodeJours", jours);
        stats.put("granularite", granulariteMois ? "mois" : "jour");
        stats.put("totalProduitsPeriode", (long) produits.size());
        stats.put("totalReclamationsPeriode", (long) reclamations.size());
        stats.put("reclamationsOuvertes", reclamationsOuvertes);
        stats.put("reclamationsFermees", reclamationsFermees);
        stats.put("produitsParStatut", produitsParStatut);
        stats.put("produitsParCategorie", produitsParCategorie);
        stats.put("activiteParPeriode", activiteParPeriode);
        stats.put("activiteParReparateur", activiteParReparateur);

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

    public Page<Produit> listerTousLesProduits(String reparateurId, String statut, String q, int page, int size) {
        Long reparateurIdFiltre = null;
        if (reparateurId != null && !reparateurId.trim().isEmpty() && !"TOUS".equalsIgnoreCase(reparateurId.trim())) {
            try {
                reparateurIdFiltre = Long.valueOf(reparateurId.trim());
            } catch (NumberFormatException ignored) {
                // valeur inconnue -> pas de filtre plutot qu'une erreur 400
            }
        }

        StatutReparation statutFiltre = null;
        if (statut != null && !statut.trim().isEmpty() && !"TOUS".equalsIgnoreCase(statut.trim())) {
            try {
                statutFiltre = StatutReparation.valueOf(statut.trim());
            } catch (IllegalArgumentException ignored) {
                // valeur inconnue -> pas de filtre
            }
        }

        String recherche = (q == null || q.trim().isEmpty()) ? null : q.trim();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return produitRepository.findAllFiltered(reparateurIdFiltre, statutFiltre, recherche, pageable);
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