package com.RepairFlow.security.repository;

import com.RepairFlow.security.model.Produit;
import com.RepairFlow.security.model.StatutReparation;
import com.RepairFlow.security.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {
    List<Produit> findByClient(Utilisateur client);
    List<Produit> findByReparateur(Utilisateur reparateur);
    List<Produit> findByStatut(StatutReparation statut);
}