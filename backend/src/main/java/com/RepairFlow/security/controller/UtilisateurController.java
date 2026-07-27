package com.RepairFlow.security.controller;

import com.RepairFlow.security.service.Utilisateurservice;
import com.RepairFlow.security.user.Utilisateur;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final Utilisateurservice utilisateurService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Utilisateur> me() {
        return ResponseEntity.ok(utilisateurService.getUtilisateurConnecte());
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Utilisateur> updateMe(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(utilisateurService.mettreAJourProfil(body));
    }

    @PostMapping("/me/photo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Utilisateur> uploaderPhoto(@RequestParam("photo") MultipartFile photo) {
        return ResponseEntity.ok(utilisateurService.uploaderPhotoProfil(photo));
    }
}