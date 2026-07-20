package com.RepairFlow.security.controller;

import com.RepairFlow.security.email.EmailService;
import com.RepairFlow.security.user.*;
import com.RepairFlow.security.user.repository.ProduitRepository;
import com.RepairFlow.security.user.repository.ReclamationRepository;
import com.RepairFlow.security.user.repository.RegisterRequestClient;
import com.RepairFlow.security.user.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reparateur")
@RequiredArgsConstructor
public class ReparateurController {

    private final UtilisateurRepository utilisateurRepository;
    private final ProduitRepository produitRepository;
    private final ReclamationRepository reclamationRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;


    @PostMapping("/clients")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Utilisateur> creerClient(@RequestBody RegisterRequestClient request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur reparateur = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));

        var client = Utilisateur.builder()
                .prenom(request.getPrenom())
                .nom(request.getNom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .role(Role.CLIENT)
                .reparateur(reparateur)
                .build();

        Utilisateur saved = utilisateurRepository.save(client);

        emailService.envoyerIdentifiantsClient(
                request.getEmail(),
                request.getPrenom(),
                request.getMotDePasse()
        );

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/clients")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<List<Utilisateur>> listerClients() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur reparateur = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));

        List<Produit> produitsReparateur = produitRepository.findByReparateur(reparateur);
        List<Long> clientIdsViaProduits = produitsReparateur.stream()
                .filter(p -> p.getClient() != null)
                .map(p -> p.getClient().getId())
                .distinct()
                .toList();

        List<Utilisateur> clients = utilisateurRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CLIENT)
                .filter(u ->
                        (u.getReparateur() != null && u.getReparateur().getId().equals(reparateur.getId()))
                                || clientIdsViaProduits.contains(u.getId())
                )
                .toList();

        return ResponseEntity.ok(clients);
    }

    @PutMapping("/clients/{id}")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Utilisateur> modifierClient(@PathVariable Long id, @RequestBody RegisterRequestClient request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur reparateur = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));

        Utilisateur client = utilisateurRepository.findById(id)
                .filter(u -> u.getRole() == Role.CLIENT)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        boolean appartientAuReparateur =
                (client.getReparateur() != null && client.getReparateur().getId().equals(reparateur.getId()))
                        || produitRepository.findByClient(client).stream()
                        .anyMatch(p -> p.getReparateur() != null && p.getReparateur().getId().equals(reparateur.getId()));

        if (!appartientAuReparateur) {
            throw new RuntimeException("Ce client est géré par un autre réparateur");
        }

        client.setPrenom(request.getPrenom());
        client.setNom(request.getNom());
        client.setEmail(request.getEmail());
        client.setTelephone(request.getTelephone());
        client.setAdresse(request.getAdresse());

        if (request.getMotDePasse() != null && !request.getMotDePasse().trim().isEmpty()) {

            client.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));

            emailService.envoyerIdentifiantsClient(
                    request.getEmail(),
                    request.getPrenom(),
                    request.getMotDePasse()
            );
        }

        return ResponseEntity.ok(utilisateurRepository.save(client));
    }

    @DeleteMapping("/clients/{id}")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Void> supprimerClient(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur reparateur = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));

        Utilisateur client = utilisateurRepository.findById(id)
                .filter(u -> u.getRole() == Role.CLIENT)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        List<Produit> produitsClient = produitRepository.findByClient(client);

        boolean appartientAAutreReparateur;
        if (client.getReparateur() != null) {
            appartientAAutreReparateur = !client.getReparateur().getId().equals(reparateur.getId());
        } else {
            boolean hasProductsWithReparateur = produitsClient.stream()
                    .anyMatch(p -> p.getReparateur() != null && p.getReparateur().getId().equals(reparateur.getId()));
            appartientAAutreReparateur = !produitsClient.isEmpty() && !hasProductsWithReparateur;
        }

        if (appartientAAutreReparateur) {
            throw new RuntimeException("Ce client est géré par un autre réparateur");
        }

        utilisateurRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/reclamations")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<List<Reclamation>> listerReclamations() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur reparateur = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));

        List<Reclamation> reclamations = reclamationRepository.findAll().stream()
                .filter(r -> r.getProduit() != null
                        && r.getProduit().getReparateur() != null
                        && r.getProduit().getReparateur().getId().equals(reparateur.getId()))
                .toList();

        return ResponseEntity.ok(reclamations);
    }

    @PutMapping("/reclamations/{id}/cloturer")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Reclamation> cloturerReclamation(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur reparateur = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));

        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réclamation non trouvée"));

        Produit produit = reclamation.getProduit();
        if (produit == null || produit.getReparateur() == null || !produit.getReparateur().getId().equals(reparateur.getId())) {
            throw new RuntimeException("Cette réclamation est gérée par un autre réparateur");
        }

        reclamation.setStatut("FERME");
        Reclamation saved = reclamationRepository.save(reclamation);

        if (produit.getClient() != null && produit.getClient().getEmail() != null) {
            emailService.envoyerReclamationFermee(
                    produit.getClient().getEmail(),
                    produit.getClient().getPrenom(),
                    produit.getNom()
            );
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Map<String, Object>> getStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Utilisateur reparateur = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));

        List<Produit> produits = produitRepository.findByReparateur(reparateur);

        List<Long> clientIdsViaProduits = produits.stream()
                .filter(p -> p.getClient() != null)
                .map(p -> p.getClient().getId())
                .distinct()
                .toList();

        List<Utilisateur> clients = utilisateurRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CLIENT)
                .filter(u ->
                        (u.getReparateur() != null && u.getReparateur().getId().equals(reparateur.getId()))
                                || clientIdsViaProduits.contains(u.getId())
                )
                .toList();

        List<Reclamation> reclamations = reclamationRepository.findAll().stream()
                .filter(r -> "OUVERT".equals(r.getStatut()))
                .filter(r -> r.getProduit() != null
                        && r.getProduit().getReparateur() != null
                        && r.getProduit().getReparateur().getId().equals(reparateur.getId()))
                .toList();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProduits", produits.size());
        stats.put("produitsEnCours", produits.stream().filter(p -> p.getStatut() == StatutReparation.EN_COURS).count());
        stats.put("produitsRepares", produits.stream().filter(p -> p.getStatut() == StatutReparation.REPARE).count());
        stats.put("totalClients", clients.size());
        stats.put("reclamationsOuvertes", reclamations.size());

        return ResponseEntity.ok(stats);
    }
}