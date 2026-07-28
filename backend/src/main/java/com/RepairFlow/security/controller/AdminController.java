package com.RepairFlow.security.controller;

import com.RepairFlow.security.auth.AuthenticationResponse;
import com.RepairFlow.security.auth.RegisterRequest;
import com.RepairFlow.security.model.CategorieProduit;
import com.RepairFlow.security.model.Produit;
import com.RepairFlow.security.model.Utilisateur;
import com.RepairFlow.security.service.Adminservice;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final Adminservice adminService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/reparateurs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Utilisateur>> getReparateurs() {
        return ResponseEntity.ok(adminService.getReparateurs());
    }

    @PostMapping("/reparateurs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthenticationResponse> creerReparateur(@RequestBody RegisterRequest request) {
        String token = adminService.creerReparateur(request);
        return ResponseEntity.ok(AuthenticationResponse.builder().token(token).build());
    }

    @PutMapping("/reparateurs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Utilisateur> modifierReparateur(@PathVariable Long id, @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(adminService.modifierReparateur(id, request));
    }

    @DeleteMapping("/reparateurs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimerReparateur(@PathVariable Long id) {
        adminService.supprimerReparateur(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategorieProduit> creerCategorie(@RequestBody CategorieProduit categorie) {
        return ResponseEntity.ok(adminService.creerCategorie(categorie));
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'REPARATEUR')")
    public ResponseEntity<List<CategorieProduit>> listerCategories() {
        return ResponseEntity.ok(adminService.listerCategories());
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategorieProduit> modifierCategorie(@PathVariable Long id, @RequestBody CategorieProduit categorie) {
        return ResponseEntity.ok(adminService.modifierCategorie(id, categorie));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimerCategorie(@PathVariable Long id) {
        adminService.supprimerCategorie(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/produits")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Produit>> listerTousLesProduits(
            @RequestParam(required = false) String reparateurId,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(adminService.listerTousLesProduits(reparateurId, statut, q));
    }

    @GetMapping("/produits/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Produit> getProduit(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getProduit(id));
    }

    @DeleteMapping("/produits/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimerProduit(@PathVariable Long id) {
        adminService.supprimerProduit(id);
        return ResponseEntity.ok().build();
    }
}