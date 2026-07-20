package com.RepairFlow.security.controller;

import com.RepairFlow.security.email.EmailService;
import com.RepairFlow.security.user.*;
import com.RepairFlow.security.user.repository.ProduitRepository;
import com.RepairFlow.security.user.repository.ReclamationRepository;
import com.RepairFlow.security.user.repository.ReclamationRequest;
import com.RepairFlow.security.user.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reclamations")
@RequiredArgsConstructor
public class ReclamationController {

    private final ReclamationRepository reclamationRepository;
    private final ProduitRepository produitRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EmailService emailService;

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Reclamation> creerReclamation(@RequestBody ReclamationRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur client = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.CLIENT)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Produit produit = produitRepository.findById(request.getProduitId())
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        if (!produit.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Ce produit ne vous appartient pas");
        }

        Reclamation reclamation = Reclamation.builder()
                .date(LocalDateTime.now())
                .description(request.getDescription())
                .statut("OUVERT")
                .produit(produit)
                .build();

        Reclamation saved = reclamationRepository.save(reclamation);

        Utilisateur reparateur = produit.getReparateur();
        if (reparateur != null && reparateur.getEmail() != null) {
            emailService.envoyerNouvelleReclamation(
                    reparateur.getEmail(),
                    reparateur.getPrenom(),
                    produit.getNom(),
                    request.getDescription()
            );
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/mes-reclamations")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<Reclamation>> mesReclamations() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur client = utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.CLIENT)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        return ResponseEntity.ok(reclamationRepository.findByProduitClient(client));
    }


}