package com.RepairFlow.security.repository;

import com.RepairFlow.security.model.Produit;
import com.RepairFlow.security.model.StatutReparation;
import com.RepairFlow.security.model.Utilisateur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {
    List<Produit> findByClient(Utilisateur client);
    List<Produit> findByReparateur(Utilisateur reparateur);
    List<Produit> findByStatut(StatutReparation statut);

    @Query("SELECT p FROM Produit p WHERE p.reparateur = :reparateur " +
            "AND (:statut IS NULL OR p.statut = :statut) " +
            "AND (:categorieId IS NULL OR p.categorie.id = :categorieId) " +
            "AND (:q IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%')) " +
            "     OR LOWER(p.client.nom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%')) " +
            "     OR LOWER(p.client.prenom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%'))) " +
            "ORDER BY p.id DESC")
    List<Produit> findByReparateurFiltered(@Param("reparateur") Utilisateur reparateur,
                                           @Param("statut") StatutReparation statut,
                                           @Param("categorieId") Long categorieId,
                                           @Param("q") String q);

    @Query(value = "SELECT p FROM Produit p WHERE " +
            "(:reparateurId IS NULL OR p.reparateur.id = :reparateurId) " +
            "AND (:statut IS NULL OR p.statut = :statut) " +
            "AND (:q IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%')) " +
            "     OR LOWER(p.client.nom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%')) " +
            "     OR LOWER(p.client.prenom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%'))) " +
            "ORDER BY p.id DESC",
            countQuery = "SELECT COUNT(p) FROM Produit p WHERE " +
                    "(:reparateurId IS NULL OR p.reparateur.id = :reparateurId) " +
                    "AND (:statut IS NULL OR p.statut = :statut) " +
                    "AND (:q IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%')) " +
                    "     OR LOWER(p.client.nom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%')) " +
                    "     OR LOWER(p.client.prenom) LIKE LOWER(CONCAT('%', CAST(:q as string), '%')))")
    Page<Produit> findAllFiltered(@Param("reparateurId") Long reparateurId,
                                  @Param("statut") StatutReparation statut,
                                  @Param("q") String q,
                                  Pageable pageable);
}