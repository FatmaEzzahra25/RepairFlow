package com.RepairFlow.security.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String descriptionPanne;
    private LocalDateTime dateDepot;
    private String observation;
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    private StatutReparation statut;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Utilisateur client;

    @ManyToOne
    @JoinColumn(name = "reparateur_id")
    private Utilisateur reparateur;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private CategorieProduit categorie;

    @JsonIgnore
    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL)
    private java.util.List<Reclamation> reclamations;
}