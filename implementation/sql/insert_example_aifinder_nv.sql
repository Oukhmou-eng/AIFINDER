-- =============================================================
-- Données d'insertion exhaustives pour le schéma AI_Tool
-- Base : MySQL / MariaDB
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. UTILISATEUR
-- ------------------------------------------------------------
INSERT IGNORE INTO `UTILISATEUR` (`IDU`, `NOM`, `PRENOM`, `EMAIL`, `MOT_DE_PASSE`, `ROLE`, `STATUT`, `AVATAR_URL`, `DATE_INSCRIPTION`, `DERNIERE_CONNEXION`) VALUES
(1, 'Admin', 'Anass', 'admin@aifinder.ma', '$2y$10$demoAdminHash', 'admin', 'actif', 'https://cdn.aifinder.ma/avatars/admin.png', '2025-01-05 09:15:00', '2026-06-03 18:30:00'),
(2, 'Oukhmou', 'Youssef', 'youssef@aifinder.ma', '$2y$10$demoUserHash02', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/youssef.png', '2025-02-11 12:40:00', '2026-06-01 10:05:00'),
(3, 'El Amrani', 'Sara', 'sara@aifinder.ma', '$2y$10$demoUserHash03', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/sara.png', '2025-03-09 16:20:00', '2026-05-29 21:11:00'),
(4, 'Bennani', 'Hamza', 'hamza@aifinder.ma', '$2y$10$demoUserHash04', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/hamza.png', '2025-04-18 08:10:00', '2026-05-30 14:45:00'),
(5, 'Mansouri', 'Nadia', 'nadia@aifinder.ma', '$2y$10$demoUserHash05', 'user', 'actif', NULL, '2025-05-02 19:05:00', '2026-05-25 09:00:00'),
(6, 'Khalil', 'Maad', 'kmaad@aifinder.ma', '$2y$10$demoUserHash06', 'moderateur', 'actif', NULL, '2025-06-14 11:35:00', '2026-06-02 17:20:00'),
(7, 'Lahcen', 'Omar', 'omar@aifinder.ma', '$2y$10$demoUserHash07', 'user', 'suspendu', NULL, '2025-07-01 13:00:00', '2026-04-14 12:00:00'),
(8, 'Raji', 'Imane', 'imane@aifinder.ma', '$2y$10$demoUserHash08', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/imane.png', '2025-08-22 20:10:00', '2026-06-04 08:55:00');

-- ------------------------------------------------------------
-- 2. NOTIFICATION
-- ------------------------------------------------------------
INSERT IGNORE INTO `NOTIFICATION` (`ID_NOTIF`, `CIBLE`, `TYPE`, `MESSAGE`, `DATE_MISE_A_JOUR`) VALUES
(1, 'user', 'soumission', 'Votre soumission pour ChatGPT a été validée.', '2026-01-12'),
(2, 'user', 'favori', 'Perplexity correspond à vos centres d\'intérêt.', '2026-02-05'),
(3, 'admin', 'signalement', 'Nouveau signalement à traiter.', '2026-03-10'),
(4, 'user', 'collection', 'Votre collection "Création contenu" a été enrichie.', '2026-03-20'),
(5, 'moderateur', 'soumission', 'Une nouvelle fiche outil attend validation.', '2026-05-09'),
(6, 'user', 'avis', 'Merci pour votre avis, il aide la communauté.', '2026-05-18'),
(7, 'user', 'securite', 'Nouvelle connexion détectée sur votre compte.', '2026-06-02'),
(8, 'admin', 'systeme', 'Rapport d\'activité mensuel disponible.', '2026-06-01');

-- ------------------------------------------------------------
-- 3. FEATURES
-- ------------------------------------------------------------
INSERT IGNORE INTO `FEATURES` (`ID_FEATURE`, `NOM`) VALUES
(1, 'Chat interactif'),
(2, 'Génération de texte'),
(3, 'Résumé de document'),
(4, 'Analyse de fichier'),
(5, 'Génération de code'),
(6, 'Recherche web'),
(7, 'Génération d\'image'),
(8, 'Édition d\'image'),
(9, 'Génération vidéo'),
(10, 'Transcription audio'),
(11, 'Text to speech'),
(12, 'API développeur'),
(13, 'Collaboration équipe'),
(14, 'Templates marketing'),
(15, 'Export multi-format');

-- ------------------------------------------------------------
-- 4. CATEGORIES
-- ------------------------------------------------------------
INSERT IGNORE INTO `CATEGORIES` (`ID_CATEGORIE`, `NOM`, `SLUG`, `ICONE`, `DESCRIPTION`) VALUES
(1, 'Texte', 'texte', 'file-text', 'Outils IA pour rédaction, résumé et génération de contenu.'),
(2, 'Image', 'image', 'image', 'Génération, édition et amélioration d\'images.'),
(3, 'Vidéo', 'video', 'video', 'Création et montage vidéo assistés par IA.'),
(4, 'Audio', 'audio', 'mic', 'Transcription, voix, musique et traitement audio.'),
(5, 'Code', 'code', 'code', 'Assistants de programmation, revue de code.'),
(6, 'Productivité', 'productivite', 'zap', 'Automatisation, organisation et travail quotidien.'),
(7, 'Recherche', 'recherche', 'search', 'Recherche documentaire et analyse de sources.'),
(8, 'Marketing', 'marketing', 'megaphone', 'Création de campagnes, SEO, publicité.'),
(9, 'Éducation', 'education', 'graduation-cap', 'Apprentissage, tutorat, quiz.'),
(10, 'Data', 'data', 'bar-chart', 'Analyse de données et business intelligence.');

-- ------------------------------------------------------------
-- 5. CARACTERISTIQUE
-- ------------------------------------------------------------
INSERT IGNORE INTO `CARACTERISTIQUE` (`ID_CARACT`, `CLE`, `VALEUR`) VALUES
(1, 'context_window', '128k tokens'),
(2, 'languages', 'Multilingue'),
(3, 'deployment', 'Cloud'),
(4, 'deployment', 'Local possible'),
(5, 'latency', 'Faible'),
(6, 'privacy', 'Enterprise controls'),
(7, 'output', 'Texte'),
(8, 'output', 'Image'),
(9, 'output', 'Vidéo'),
(10, 'output', 'Audio'),
(11, 'integration', 'REST API'),
(12, 'integration', 'Extension navigateur'),
(13, 'collaboration', 'Espace de travail partagé'),
(14, 'safety', 'Modération de contenu'),
(15, 'license', 'Open weights'),
(16, 'billing', 'Crédits'),
(17, 'max_resolution', '1024x1024'),
(18, 'export', 'PDF, DOCX, Markdown');

-- ------------------------------------------------------------
-- 6. FOURNISSEUR
-- ------------------------------------------------------------
INSERT IGNORE INTO `FOURNISSEUR` (`ID_FOURNISSEUR`, `NOM`, `SLUG`, `WEBSITE`, `PAYS`, `LOGO_URL`, `DATE_MISE_A_JOUR`, `UPDATED_AT`) VALUES
(1, 'OpenAI', 'openai', 'https://openai.com', 'United States', 'https://cdn.aifinder.ma/logos/openai.svg', '2026-05-01', '2026-05-01'),
(2, 'Anthropic', 'anthropic', 'https://anthropic.com', 'United States', 'https://cdn.aifinder.ma/logos/anthropic.svg', '2026-04-20', '2026-04-20'),
(3, 'Google DeepMind', 'google-deepmind', 'https://deepmind.google', 'United Kingdom', 'https://cdn.aifinder.ma/logos/deepmind.svg', '2026-04-18', '2026-04-18'),
(4, 'Mistral AI', 'mistral-ai', 'https://mistral.ai', 'France', 'https://cdn.aifinder.ma/logos/mistral.svg', '2026-04-10', '2026-04-10'),
(5, 'Hugging Face', 'hugging-face', 'https://huggingface.co', 'United States', 'https://cdn.aifinder.ma/logos/huggingface.svg', '2026-03-28', '2026-03-28'),
(6, 'Stability AI', 'stability-ai', 'https://stability.ai', 'United Kingdom', 'https://cdn.aifinder.ma/logos/stability.svg', '2026-03-12', '2026-03-12'),
(7, 'Runway', 'runway', 'https://runwayml.com', 'United States', 'https://cdn.aifinder.ma/logos/runway.svg', '2026-03-22', '2026-03-22'),
(8, 'Perplexity AI', 'perplexity-ai', 'https://perplexity.ai', 'United States', 'https://cdn.aifinder.ma/logos/perplexity.svg', '2026-04-16', '2026-04-16'),
(9, 'Notion Labs', 'notion-labs', 'https://notion.so', 'United States', 'https://cdn.aifinder.ma/logos/notion.svg', '2026-02-11', '2026-02-11'),
(10, 'ElevenLabs', 'elevenlabs', 'https://elevenlabs.io', 'United States', 'https://cdn.aifinder.ma/logos/elevenlabs.svg', '2026-04-05', '2026-04-05');

-- ------------------------------------------------------------
-- 7. PLATEFORME
-- ------------------------------------------------------------
INSERT IGNORE INTO `PLATEFORME` (`ID_PLATEFORME`, `NOM`) VALUES
(1, 'Web'),
(2, 'API'),
(3, 'Windows'),
(4, 'macOS'),
(5, 'Linux'),
(6, 'iOS'),
(7, 'Android'),
(8, 'Extension Chrome'),
(9, 'Slack'),
(10, 'Discord');

-- ------------------------------------------------------------
-- 8. PERFORMANCE
-- ------------------------------------------------------------
INSERT IGNORE INTO `PERFORMANCE` (`ID_PERFORMANCE`, `DOMAINE`) VALUES
(1, 'Rédaction générale'),
(2, 'Raisonnement'),
(3, 'Code'),
(4, 'Recherche avec sources'),
(5, 'Génération image'),
(6, 'Édition vidéo'),
(7, 'Transcription audio'),
(8, 'Synthèse vocale'),
(9, 'Productivité'),
(10, 'Analyse de données'),
(11, 'Éducation'),
(12, 'Marketing');

-- ------------------------------------------------------------
-- 9. COLLECTION
-- ------------------------------------------------------------
INSERT IGNORE INTO `COLLECTION` (`ID_COLLECTION`, `IDU`, `NOM`, `DESCRIPTION`, `DATE_MISE_A_JOUR`) VALUES
(1, 2, 'Outils pour études', 'Sélection pour cours, résumés et recherche.', '2026-01-12'),
(2, 4, 'Stack développeur', 'APIs et assistants pour projets web.', '2026-02-01'),
(3, 8, 'Création contenu', 'Image, vidéo, voix et marketing.', '2026-02-18'),
(4, 5, 'Recherche et veille', 'Sources, synthèse et analyse documentaire.', '2026-03-04'),
(5, 3, 'Open source local', 'Modèles et outils déployables sans dépendance forte.', '2026-04-15'),
(6, 1, 'Admin favoris', 'Outils vérifiés par la modération.', '2026-05-02');

-- ------------------------------------------------------------
-- 10. COMMENTAIRES
-- ------------------------------------------------------------
INSERT IGNORE INTO `COMMENTAIRES` (`ID_COMMENTAIRE`, `COMMENTAIRE_PARENT_ID`, `IDOUT`, `IDU`, `CONTENU`, `STATUT`, `DATE_MISE_A_JOUR`, `UPDATED_AT`) VALUES
(1, NULL, 1, 2, 'Très utile pour préparer un plan de projet et générer du code rapidement.', 'actif', '2026-01-12', NULL),
(2, 1, 1, 4, 'Je confirme, mais il faut toujours vérifier les résultats techniques.', 'actif', '2026-01-13', NULL),
(3, NULL, 2, 3, 'Claude est excellent pour résumer de longs rapports.', 'actif', '2026-01-20', NULL),
(4, NULL, 6, 5, 'Perplexity donne des sources claires pour commencer une recherche.', 'actif', '2026-02-04', NULL),
(5, NULL, 8, 8, 'Stable Diffusion est puissant si on sait gérer les prompts.', 'actif', '2026-02-18', NULL),
(6, NULL, 9, 4, 'Runway est pratique pour les montages courts de présentation.', 'actif', '2026-03-03', NULL),
(7, NULL, 10, 2, 'La qualité des voix ElevenLabs est très convaincante.', 'actif', '2026-03-08', NULL),
(8, NULL, 11, 3, 'Whisper reste très fiable pour les cours et réunions.', 'actif', '2026-03-15', NULL),
(9, NULL, 4, 6, 'Le Chat est rapide et simple à prendre en main.', 'actif', '2026-04-01', NULL),
(10, NULL, 7, 5, 'Notion AI marche bien pour organiser les notes de réunion.', 'actif', '2026-04-11', NULL),
(11, NULL, 15, 8, 'Je trouve Canva Magic Studio efficace pour les posts marketing.', 'actif', '2026-05-01', NULL),
(12, NULL, 13, 2, 'Hugging Face Spaces est parfait pour publier une démo étudiante.', 'actif', '2026-05-14', NULL);

-- ------------------------------------------------------------
-- 11. PRICING_PLANS
-- ------------------------------------------------------------
INSERT IGNORE INTO `PRICING_PLANS` (`ID_PRICING_PLAN`, `IDOUT`, `NOM`, `PRIX`, `DEVISE`, `PERIODE`, `DESCRIPTION`, `TYPE`) VALUES
(1, 1, 'Free', 0.00, 'USD', 'mois', 'Accès limité pour tester ChatGPT.', 'free'),
(2, 1, 'Plus', 20.00, 'USD', 'mois', 'Accès étendu aux modèles avancés.', 'premium'),
(3, 2, 'Claude Pro', 20.00, 'USD', 'mois', 'Utilisation avancée de Claude.', 'premium'),
(4, 3, 'Gemini Advanced', 19.99, 'USD', 'mois', 'Fonctions avancées et intégration Google.', 'premium'),
(5, 4, 'Le Chat Free', 0.00, 'EUR', 'mois', 'Accès gratuit aux modèles Mistral.', 'free'),
(6, 5, 'HuggingChat Free', 0.00, 'USD', 'mois', 'Chat communautaire gratuit.', 'free'),
(7, 6, 'Perplexity Pro', 20.00, 'USD', 'mois', 'Recherche IA avec usage pro.', 'premium'),
(8, 7, 'Notion AI Add-on', 10.00, 'USD', 'mois', 'Assistant IA par membre.', 'premium'),
(9, 8, 'Stable Diffusion Local', 0.00, 'USD', 'mois', 'Exécution locale open source.', 'free'),
(10, 9, 'Runway Standard', 15.00, 'USD', 'mois', 'Crédits vidéo pour créateurs.', 'premium'),
(11, 10, 'ElevenLabs Starter', 5.00, 'USD', 'mois', 'Voix IA pour petits projets.', 'premium'),
(12, 11, 'Whisper Pay as you go', 0.01, 'USD', 'minute', 'Facturation à la minute transcrite.', 'usage'),
(13, 12, 'Mistral API Build', 0.00, 'EUR', 'usage', 'Facturation selon les tokens consommés.', 'usage'),
(14, 14, 'OpenAI API Usage', 0.00, 'USD', 'usage', 'Paiement selon consommation API.', 'usage'),
(15, 15, 'Canva Pro', 15.00, 'USD', 'mois', 'Suite créative avec Magic Studio.', 'premium');

-- ------------------------------------------------------------
-- 12. FEATURE_PRICING (liaison FEATURES <-> PRICING_PLANS)
-- ------------------------------------------------------------
INSERT IGNORE INTO `FEATURE_PRICING` (`ID_FEATURE`, `ID_PRICING_PLAN`) VALUES
(1, 1), (2, 1), (1, 2), (2, 2), (4, 2), (5, 2), (1, 3), (3, 3), (5, 3),
(1, 4), (4, 4), (6, 4), (1, 5), (2, 5), (1, 6), (5, 6), (6, 7), (3, 7),
(2, 8), (13, 8), (7, 9), (8, 9), (9, 10), (11, 11), (10, 12), (12, 13),
(12, 14), (14, 15), (15, 15);

-- ------------------------------------------------------------
-- 13. STATISTIQUES_EXTERNES
-- ------------------------------------------------------------
INSERT IGNORE INTO `STATISTIQUES_EXTERNES` (`ID_STAT`, `IDOUT`, `NOTE_MOYENNE`, `NB_NOTATIONS`, `NB_UTILISATEURS`, `CONTENU`, `DATE_MISE_A_JOUR`) VALUES
(1, 1, 4.8, 1523, 1200, 'Statistiques récupérées de source externe', '2026-06-01'),
(2, 2, 4.7, 890, 750, NULL, '2026-06-01'),
(3, 6, 4.5, 672, 500, NULL, '2026-06-01'),
(4, 10, 4.9, 432, 350, NULL, '2026-06-01');

-- ------------------------------------------------------------
-- 14. SOUMISSION_OUTIL
-- ------------------------------------------------------------
INSERT IGNORE INTO `SOUMISSION_OUTIL` (`ID_SOUMISSION`, `IDOUT`, `IDU`, `STATUT`, `NOTE_ADMIN`, `TENTATIVES_EFFECTUEES`, `TENTATIVES_MAX`, `DATE_MISE_A_JOUR`) VALUES
(1, 1, 2, 'validé', 'Outil populaire et fiche complète.', 1, 3, '2026-01-12'),
(2, 6, 5, 'validé', 'Ajouté dans la catégorie recherche.', 1, 3, '2026-02-03'),
(3, 15, 8, 'en_attente', NULL, 1, 3, NULL),
(4, NULL, 7, 'refusé', 'Description trop courte et lien non officiel.', 2, 3, '2026-03-20'),
(5, 14, 6, 'validé', 'API utile pour les développeurs.', 1, 3, '2026-04-07'),
(6, 13, 3, 'en_attente', 'Vérifier les informations tarifaires.', 1, 3, NULL);

-- ------------------------------------------------------------
-- 15. SIGNALEMENTS
-- ------------------------------------------------------------
INSERT IGNORE INTO `SIGNALEMENTS` (`ID_SIGNALEMENT`, `IDOUT`, `IDU`, `ID_COMMENTAIRE`, `MOTIF`, `STATUT`, `DESCRIPTION`, `DATE_MISE_A_JOUR`) VALUES
(1, 9, 3, NULL, 'Information obsolète', 'traité', 'Ancien tarif signalé puis corrigé.', '2026-02-20'),
(2, 10, 5, 7, 'Commentaire incomplet', 'en_attente', 'Demande de précision sur un avis.', '2026-03-10'),
(3, 12, 2, NULL, 'Lien à vérifier', 'en_attente', 'Le lien de documentation semble changer.', '2026-04-03'),
(4, 1, 8, 1, 'Contenu dupliqué', 'rejeté', 'Signalement non confirmé après vérification.', '2026-04-19');

-- ------------------------------------------------------------
-- 16. NOTIFICATION_UTILISATEUR
-- ------------------------------------------------------------
INSERT IGNORE INTO `NOTIFICATION_UTILISATEUR` (`ID_NOTIF`, `IDU`, `DATE_LECTURE`) VALUES
(1, 2, '2026-01-12'),
(2, 5, '2026-02-06'),
(3, 1, '2026-03-10'),
(4, 8, '2026-03-21'),
(5, 6, '2026-05-09'),
(6, 3, '2026-05-19'),
(7, 4, NULL),
(8, 1, '2026-06-02');

-- ------------------------------------------------------------
-- 17. MODELS
-- ------------------------------------------------------------
INSERT IGNORE INTO `MODELS` (`IDMOD`, `ID_FOURNISSEUR`, `NOM`, `SLUG`, `TYPE`, `DESCRIPTION`, `API_URL`, `EST_OPEN_SOURCE`, `DATE_SORTIE`, `POSSEDE_API`) VALUES
(1, 1, 'GPT-4o', 'gpt-4o', 'LLM multimodal', 'Modèle généraliste pour texte, image et conversation.', 'https://api.openai.com/v1', 0, '2024-05-13', 1),
(2, 1, 'GPT-4o mini', 'gpt-4o-mini', 'LLM', 'Modèle rapide et économique.', 'https://api.openai.com/v1', 0, '2024-07-18', 1),
(3, 2, 'Claude 3.5 Sonnet', 'claude-3-5-sonnet', 'LLM', 'Modèle d\'analyse, rédaction et code.', 'https://api.anthropic.com', 0, '2024-06-20', 1),
(4, 3, 'Gemini 1.5 Pro', 'gemini-1-5-pro', 'LLM multimodal', 'Modèle multimodal avec grande fenêtre de contexte.', 'https://generativelanguage.googleapis.com', 0, '2024-02-15', 1),
(5, 4, 'Mistral Large', 'mistral-large', 'LLM', 'Modèle européen performant.', 'https://api.mistral.ai', 0, '2024-02-26', 1),
(6, 4, 'Mixtral 8x7B', 'mixtral-8x7b', 'LLM open source', 'Modèle mixture-of-experts.', 'https://api.mistral.ai', 1, '2023-12-11', 1),
(7, 6, 'Stable Diffusion XL', 'stable-diffusion-xl', 'Image generation', 'Modèle de génération d\'images haute qualité.', 'https://api.stability.ai', 1, '2023-07-26', 1),
(8, 1, 'Whisper Large v3', 'whisper-large-v3', 'Speech to text', 'Transcription et traduction audio.', 'https://api.openai.com/v1/audio', 1, '2023-11-06', 1),
(9, 5, 'Llama 3.1 70B', 'llama-3-1-70b', 'LLM open weights', 'Modèle open weights puissant.', 'https://huggingface.co/meta-llama', 1, '2024-07-23', 1),
(10, 10, 'Eleven Multilingual v2', 'eleven-multilingual-v2', 'Text to speech', 'Synthèse vocale naturelle multilingue.', 'https://api.elevenlabs.io', 0, '2023-08-01', 1);

-- ------------------------------------------------------------
-- 18. MODEL_PRICING
-- ------------------------------------------------------------
INSERT IGNORE INTO `MODEL_PRICING` (`ID_MODEL_PRICING`, `IDMOD`, `PRIX_ENTREE`, `PRIX_SORTIE`, `DEVISE`, `UNITE`, `DATE_EFFECTIVE`) VALUES
(1, 1, 5.00, 15.00, 'USD', 1000000, '2025-01-01'),
(2, 2, 0.15, 0.60, 'USD', 1000000, '2025-01-01'),
(3, 3, 3.00, 15.00, 'USD', 1000000, '2025-01-01'),
(4, 4, 3.50, 10.50, 'USD', 1000000, '2025-01-01'),
(5, 5, 2.00, 6.00, 'EUR', 1000000, '2025-01-01'),
(6, 6, 0.70, 0.70, 'EUR', 1000000, '2025-01-01'),
(7, 7, 0.04, 0.04, 'USD', 1, '2025-01-01'),
(8, 8, 0.006, 0.00, 'USD', 1, '2025-01-01'),
(9, 9, 0.90, 0.90, 'USD', 1000000, '2025-01-01'),
(10, 10, 0.30, 0.30, 'USD', 1000, '2025-01-01');

-- ------------------------------------------------------------
-- 19. HISTORIQUE_RECHERCHES
-- ------------------------------------------------------------
INSERT IGNORE INTO `HISTORIQUE_RECHERCHES` (`ID_RECHERCHE`, `IDU`, `QUERY`, `DATE_RECHERCHE`, `RESULTATS`) VALUES
(1, 2, 'meilleur outil IA pour rédaction rapport', '2026-01-12 10:15:00', 8),
(2, 3, 'outil transcription cours français arabe', '2026-01-18 18:44:00', 5),
(3, 8, 'générateur image open source', '2026-02-11 09:21:00', 6),
(4, 4, 'assistant code React', '2026-02-28 14:10:00', 7),
(5, 5, 'outil recherche avec sources', '2026-03-04 16:35:00', 4),
(6, 2, 'voix IA réaliste vidéo youtube', '2026-03-19 20:02:00', 5),
(7, 6, 'API LLM pas cher', '2026-04-07 12:11:00', 6),
(8, 8, 'outil marketing pour publication instagram', '2026-05-01 11:08:00', 5),
(9, 3, 'modèle open source local', '2026-05-10 17:30:00', 4),
(10, 4, 'génération vidéo présentation', '2026-05-21 19:45:00', 3);

-- ------------------------------------------------------------
-- 20. FAVORI
-- ------------------------------------------------------------
INSERT IGNORE INTO `FAVORI` (`ID_FAVORI`, `IDOUT`, `IDU`, `DATE_AJOUT`) VALUES
(1, 1, 2, '2026-01-12'),
(2, 6, 2, '2026-01-22'),
(3, 2, 3, '2026-02-05'),
(4, 11, 3, '2026-02-18'),
(5, 9, 4, '2026-03-02'),
(6, 12, 4, '2026-03-09'),
(7, 7, 5, '2026-03-15'),
(8, 15, 5, '2026-04-01'),
(9, 8, 8, '2026-04-14'),
(10, 10, 8, '2026-05-01'),
(11, 4, 6, '2026-05-04'),
(12, 14, 6, '2026-05-17');

-- ------------------------------------------------------------
-- 21. OUTIL_PLATEFORME (liaison OUTILS <-> PLATEFORME)
-- ------------------------------------------------------------
INSERT IGNORE INTO `OUTIL_PLATEFORME` (`IDOUT`, `ID_PLATEFORME`) VALUES
(1,1),(1,2),(1,6),(1,7),(2,1),(2,2),(2,6),(2,7),(3,1),(3,6),(3,7),
(4,1),(4,2),(5,1),(6,1),(6,2),(6,8),(7,1),(7,6),(7,7),
(8,1),(8,5),(8,3),(8,4),(9,1),(10,1),(10,2),(11,2),(12,2),
(13,1),(14,2),(15,1),(15,6),(15,7);

-- ------------------------------------------------------------
-- 22. COLLECTION_OUTIL
-- ------------------------------------------------------------
INSERT IGNORE INTO `COLLECTION_OUTIL` (`ID_COLLECTION`, `IDOUT`, `DATE_AJOUT`) VALUES
(1, 1, '2026-01-12'),
(1, 2, '2026-01-15'),
(1, 6, '2026-01-20'),
(1, 11, '2026-02-01'),
(2, 1, '2026-02-01'),
(2, 12, '2026-02-05'),
(2, 13, '2026-02-10'),
(2, 14, '2026-02-15'),
(3, 8, '2026-02-18'),
(3, 9, '2026-02-20'),
(3, 10, '2026-02-25'),
(3, 15, '2026-03-01'),
(4, 2, '2026-03-04'),
(4, 6, '2026-03-08'),
(4, 7, '2026-03-12'),
(5, 5, '2026-04-15'),
(5, 8, '2026-04-20'),
(5, 13, '2026-04-25'),
(6, 1, '2026-05-02'),
(6, 6, '2026-05-05'),
(6, 14, '2026-05-10');

-- ------------------------------------------------------------
-- 23. OUTIL_FEATURE (liaison OUTILS <-> FEATURES)
-- ------------------------------------------------------------
INSERT IGNORE INTO `OUTIL_FEATURE` (`ID_FEATURE`, `IDOUT`) VALUES
(1,1),(2,1),(3,1),(4,1),(5,1),(12,1),
(1,2),(2,2),(3,2),
(1,3),(4,3),(6,3),
(1,4),(2,4),
(1,5),(5,5),
(6,6),(3,6),
(2,7),(3,7),(13,7),
(7,8),(8,8),
(9,9),
(10,11),(11,10),
(12,12),(12,14),
(13,13),
(14,15),(15,15);

-- ------------------------------------------------------------
-- 24. OUTIL_CATEGORIE
-- ------------------------------------------------------------
INSERT IGNORE INTO `OUTIL_CATEGORIE` (`IDOUT`, `ID_CATEGORIE`) VALUES
(1,1),(1,5),(1,6),
(2,1),(2,5),
(3,1),(3,6),
(4,1),(4,6),
(5,1),(5,5),
(6,7),(6,6),
(7,6),(7,1),
(8,2),
(9,3),
(10,4),
(11,4),
(12,5),
(14,5),(14,1),
(15,2),(15,8);

-- ------------------------------------------------------------
-- 25. PRICING_MODELE (liaison PRICING_PLANS <-> MODELS)
-- ------------------------------------------------------------
INSERT IGNORE INTO `PRICING_MODELE` (`ID_PRICING_MODELE`, `ID_PRICING_PLAN`, `IDMOD`) VALUES
(1, 1, 2),
(2, 2, 1),
(3, 2, 2),
(4, 3, 3),
(5, 4, 4),
(6, 5, 5),
(7, 5, 6),
(8, 6, 9),
(9, 7, 3),
(10, 8, 2),
(11, 9, 7),
(12, 10, 7),
(13, 11, 10),
(14, 12, 8),
(15, 13, 5),
(16, 13, 6),
(17, 14, 1),
(18, 14, 2),
(19, 15, 7);

-- ------------------------------------------------------------
-- 26. PRICING_MODELE_LIMITE
-- ------------------------------------------------------------
INSERT IGNORE INTO `PRICING_MODELE_LIMITE` (`ID_PRICING_MODELE_LIMITE`, `ID_PRICING_MODELE`, `TYPE_LIMITE`, `VALEUR`, `PERIODE`) VALUES
(1, 1, 'messages', 50, 'jour'),
(2, 2, 'messages', 300, 'jour'),
(3, 3, 'messages', 500, 'jour'),
(4, 4, 'messages', 250, 'jour'),
(5, 5, 'messages', 300, 'jour'),
(6, 6, 'messages', 200, 'jour'),
(7, 7, 'messages', 100, 'jour'),
(8, 8, 'messages', 100, 'jour'),
(9, 11, 'images', 100, 'mois'),
(10, 12, 'video_seconds', 625, 'mois'),
(11, 13, 'characters', 30000, 'mois'),
(12, 14, 'minutes', 1000, 'mois'),
(13, 17, 'tokens', 1000000, 'mois'),
(14, 18, 'tokens', 3000000, 'mois');

-- ------------------------------------------------------------
-- 27. OUTIL_PERFORMANCE
-- ------------------------------------------------------------
INSERT IGNORE INTO `OUTIL_PERFORMANCE` (`IDOUT`, `ID_PERFORMANCE`, `SCORE`) VALUES
(1,1,94),(1,2,91),(1,3,92),(1,9,90),
(2,1,95),(2,2,92),(2,3,91),
(3,4,89),(3,9,88),
(4,1,85),(4,2,84),
(5,3,80),
(6,4,89),(6,7,92),
(7,9,87),
(8,5,88),
(9,6,84),
(10,8,93),
(11,7,95),
(12,3,85),
(13,3,82),
(14,3,92),(14,10,86),
(15,12,87);

-- ------------------------------------------------------------
-- 28. PERFORMANCE_MODELE
-- ------------------------------------------------------------
INSERT IGNORE INTO `PERFORMANCE_MODELE` (`ID_PERFORMANCE`, `IDMOD`, `SCORE`) VALUES
(1,1,94),(2,1,91),(3,1,92),(9,1,90),
(1,2,90),(3,2,88),
(1,3,95),(2,3,92),(3,3,93),
(2,4,88),(4,4,89),
(1,5,87),(2,5,85),(3,5,86),
(3,6,82),(10,6,85),
(5,7,88),
(7,8,95),
(3,9,84),(10,9,82),
(8,10,93);

-- ------------------------------------------------------------
-- 29. CARACTERISTIQUE_MODELE
-- ------------------------------------------------------------
INSERT IGNORE INTO `CARACTERISTIQUE_MODELE` (`ID_CARACT`, `IDMOD`) VALUES
(1,1),(2,1),(3,1),(11,1),
(1,2),(2,2),(5,2),
(1,3),(2,3),(6,3),
(1,4),(2,4),(3,4),
(2,5),(5,5),(11,5),
(4,6),(15,6),
(8,7),(17,7),
(10,8),(11,8),
(4,9),(15,9),
(10,10),(16,10);

-- ------------------------------------------------------------
-- 30. OUTIL_CARACTERISTIQUE
-- ------------------------------------------------------------
INSERT IGNORE INTO `OUTIL_CARACTERISTIQUE` (`IDOUT`, `ID_CARACT`) VALUES
(1,1),(1,2),(1,3),(1,11),
(2,1),(2,2),(2,6),
(3,2),(3,3),
(4,2),(4,5),
(5,4),(5,15),
(6,11),(6,12),
(7,13),(7,18),
(8,4),(8,8),(8,17),
(9,9),(9,16),
(10,10),(10,16),
(11,10),(11,11),
(12,11),(12,5),
(13,4),(13,13),
(14,11),(14,14),
(15,8),(15,13),(15,18);

-- ------------------------------------------------------------
-- 31. FEATURE_MODELE (liaison FEATURES <-> MODELS)
-- ------------------------------------------------------------
INSERT IGNORE INTO `FEATURE_MODELE` (`ID_FEATURE`, `IDMOD`) VALUES
(1,1),(2,1),(3,1),(4,1),(5,1),(12,1),
(1,2),(2,2),(5,2),
(1,3),(2,3),(3,3),(5,3),
(1,4),(4,4),(6,4),
(1,5),(2,5),(5,5),(12,5),
(1,6),(2,6),(5,6),
(7,7),(8,7),
(10,8),
(1,9),(2,9),(5,9),
(11,10),(12,10);

-- ------------------------------------------------------------
-- 32. OUTILS
-- ------------------------------------------------------------
INSERT IGNORE INTO `OUTILS` (`IDOUT`, `IDU`, `ID_SOUMISSION`, `ID_FOURNISSEUR`, `ID_STAT`, `NOM`, `SLUG`, `TYPE_TARIF`, `DESCRIPTION_COURTE`, `DESCRIPTION_LONGUE`, `LOGO_URL`, `SITE_URL`, `STATUT`, `DATE_MISE_A_JOUR`, `DATE_SORTIE`, `EST_OPEN_SOURCE`) VALUES
(1, 2, 1, 1, NULL, 'ChatGPT', 'chatgpt', 'freemium', 'Assistant IA généraliste pour texte, code et images.', 'ChatGPT aide à rédiger, analyser, coder, apprendre et automatiser.', 'https://cdn.aifinder.ma/tools/chatgpt.svg', 'https://chatgpt.com', 'actif', '2026-05-01', '2022-11-30', 0),
(2, 3, NULL, 2, NULL, 'Claude', 'claude', 'freemium', 'Assistant IA orienté analyse, rédaction et code.', 'Claude est utilisé pour les longs documents, la synthèse et la programmation.', 'https://cdn.aifinder.ma/tools/claude.svg', 'https://claude.ai', 'actif', '2026-04-25', '2023-03-14', 0),
(3, 5, NULL, 3, NULL, 'Gemini', 'gemini', 'freemium', 'Assistant IA de Google pour recherche, texte et multimodal.', 'Gemini combine conversation, recherche et images.', 'https://cdn.aifinder.ma/tools/gemini.svg', 'https://gemini.google.com', 'actif', '2026-04-20', '2023-12-06', 0),
(4, 6, NULL, 4, NULL, 'Mistral Le Chat', 'mistral-le-chat', 'freemium', 'Assistant IA européen pour chat et productivité.', 'Le Chat donne accès aux modèles Mistral pour réponses rapides.', 'https://cdn.aifinder.ma/tools/mistral.svg', 'https://chat.mistral.ai', 'actif', '2026-03-20', '2024-02-26', 0),
(5, 8, NULL, 5, NULL, 'HuggingChat', 'huggingchat', 'free', 'Chat open source basé sur des modèles communautaires.', 'HuggingChat permet de tester plusieurs modèles ouverts.', 'https://cdn.aifinder.ma/tools/huggingchat.svg', 'https://huggingface.co/chat', 'actif', '2026-02-19', '2023-04-25', 1),
(6, 5, 2, 8, NULL, 'Perplexity', 'perplexity', 'freemium', 'Moteur de réponse IA avec sources citées.', 'Perplexity combine recherche web, citations et synthèse.', 'https://cdn.aifinder.ma/tools/perplexity.svg', 'https://perplexity.ai', 'actif', '2026-04-16', '2022-12-01', 0),
(7, 8, NULL, 9, NULL, 'Notion AI', 'notion-ai', 'paid', 'Assistant IA intégré à Notion pour notes et documents.', 'Notion AI aide à résumer, reformuler et organiser.', 'https://cdn.aifinder.ma/tools/notion-ai.svg', 'https://notion.so/product/ai', 'actif', '2026-02-11', '2023-02-22', 0),
(8, 4, NULL, 6, NULL, 'Stable Diffusion', 'stable-diffusion', 'free', 'Génération d\'images open source.', 'Stable Diffusion produit des images à partir de prompts.', 'https://cdn.aifinder.ma/tools/stable-diffusion.svg', 'https://stability.ai', 'actif', '2026-03-12', '2022-08-22', 1),
(9, 4, NULL, 7, NULL, 'Runway', 'runway', 'freemium', 'Création et édition vidéo assistée par IA.', 'Runway propose génération vidéo, suppression d\'objets, sous-titrage.', 'https://cdn.aifinder.ma/tools/runway.svg', 'https://runwayml.com', 'actif', '2026-03-22', '2018-01-01', 0),
(10, 2, NULL, 10, NULL, 'ElevenLabs', 'elevenlabs', 'freemium', 'Voix IA réalistes et clonage vocal.', 'ElevenLabs génère une synthèse vocale naturelle et multilingue.', 'https://cdn.aifinder.ma/tools/elevenlabs.svg', 'https://elevenlabs.io', 'actif', '2026-04-05', '2022-01-01', 0),
(11, 3, NULL, 1, NULL, 'Whisper API', 'whisper-api', 'paid', 'Transcription audio via API.', 'Whisper API transforme audio en texte exploitable.', 'https://cdn.aifinder.ma/tools/whisper.svg', 'https://platform.openai.com/docs/guides/audio', 'actif', '2026-01-10', '2023-03-01', 1),
(12, 4, NULL, 4, NULL, 'Mistral API', 'mistral-api', 'paid', 'API pour modèles Mistral.', 'Mistral API permet d\'intégrer les modèles Mistral.', 'https://cdn.aifinder.ma/tools/mistral-api.svg', 'https://console.mistral.ai', 'actif', '2026-03-20', '2023-09-27', 0),
(13, 3, 6, 5, NULL, 'Hugging Face Spaces', 'hugging-face-spaces', 'freemium', 'Hébergement de démos IA et applications ML.', 'Spaces permet de publier des démos IA en Gradio, Streamlit.', 'https://cdn.aifinder.ma/tools/hf-spaces.svg', 'https://huggingface.co/spaces', 'actif', '2026-02-20', '2021-01-01', 1),
(14, 6, 5, 1, NULL, 'OpenAI API', 'openai-api', 'paid', 'API pour intégrer les modèles OpenAI.', 'OpenAI API donne accès à des modèles texte, audio, image.', 'https://cdn.aifinder.ma/tools/openai-api.svg', 'https://platform.openai.com', 'actif', '2026-05-01', '2020-06-11', 0),
(15, 8, 3, NULL, NULL, 'Canva Magic Studio', 'canva-magic-studio', 'freemium', 'Suite créative IA pour design et marketing.', 'Magic Studio aide à créer visuels, présentations, posts.', 'https://cdn.aifinder.ma/tools/canva-magic.svg', 'https://www.canva.com/magic', 'actif', '2026-01-15', '2023-10-04', 0);

-- ------------------------------------------------------------
-- 33. OUTIL_MODELE (liaison OUTILS <-> MODELS) - anciennement UTILISE
-- ------------------------------------------------------------
INSERT IGNORE INTO `OUTIL_MODELE` (`IDOUT`, `IDMOD`) VALUES
(1,1),(1,2),
(2,3),
(3,4),
(4,5),(4,6),
(5,9),
(6,3),(6,4),
(8,7),
(9,7),
(10,10),
(11,8),
(12,5),(12,6),
(13,9),
(14,1),(14,2),
(15,7);

SET FOREIGN_KEY_CHECKS = 1;