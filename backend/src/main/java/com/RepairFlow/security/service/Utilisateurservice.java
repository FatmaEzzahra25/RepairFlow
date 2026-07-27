package com.RepairFlow.security.service;

import com.RepairFlow.security.user.Utilisateur;
import com.RepairFlow.security.user.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class Utilisateurservice {

    private final UtilisateurRepository utilisateurRepository;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public Utilisateur getUtilisateurConnecte() {
        return (Utilisateur) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public Utilisateur mettreAJourProfil(Map<String, String> body) {
        Utilisateur user = utilisateurRepository.findById(getUtilisateurConnecte().getId())
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

        return utilisateurRepository.save(user);
    }

    public Utilisateur uploaderPhotoProfil(MultipartFile photo) {
        Utilisateur user = utilisateurRepository.findById(getUtilisateurConnecte().getId())
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
            return utilisateurRepository.save(user);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de la photo", e);
        }
    }
}