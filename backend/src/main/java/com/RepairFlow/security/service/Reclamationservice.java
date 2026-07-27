package com.RepairFlow.security.service;

import com.RepairFlow.security.email.EmailService;
import com.RepairFlow.security.user.Produit;
import com.RepairFlow.security.user.Reclamation;
import com.RepairFlow.security.user.Role;
import com.RepairFlow.security.user.Utilisateur;
import com.RepairFlow.security.user.repository.ProduitRepository;
import com.RepairFlow.security.user.repository.ReclamationRepository;
import com.RepairFlow.security.user.repository.ReclamationRequest;
import com.RepairFlow.security.user.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class Reclamationservice {

    private final ReclamationRepository reclamationRepository;
    private final ProduitRepository produitRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EmailService emailService;

    public Reclamation creerReclamation(ReclamationRequest request, String emailClient) {
        Utilisateur client = utilisateurRepository.findByEmail(emailClient)
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

        return saved;
    }

    public List<Reclamation> getReclamationsDuClient(String emailClient) {
        Utilisateur client = utilisateurRepository.findByEmail(emailClient)
                .filter(u -> u.getRole() == Role.CLIENT)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        return reclamationRepository.findByProduitClient(client);
    }
}