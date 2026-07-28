package com.RepairFlow.security.controller;

import com.RepairFlow.security.service.Reclamationservice;
import com.RepairFlow.security.model.Reclamation;
import com.RepairFlow.security.repository.ReclamationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reclamations")
@RequiredArgsConstructor
public class ReclamationController {

    private final Reclamationservice reclamationService;

    private String emailUtilisateurConnecte() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Reclamation> creerReclamation(@RequestBody ReclamationRequest request) {
        return ResponseEntity.ok(reclamationService.creerReclamation(request, emailUtilisateurConnecte()));
    }

    @GetMapping("/mes-reclamations")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<Reclamation>> mesReclamations(@RequestParam(required = false) String statut) {
        return ResponseEntity.ok(reclamationService.getReclamationsDuClient(emailUtilisateurConnecte(), statut));
    }
}