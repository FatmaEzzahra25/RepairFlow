INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, adresse, role, reparateur_id)
SELECT 'Admin', 'Systeme', 'admin@test.com', '$2b$12$9Lwzs8adrJ6nAv84l8KpvuNSp2KFTxkEKkcFdaewnzbfVzqJEpbDO', NULL, NULL, 'ADMIN', NULL
    WHERE NOT EXISTS (
    SELECT 1 FROM utilisateurs WHERE email = 'admin@test.com'
);