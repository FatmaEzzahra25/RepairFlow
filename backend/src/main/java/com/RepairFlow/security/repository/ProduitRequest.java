package com.RepairFlow.security.repository;

import lombok.Data;

@Data
public class ProduitRequest {
    private String nom;
    private String descriptionPanne;
    private String clientEmail;
    private Long categorieId;
}