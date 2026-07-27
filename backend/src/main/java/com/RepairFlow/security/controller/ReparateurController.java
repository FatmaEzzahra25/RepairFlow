package com.RepairFlow.security.controller;

import com.RepairFlow.security.service.Reparateurcontroller;
import com.RepairFlow.security.model.Reclamation;
import com.RepairFlow.security.model.Utilisateur;
import com.RepairFlow.security.repository.RegisterRequestClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reparateur")
@RequiredArgsConstructor
public class ReparateurController {

    private final Reparateurcontroller reparateurService;

    private String emailUtilisateurConnecte() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/clients")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Utilisateur> creerClient(@RequestBody RegisterRequestClient request) {
        return ResponseEntity.ok(reparateurService.creerClient(request, emailUtilisateurConnecte()));
    }

    @GetMapping("/clients")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<List<Utilisateur>> listerClients() {
        return ResponseEntity.ok(reparateurService.listerClients(emailUtilisateurConnecte()));
    }

    @PutMapping("/clients/{id}")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Utilisateur> modifierClient(@PathVariable Long id, @RequestBody RegisterRequestClient request) {
        return ResponseEntity.ok(reparateurService.modifierClient(id, request, emailUtilisateurConnecte()));
    }

    @DeleteMapping("/clients/{id}")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Void> supprimerClient(@PathVariable Long id) {
        reparateurService.supprimerClient(id, emailUtilisateurConnecte());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/reclamations")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<List<Reclamation>> listerReclamations() {
        return ResponseEntity.ok(reparateurService.listerReclamations(emailUtilisateurConnecte()));
    }

    @PutMapping("/reclamations/{id}/cloturer")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Reclamation> cloturerReclamation(@PathVariable Long id) {
        return ResponseEntity.ok(reparateurService.cloturerReclamation(id, emailUtilisateurConnecte()));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(reparateurService.getStats(emailUtilisateurConnecte()));
    }
}