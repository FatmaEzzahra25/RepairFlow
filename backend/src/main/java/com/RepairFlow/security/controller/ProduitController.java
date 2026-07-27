package com.RepairFlow.security.controller;

import com.RepairFlow.security.service.ProduitService;
import com.RepairFlow.security.user.Produit;
import com.RepairFlow.security.user.StatutReparation;
import com.RepairFlow.security.user.repository.ProduitRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/produits")
@RequiredArgsConstructor
public class ProduitController {

    private final ProduitService produitService;

    private String emailUtilisateurConnecte() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<List<Produit>> getProduits() {
        return ResponseEntity.ok(produitService.getProduitsDuReparateur(emailUtilisateurConnecte()));
    }

    @PostMapping
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Produit> creerProduit(@RequestBody ProduitRequest request) {
        return ResponseEntity.ok(produitService.creerProduit(request, emailUtilisateurConnecte()));
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Produit> modifierStatut(@PathVariable Long id, @RequestParam StatutReparation statut) {
        return ResponseEntity.ok(produitService.modifierStatut(id, statut));
    }

    @PutMapping("/{id}/observation")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Produit> modifierObservation(@PathVariable Long id, @RequestParam String observation) {
        return ResponseEntity.ok(produitService.modifierObservation(id, observation));
    }

    @PostMapping("/{id}/photo")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Produit> uploaderPhoto(@PathVariable Long id, @RequestParam("photo") MultipartFile photo) {
        return ResponseEntity.ok(produitService.uploaderPhoto(id, photo));
    }

    @GetMapping("/mes-produits")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<Produit>> mesProduits() {
        return ResponseEntity.ok(produitService.getProduitsDuClient(emailUtilisateurConnecte()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produit> getProduit(@PathVariable Long id) {
        return ResponseEntity.ok(produitService.getProduitParId(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('REPARATEUR')")
    public ResponseEntity<Void> supprimerProduit(@PathVariable Long id) {
        produitService.supprimerProduit(id, emailUtilisateurConnecte());
        return ResponseEntity.ok().build();
    }
}