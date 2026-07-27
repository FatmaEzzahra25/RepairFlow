package com.RepairFlow.security.repository;

import com.RepairFlow.security.model.Produit;
import com.RepairFlow.security.model.Reclamation;
import com.RepairFlow.security.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {
    List<Reclamation> findByProduit(Produit produit);

    @Query("SELECT r FROM Reclamation r WHERE r.produit.client = :client")
    List<Reclamation> findByProduitClient(@Param("client") Utilisateur client);
}