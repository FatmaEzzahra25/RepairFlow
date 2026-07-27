package com.RepairFlow.security.service;

import com.RepairFlow.security.email.EmailService;
import com.RepairFlow.security.user.*;
import com.RepairFlow.security.user.repository.ProduitRepository;
import com.RepairFlow.security.user.repository.ReclamationRepository;
import com.RepairFlow.security.user.repository.RegisterRequestClient;
import com.RepairFlow.security.user.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class Reparateurcontroller {

    private final UtilisateurRepository utilisateurRepository;
    private final ProduitRepository produitRepository;
    private final ReclamationRepository reclamationRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public Utilisateur creerClient(RegisterRequestClient request, String emailReparateur) {
        Utilisateur reparateur = getReparateurParEmail(emailReparateur);

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

        return saved;
    }

    public List<Utilisateur> listerClients(String emailReparateur) {
        Utilisateur reparateur = getReparateurParEmail(emailReparateur);
        return getClientsDuReparateur(reparateur);
    }

    public Utilisateur modifierClient(Long id, RegisterRequestClient request, String emailReparateur) {
        Utilisateur reparateur = getReparateurParEmail(emailReparateur);
        Utilisateur client = getClientParId(id);

        if (!clientAppartientAuReparateur(client, reparateur)) {
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

        return utilisateurRepository.save(client);
    }

    public void supprimerClient(Long id, String emailReparateur) {
        Utilisateur reparateur = getReparateurParEmail(emailReparateur);
        Utilisateur client = getClientParId(id);

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
    }

    public List<Reclamation> listerReclamations(String emailReparateur) {
        Utilisateur reparateur = getReparateurParEmail(emailReparateur);
        return reclamationRepository.findAll().stream()
                .filter(r -> r.getProduit() != null
                        && r.getProduit().getReparateur() != null
                        && r.getProduit().getReparateur().getId().equals(reparateur.getId()))
                .toList();
    }

    public Reclamation cloturerReclamation(Long id, String emailReparateur) {
        Utilisateur reparateur = getReparateurParEmail(emailReparateur);

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

        return saved;
    }

    public Map<String, Object> getStats(String emailReparateur) {
        Utilisateur reparateur = getReparateurParEmail(emailReparateur);
        List<Produit> produits = produitRepository.findByReparateur(reparateur);
        List<Utilisateur> clients = getClientsDuReparateur(reparateur);

        List<Reclamation> reclamationsOuvertes = reclamationRepository.findAll().stream()
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
        stats.put("reclamationsOuvertes", reclamationsOuvertes.size());

        return stats;
    }

    private List<Utilisateur> getClientsDuReparateur(Utilisateur reparateur) {
        List<Produit> produitsReparateur = produitRepository.findByReparateur(reparateur);
        List<Long> clientIdsViaProduits = produitsReparateur.stream()
                .filter(p -> p.getClient() != null)
                .map(p -> p.getClient().getId())
                .distinct()
                .toList();

        return utilisateurRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CLIENT)
                .filter(u ->
                        (u.getReparateur() != null && u.getReparateur().getId().equals(reparateur.getId()))
                                || clientIdsViaProduits.contains(u.getId())
                )
                .toList();
    }

    private boolean clientAppartientAuReparateur(Utilisateur client, Utilisateur reparateur) {
        return (client.getReparateur() != null && client.getReparateur().getId().equals(reparateur.getId()))
                || produitRepository.findByClient(client).stream()
                .anyMatch(p -> p.getReparateur() != null && p.getReparateur().getId().equals(reparateur.getId()));
    }

    private Utilisateur getReparateurParEmail(String email) {
        return utilisateurRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.REPARATEUR)
                .orElseThrow(() -> new RuntimeException("Réparateur non trouvé"));
    }

    private Utilisateur getClientParId(Long id) {
        return utilisateurRepository.findById(id)
                .filter(u -> u.getRole() == Role.CLIENT)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
    }
}