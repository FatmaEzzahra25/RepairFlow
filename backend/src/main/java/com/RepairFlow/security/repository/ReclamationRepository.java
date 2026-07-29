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

    @Query("SELECT r FROM Reclamation r WHERE r.produit.client = :client " +
            "AND (:statut IS NULL OR r.statut = :statut) ORDER BY r.id DESC")
    List<Reclamation> findByProduitClientFiltered(@Param("client") Utilisateur client,
                                                  @Param("statut") String statut);

    @Query("SELECT r FROM Reclamation r WHERE r.produit.reparateur = :reparateur " +
            "AND (:statut IS NULL OR r.statut = :statut) " +
            "AND (:q IS NULL OR LOWER(r.produit.nom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%')) " +
            "     OR LOWER(r.produit.client.nom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%')) " +
            "     OR LOWER(r.produit.client.prenom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%'))) " +
            "ORDER BY r.id DESC")
    List<Reclamation> findByReparateurFiltered(@Param("reparateur") Utilisateur reparateur,
                                               @Param("statut") String statut,
                                               @Param("q") String q);
}