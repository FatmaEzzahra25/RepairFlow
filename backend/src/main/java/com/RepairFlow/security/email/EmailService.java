package com.RepairFlow.security.email;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public void envoyerIdentifiantsClient(String email, String prenom, String motDePasseClair) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("RepairFlow - Vos identifiants de connexion");
            message.setText(
                    "Bonjour " + prenom + ",\n\n" +
                            "Un compte a été créé pour vous sur RepairFlow.\n\n" +
                            "Voici vos identifiants de connexion :\n" +
                            "Email : " + email + "\n" +
                            "Mot de passe : " + motDePasseClair + "\n\n" +
                            "Nous vous recommandons de changer ce mot de passe après votre première connexion.\n\n" +
                            "Cordialement,\nL'équipe RepairFlow"
            );
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Échec de l'envoi de l'email à {} : {}", email, e.getMessage());
        }
    }

    public void envoyerProduitPret(String email, String prenom, String nomProduit) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("RepairFlow - Votre produit est prêt !");
            message.setText(
                    "Bonjour " + prenom + ",\n\n" +
                            "Bonne nouvelle : votre produit \"" + nomProduit + "\" est prêt.\n" +
                            "Vous pouvez venir le récupérer à l'atelier.\n\n" +
                            "Vous pouvez également suivre le détail de votre réparation depuis votre espace client RepairFlow.\n\n" +
                            "Cordialement,\nL'équipe RepairFlow"
            );
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Échec de l'envoi de l'email à {} : {}", email, e.getMessage());
        }
    }

    public void envoyerNouvelleReclamation(String email, String prenom, String nomProduit, String description) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("RepairFlow - Nouvelle réclamation reçue");
            message.setText(
                    "Bonjour " + prenom + ",\n\n" +
                            "Un client a ouvert une réclamation concernant le produit \"" + nomProduit + "\".\n\n" +
                            "Description : " + description + "\n\n" +
                            "Connectez-vous à votre espace réparateur RepairFlow pour la consulter et y répondre.\n\n" +
                            "Cordialement,\nL'équipe RepairFlow"
            );
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Échec de l'envoi de l'email à {} : {}", email, e.getMessage());
        }
    }

    public void envoyerReclamationFermee(String email, String prenom, String nomProduit) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("RepairFlow - Votre réclamation a été clôturée");
            message.setText(
                    "Bonjour " + prenom + ",\n\n" +
                            "Votre réclamation concernant le produit \"" + nomProduit + "\" a été clôturée par le réparateur.\n\n" +
                            "Si vous pensez que le problème n'est pas résolu, vous pouvez ouvrir une nouvelle réclamation depuis votre espace client.\n\n" +
                            "Cordialement,\nL'équipe RepairFlow"
            );
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Échec de l'envoi de l'email à {} : {}", email, e.getMessage());
        }
    }
}