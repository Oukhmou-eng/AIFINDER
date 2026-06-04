-- Comptes de test pour verifier login/register.
-- Admin:
--   email: admin.test@aifinder.ma
--   password clair: admin1234
--   hash: $2y$12$j/nFgq2QpESn1XAxq5YFsOaQDubRUcN.ef7uOUTB.GMel6vk54h72
--
-- User:
--   email: user.test@aifinder.ma
--   password clair: user1234
--   hash: $2y$12$8lcLLWtydkpCviLuz/JlzusVXM6LtgGn7ln4YmTolbt/GAAZzLdVS

INSERT INTO `utilisateur`
(`nom`, `prenom`, `email`, `mot_de_passe`, `role`, `statut`, `avatar_url`, `date_inscription`, `derniere_connexion`)
VALUES
('Test', 'Admin', 'admin.test@aifinder.ma', '$2y$12$j/nFgq2QpESn1XAxq5YFsOaQDubRUcN.ef7uOUTB.GMel6vk54h72', 'admin', 'actif', NULL, NOW(), NULL),
('Test', 'User', 'user.test@aifinder.ma', '$2y$12$8lcLLWtydkpCviLuz/JlzusVXM6LtgGn7ln4YmTolbt/GAAZzLdVS', 'user', 'actif', NULL, NOW(), NULL)
ON DUPLICATE KEY UPDATE
  `mot_de_passe` = VALUES(`mot_de_passe`),
  `role` = VALUES(`role`),
  `statut` = 'actif';
