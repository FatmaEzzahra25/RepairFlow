package com.RepairFlow.security.user.repository;

import lombok.Data;

@Data
public class RegisterRequestClient {
    private String prenom;
    private String nom;
    private String email;
    private String motDePasse;
    private String telephone;
    private String adresse;
}