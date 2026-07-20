package com.RepairFlow.security.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorieProduit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String libelle;
    private String description;

    @JsonIgnore
    @OneToMany(mappedBy = "categorie")
    private List<Produit> produits;

    @Transient
    private Integer nbProduits;
}