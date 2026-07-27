package com.RepairFlow.security.controller;

import com.RepairFlow.security.user.Utilisateur;
import com.RepairFlow.security.user.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurRepository utilisateurRepository;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    private Utilisateur getCurrentUser() {
        return (Utilisateur) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Utilisateur> me() {
        return ResponseEntity.ok(getCurrentUser());
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Utilisateur> updateMe(@RequestBody Map<String, String> body) {
        Utilisateur user = utilisateurRepository.findById(getCurrentUser().getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (body.containsKey("nom")) {
            user.setNom(body.get("nom"));
        }
        if (body.containsKey("prenom")) {
            user.setPrenom(body.get("prenom"));
        }
        if (body.containsKey("telephone")) {
            user.setTelephone(body.get("telephone"));
        }
        if (body.containsKey("adresse")) {
            user.setAdresse(body.get("adresse"));
        }

        return ResponseEntity.ok(utilisateurRepository.save(user));
    }

    @PostMapping("/me/photo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Utilisateur> uploaderPhoto(@RequestParam("photo") MultipartFile photo) {
        Utilisateur user = utilisateurRepository.findById(getCurrentUser().getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (photo.isEmpty()) {
            throw new RuntimeException("Fichier photo vide");
        }

        String contentType = photo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Le fichier doit être une image");
        }

        try {
            String dossier = uploadDir + File.separator + "avatars";
            Path dossierPath = Paths.get(dossier);
            Files.createDirectories(dossierPath);

            String extension = "";
            String nomOriginal = photo.getOriginalFilename();
            if (nomOriginal != null && nomOriginal.contains(".")) {
                extension = nomOriginal.substring(nomOriginal.lastIndexOf('.'));
            }
            String nomFichier = "avatar_" + user.getId() + "_" + System.currentTimeMillis() + extension;

            Path cible = dossierPath.resolve(nomFichier);
            photo.transferTo(cible);

            user.setPhotoUrl("/uploads/avatars/" + nomFichier);
            return ResponseEntity.ok(utilisateurRepository.save(user));
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de la photo", e);
        }
    }
}