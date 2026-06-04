-- =============================================================
-- Donnees d'exemple coherentes pour le schema AIFinder
-- Import:
--   mariadb -u root -p1516 dbAI < implementation/sql/insert_exemple.sql
--   mariadb -u root -p1516 aifinder_db < implementation/sql/insert_exemple.sql
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT IGNORE INTO `utilisateur`
(`idU`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `statut`, `avatar_url`, `date_inscription`, `derniere_connexion`) VALUES
(1, 'Admin', 'Anass', 'admin@aifinder.ma', '$2y$10$demoAdminHash', 'admin', 'actif', 'https://cdn.aifinder.ma/avatars/admin.png', '2025-01-05 09:15:00', '2026-06-03 18:30:00'),
(2, 'Oukhmou', 'Youssef', 'youssef@aifinder.ma', '$2y$10$demoUserHash02', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/youssef.png', '2025-02-11 12:40:00', '2026-06-01 10:05:00'),
(3, 'El Amrani', 'Sara', 'sara@aifinder.ma', '$2y$10$demoUserHash03', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/sara.png', '2025-03-09 16:20:00', '2026-05-29 21:11:00'),
(4, 'Bennani', 'Hamza', 'hamza@aifinder.ma', '$2y$10$demoUserHash04', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/hamza.png', '2025-04-18 08:10:00', '2026-05-30 14:45:00'),
(5, 'Mansouri', 'Nadia', 'nadia@aifinder.ma', '$2y$10$demoUserHash05', 'user', 'actif', NULL, '2025-05-02 19:05:00', '2026-05-25 09:00:00'),
(6, 'Khalil', 'Maad', 'kmaad@aifinder.ma', '$2y$10$demoUserHash06', 'moderateur', 'actif', NULL, '2025-06-14 11:35:00', '2026-06-02 17:20:00'),
(7, 'Lahcen', 'Omar', 'omar@aifinder.ma', '$2y$10$demoUserHash07', 'user', 'suspendu', NULL, '2025-07-01 13:00:00', '2026-04-14 12:00:00'),
(8, 'Raji', 'Imane', 'imane@aifinder.ma', '$2y$10$demoUserHash08', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/imane.png', '2025-08-22 20:10:00', '2026-06-04 08:55:00');

INSERT IGNORE INTO `categories`
(`id_Cat`, `nom_Cat`, `slug`, `icone`, `description`) VALUES
(1, 'Texte', 'texte', 'file-text', 'Outils IA pour redaction, resume, correction et generation de contenu.'),
(2, 'Image', 'image', 'image', 'Generation, edition et amelioration d images.'),
(3, 'Video', 'video', 'video', 'Creation et montage video assiste par intelligence artificielle.'),
(4, 'Audio', 'audio', 'mic', 'Transcription, voix, musique et traitement audio.'),
(5, 'Code', 'code', 'code', 'Assistants de programmation, revue de code et generation logicielle.'),
(6, 'Productivite', 'productivite', 'zap', 'Automatisation, recherche, organisation et travail quotidien.'),
(7, 'Recherche', 'recherche', 'search', 'Recherche documentaire, veille scientifique et analyse de sources.'),
(8, 'Marketing', 'marketing', 'megaphone', 'Creation de campagnes, SEO, publicite et reseaux sociaux.'),
(9, 'Education', 'education', 'graduation-cap', 'Apprentissage, tutorat, quiz et preparation aux examens.'),
(10, 'Data', 'data', 'bar-chart', 'Analyse de donnees, tableaux de bord et business intelligence.');

INSERT IGNORE INTO `tags`
(`id_tag`, `nom`, `slug`) VALUES
(1, 'LLM', 'llm'),
(2, 'Chatbot', 'chatbot'),
(3, 'Open source', 'open-source'),
(4, 'API', 'api'),
(5, 'No-code', 'no-code'),
(6, 'SEO', 'seo'),
(7, 'Transcription', 'transcription'),
(8, 'Image generation', 'image-generation'),
(9, 'Developer tools', 'developer-tools'),
(10, 'Automation', 'automation'),
(11, 'Research assistant', 'research-assistant'),
(12, 'Multimodal', 'multimodal'),
(13, 'Writing', 'writing'),
(14, 'Enterprise', 'enterprise'),
(15, 'Free plan', 'free-plan');

INSERT IGNORE INTO `plateforme`
(`id`, `nom`, `slug`) VALUES
(1, 'Web', 'web'),
(2, 'API', 'api'),
(3, 'Windows', 'windows'),
(4, 'macOS', 'macos'),
(5, 'Linux', 'linux'),
(6, 'iOS', 'ios'),
(7, 'Android', 'android'),
(8, 'Extension Chrome', 'extension-chrome'),
(9, 'Slack', 'slack'),
(10, 'Discord', 'discord');

INSERT IGNORE INTO `fournisseur`
(`id_fourn`, `nom`, `slug`, `website`, `country`, `logo_url`, `created_at`, `updated_at`) VALUES
(1, 'OpenAI', 'openai', 'https://openai.com', 'United States', 'https://cdn.aifinder.ma/logos/openai.svg', '2015-12-11', '2026-05-01'),
(2, 'Anthropic', 'anthropic', 'https://anthropic.com', 'United States', 'https://cdn.aifinder.ma/logos/anthropic.svg', '2021-01-01', '2026-04-20'),
(3, 'Google DeepMind', 'google-deepmind', 'https://deepmind.google', 'United Kingdom', 'https://cdn.aifinder.ma/logos/deepmind.svg', '2010-09-23', '2026-04-18'),
(4, 'Mistral AI', 'mistral-ai', 'https://mistral.ai', 'France', 'https://cdn.aifinder.ma/logos/mistral.svg', '2023-04-01', '2026-04-10'),
(5, 'Hugging Face', 'hugging-face', 'https://huggingface.co', 'United States', 'https://cdn.aifinder.ma/logos/huggingface.svg', '2016-01-01', '2026-03-28'),
(6, 'Stability AI', 'stability-ai', 'https://stability.ai', 'United Kingdom', 'https://cdn.aifinder.ma/logos/stability.svg', '2019-01-01', '2026-03-12'),
(7, 'Runway', 'runway', 'https://runwayml.com', 'United States', 'https://cdn.aifinder.ma/logos/runway.svg', '2018-01-01', '2026-03-22'),
(8, 'Perplexity AI', 'perplexity-ai', 'https://perplexity.ai', 'United States', 'https://cdn.aifinder.ma/logos/perplexity.svg', '2022-08-01', '2026-04-16'),
(9, 'Notion Labs', 'notion-labs', 'https://notion.so', 'United States', 'https://cdn.aifinder.ma/logos/notion.svg', '2016-01-01', '2026-02-11'),
(10, 'ElevenLabs', 'elevenlabs', 'https://elevenlabs.io', 'United States', 'https://cdn.aifinder.ma/logos/elevenlabs.svg', '2022-01-01', '2026-04-05');

INSERT IGNORE INTO `models`
(`idMod`, `nom`, `slug`, `type`, `description`, `licence`, `api_url`, `est_open_source`, `release_date`, `multimodal`, `a_api`, `id_fourn`) VALUES
(1, 'GPT-4o', 'gpt-4o', 'LLM multimodal', 'Modele generaliste pour texte, image et conversation.', 'Proprietary', 'https://api.openai.com/v1', 0, '2024-05-13', 1, 1, 1),
(2, 'GPT-4o mini', 'gpt-4o-mini', 'LLM', 'Modele rapide et economique pour assistants et workflows.', 'Proprietary', 'https://api.openai.com/v1', 0, '2024-07-18', 1, 1, 1),
(3, 'Claude 3.5 Sonnet', 'claude-3-5-sonnet', 'LLM', 'Modele d analyse, redaction et code avec grand contexte.', 'Proprietary', 'https://api.anthropic.com', 0, '2024-06-20', 1, 1, 2),
(4, 'Gemini 1.5 Pro', 'gemini-1-5-pro', 'LLM multimodal', 'Modele multimodal avec grande fenetre de contexte.', 'Proprietary', 'https://generativelanguage.googleapis.com', 0, '2024-02-15', 1, 1, 3),
(5, 'Mistral Large', 'mistral-large', 'LLM', 'Modele europeen performant pour generation et raisonnement.', 'Proprietary', 'https://api.mistral.ai', 0, '2024-02-26', 0, 1, 4),
(6, 'Mixtral 8x7B', 'mixtral-8x7b', 'LLM open source', 'Modele mixture-of-experts performant et deployable localement.', 'Apache 2.0', 'https://api.mistral.ai', 1, '2023-12-11', 0, 1, 4),
(7, 'Stable Diffusion XL', 'stable-diffusion-xl', 'Image generation', 'Modele de generation d images haute qualite.', 'OpenRAIL', 'https://api.stability.ai', 1, '2023-07-26', 1, 1, 6),
(8, 'Whisper Large v3', 'whisper-large-v3', 'Speech to text', 'Modele de transcription et traduction audio.', 'MIT', 'https://api.openai.com/v1/audio', 1, '2023-11-06', 0, 1, 1),
(9, 'Llama 3.1 70B', 'llama-3-1-70b', 'LLM open weights', 'Modele open weights puissant pour chat et agents.', 'Llama License', 'https://huggingface.co/meta-llama', 1, '2024-07-23', 0, 1, 5),
(10, 'Eleven Multilingual v2', 'eleven-multilingual-v2', 'Text to speech', 'Modele vocal multilingue pour synthese vocale naturelle.', 'Proprietary', 'https://api.elevenlabs.io', 0, '2023-08-01', 0, 1, 10);

INSERT IGNORE INTO `outils`
(`idOut`, `nom`, `slug`, `pricing_type`, `description_courte`, `description_longue`, `logo_url`, `site_url`, `statut`, `created_at`, `update_at`, `release_date`, `open_source`, `type_tarif`, `id_fourn`) VALUES
(1, 'ChatGPT', 'chatgpt', 'freemium', 'Assistant IA generaliste pour texte, code et images.', 'ChatGPT aide a rediger, analyser des documents, coder, apprendre et automatiser des taches quotidiennes.', 'https://cdn.aifinder.ma/tools/chatgpt.svg', 'https://chatgpt.com', 'actif', '2022-11-30', '2026-05-01', '2022-11-30', 0, 'abonnement', 1),
(2, 'Claude', 'claude', 'freemium', 'Assistant IA oriente analyse, redaction et code.', 'Claude est utilise pour les longs documents, la synthese, la programmation et les assistants professionnels.', 'https://cdn.aifinder.ma/tools/claude.svg', 'https://claude.ai', 'actif', '2023-03-14', '2026-04-25', '2023-03-14', 0, 'abonnement', 2),
(3, 'Gemini', 'gemini', 'freemium', 'Assistant IA de Google pour recherche, texte et multimodal.', 'Gemini combine conversation, recherche, images et integration avec les services Google.', 'https://cdn.aifinder.ma/tools/gemini.svg', 'https://gemini.google.com', 'actif', '2023-12-06', '2026-04-20', '2023-12-06', 0, 'abonnement', 3),
(4, 'Mistral Le Chat', 'mistral-le-chat', 'freemium', 'Assistant IA europeen pour chat et productivite.', 'Le Chat donne acces aux modeles Mistral pour reponses rapides, redaction et raisonnement.', 'https://cdn.aifinder.ma/tools/mistral.svg', 'https://chat.mistral.ai', 'actif', '2024-02-26', '2026-03-20', '2024-02-26', 0, 'gratuit-plus', 4),
(5, 'HuggingChat', 'huggingchat', 'free', 'Chat open source base sur des modeles communautaires.', 'HuggingChat permet de tester plusieurs modeles ouverts et assistants publics.', 'https://cdn.aifinder.ma/tools/huggingchat.svg', 'https://huggingface.co/chat', 'actif', '2023-04-25', '2026-02-19', '2023-04-25', 1, 'gratuit', 5),
(6, 'Perplexity', 'perplexity', 'freemium', 'Moteur de reponse IA avec sources citees.', 'Perplexity combine recherche web, citations et synthese pour explorer rapidement un sujet.', 'https://cdn.aifinder.ma/tools/perplexity.svg', 'https://perplexity.ai', 'actif', '2022-12-01', '2026-04-16', '2022-12-01', 0, 'abonnement', 8),
(7, 'Notion AI', 'notion-ai', 'paid', 'Assistant IA integre a Notion pour notes et documents.', 'Notion AI aide a resumer, reformuler et organiser les informations dans les espaces de travail.', 'https://cdn.aifinder.ma/tools/notion-ai.svg', 'https://notion.so/product/ai', 'actif', '2023-02-22', '2026-02-11', '2023-02-22', 0, 'abonnement', 9),
(8, 'Stable Diffusion', 'stable-diffusion', 'free', 'Generation d images open source.', 'Stable Diffusion permet de produire des images a partir de prompts et peut etre deploye localement.', 'https://cdn.aifinder.ma/tools/stable-diffusion.svg', 'https://stability.ai', 'actif', '2022-08-22', '2026-03-12', '2022-08-22', 1, 'gratuit', 6),
(9, 'Runway', 'runway', 'freemium', 'Creation et edition video assistee par IA.', 'Runway propose generation video, suppression d objets, sous-titrage et outils creatifs.', 'https://cdn.aifinder.ma/tools/runway.svg', 'https://runwayml.com', 'actif', '2018-01-01', '2026-03-22', '2018-01-01', 0, 'credits', 7),
(10, 'ElevenLabs', 'elevenlabs', 'freemium', 'Voix IA realistes et clonage vocal.', 'ElevenLabs genere de la synthese vocale naturelle et multilingue pour videos, podcasts et applications.', 'https://cdn.aifinder.ma/tools/elevenlabs.svg', 'https://elevenlabs.io', 'actif', '2022-01-01', '2026-04-05', '2022-01-01', 0, 'credits', 10),
(11, 'Whisper API', 'whisper-api', 'paid', 'Transcription audio via API.', 'Whisper API transforme audio et video en texte exploitable pour apps, support et recherche.', 'https://cdn.aifinder.ma/tools/whisper.svg', 'https://platform.openai.com/docs/guides/audio', 'actif', '2023-03-01', '2026-01-10', '2023-03-01', 1, 'pay-as-you-go', 1),
(12, 'Mistral API', 'mistral-api', 'paid', 'API pour modeles Mistral.', 'Mistral API permet d integrer les modeles Mistral dans des produits et workflows.', 'https://cdn.aifinder.ma/tools/mistral-api.svg', 'https://console.mistral.ai', 'actif', '2023-09-27', '2026-03-20', '2023-09-27', 0, 'pay-as-you-go', 4),
(13, 'Hugging Face Spaces', 'hugging-face-spaces', 'freemium', 'Hebergement de demos IA et applications ML.', 'Spaces permet de publier des demos IA en Gradio, Streamlit ou Docker.', 'https://cdn.aifinder.ma/tools/hf-spaces.svg', 'https://huggingface.co/spaces', 'actif', '2021-01-01', '2026-02-20', '2021-01-01', 1, 'gratuit-plus', 5),
(14, 'OpenAI API', 'openai-api', 'paid', 'API pour integrer les modeles OpenAI.', 'OpenAI API donne acces a des modeles texte, audio, image et multimodaux pour developpeurs.', 'https://cdn.aifinder.ma/tools/openai-api.svg', 'https://platform.openai.com', 'actif', '2020-06-11', '2026-05-01', '2020-06-11', 0, 'pay-as-you-go', 1),
(15, 'Canva Magic Studio', 'canva-magic-studio', 'freemium', 'Suite creative IA pour design et marketing.', 'Magic Studio aide a creer visuels, presentations, posts et contenus marketing avec IA.', 'https://cdn.aifinder.ma/tools/canva-magic.svg', 'https://www.canva.com/magic', 'actif', '2023-10-04', '2026-01-15', '2023-10-04', 0, 'abonnement', NULL);

INSERT IGNORE INTO `caracteristique`
(`id_Carct`, `cle`, `valeur`, `type_valeur`) VALUES
(1, 'context_window', '128k tokens', 'text'),
(2, 'languages', 'Multilingue', 'text'),
(3, 'deployment', 'Cloud', 'text'),
(4, 'deployment', 'Local possible', 'text'),
(5, 'latency', 'Faible', 'text'),
(6, 'privacy', 'Enterprise controls', 'text'),
(7, 'output', 'Texte', 'text'),
(8, 'output', 'Image', 'text'),
(9, 'output', 'Video', 'text'),
(10, 'output', 'Audio', 'text'),
(11, 'integration', 'REST API', 'text'),
(12, 'integration', 'Browser extension', 'text'),
(13, 'collaboration', 'Team workspace', 'text'),
(14, 'safety', 'Content moderation', 'text'),
(15, 'license', 'Open weights', 'text'),
(16, 'billing', 'Credits', 'text'),
(17, 'max_resolution', '1024x1024', 'text'),
(18, 'export', 'PDF, DOCX, Markdown', 'text');

INSERT IGNORE INTO `features`
(`id_features`, `name`, `description`) VALUES
(1, 'Chat interactif', 'Conversation naturelle avec historique et contexte.'),
(2, 'Generation de texte', 'Creation de contenus, emails, articles et scripts.'),
(3, 'Resume de document', 'Condense des documents longs en points importants.'),
(4, 'Analyse de fichier', 'Lecture et analyse de fichiers importes.'),
(5, 'Generation de code', 'Aide a ecrire, corriger et expliquer du code.'),
(6, 'Recherche web', 'Recherche et synthese avec references.'),
(7, 'Generation d image', 'Creation d images depuis un prompt.'),
(8, 'Edition d image', 'Modification et amelioration d images existantes.'),
(9, 'Generation video', 'Creation ou edition de sequences video.'),
(10, 'Transcription audio', 'Conversion d audio vers texte.'),
(11, 'Text to speech', 'Generation de voix naturelles depuis un texte.'),
(12, 'API developpeur', 'Acces API pour integrer l outil dans une application.'),
(13, 'Collaboration equipe', 'Espaces partages, roles et facturation equipe.'),
(14, 'Templates marketing', 'Modeles pour posts, campagnes et presentations.'),
(15, 'Export multi-format', 'Export des resultats dans plusieurs formats.');

INSERT IGNORE INTO `pricing_plans`
(`id_pricing_plans`, `name`, `price`, `currency`, `period`, `description`, `type`, `idOut`) VALUES
(1, 'Free', 0.00, 'USD', 'mois', 'Acces limite pour tester ChatGPT.', 'free', 1),
(2, 'Plus', 20.00, 'USD', 'mois', 'Acces etendu aux modeles avances.', 'premium', 1),
(3, 'Claude Pro', 20.00, 'USD', 'mois', 'Utilisation avancee de Claude.', 'premium', 2),
(4, 'Gemini Advanced', 19.99, 'USD', 'mois', 'Fonctions avancees et integration Google.', 'premium', 3),
(5, 'Le Chat Free', 0.00, 'EUR', 'mois', 'Acces gratuit aux modeles Mistral.', 'free', 4),
(6, 'HuggingChat Free', 0.00, 'USD', 'mois', 'Chat communautaire gratuit.', 'free', 5),
(7, 'Perplexity Pro', 20.00, 'USD', 'mois', 'Recherche IA avec usage pro.', 'premium', 6),
(8, 'Notion AI Add-on', 10.00, 'USD', 'mois', 'Assistant IA par membre.', 'premium', 7),
(9, 'Stable Diffusion Local', 0.00, 'USD', 'mois', 'Execution locale open source.', 'free', 8),
(10, 'Runway Standard', 15.00, 'USD', 'mois', 'Credits video pour createurs.', 'premium', 9),
(11, 'ElevenLabs Starter', 5.00, 'USD', 'mois', 'Voix IA pour petits projets.', 'premium', 10),
(12, 'Whisper Pay as you go', 0.01, 'USD', 'minute', 'Facturation a la minute transcrite.', 'usage', 11),
(13, 'Mistral API Build', 0.00, 'EUR', 'usage', 'Facturation selon les tokens consommes.', 'usage', 12),
(14, 'OpenAI API Usage', 0.00, 'USD', 'usage', 'Paiement selon consommation API.', 'usage', 14),
(15, 'Canva Pro', 15.00, 'USD', 'mois', 'Suite creative avec Magic Studio.', 'premium', 15);

INSERT IGNORE INTO `model_pricing`
(`id_model_pricing`, `input_price`, `output_price`, `currency`, `unit`, `effective_date`, `idMod`) VALUES
(1, 5.000000, 15.000000, 'USD', '1M tokens', '2025-01-01', 1),
(2, 0.150000, 0.600000, 'USD', '1M tokens', '2025-01-01', 2),
(3, 3.000000, 15.000000, 'USD', '1M tokens', '2025-01-01', 3),
(4, 3.500000, 10.500000, 'USD', '1M tokens', '2025-01-01', 4),
(5, 2.000000, 6.000000, 'EUR', '1M tokens', '2025-01-01', 5),
(6, 0.700000, 0.700000, 'EUR', '1M tokens', '2025-01-01', 6),
(7, 0.040000, 0.040000, 'USD', 'image', '2025-01-01', 7),
(8, 0.006000, 0.000000, 'USD', 'minute', '2025-01-01', 8),
(9, 0.900000, 0.900000, 'USD', '1M tokens', '2025-01-01', 9),
(10, 0.300000, 0.300000, 'USD', '1000 caracteres', '2025-01-01', 10);

INSERT IGNORE INTO `plan_models`
(`id_plan_models`, `id_pricing_plans`, `idMod`) VALUES
(1, 1, 2), (2, 2, 1), (3, 2, 2), (4, 3, 3), (5, 4, 4),
(6, 5, 5), (7, 5, 6), (8, 6, 9), (9, 7, 3), (10, 8, 2),
(11, 9, 7), (12, 10, 7), (13, 11, 10), (14, 12, 8), (15, 13, 5),
(16, 13, 6), (17, 14, 1), (18, 14, 2), (19, 15, 7);

INSERT IGNORE INTO `plan_model_limits`
(`id_plan_model_limits`, `id_plan_models`, `limit_type`, `value`, `period`) VALUES
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

INSERT IGNORE INTO `performance`
(`id_performance`, `domaine`, `score`) VALUES
(1, 'Redaction generale', 94),
(2, 'Raisonnement', 91),
(3, 'Code', 92),
(4, 'Recherche avec sources', 89),
(5, 'Generation image', 88),
(6, 'Edition video', 84),
(7, 'Transcription audio', 95),
(8, 'Synthese vocale', 93),
(9, 'Productivite', 90),
(10, 'Analyse de donnees', 86),
(11, 'Education', 88),
(12, 'Marketing', 87);

INSERT IGNORE INTO `reaction`
(`id_Reac`, `type`, `idU`, `idOut`) VALUES
(1, 'like', 2, 1), (2, 'like', 3, 1), (3, 'like', 4, 2), (4, 'like', 5, 6),
(5, 'like', 8, 10), (6, 'dislike', 7, 9), (7, 'like', 2, 8), (8, 'like', 3, 14),
(9, 'like', 4, 12), (10, 'like', 5, 7), (11, 'like', 8, 15), (12, 'dislike', 5, 3);

INSERT IGNORE INTO `commentaires`
(`id_com`, `contenu`, `statut`, `created_at`, `update_at`, `idU`, `idOut`, `parent_id`) VALUES
(1, 'Tres utile pour preparer un plan de projet et generer du code rapidement.', 'actif', '2026-01-12', NULL, 2, 1, NULL),
(2, 'Je confirme, mais il faut toujours verifier les resultats techniques.', 'actif', '2026-01-13', NULL, 4, 1, 1),
(3, 'Claude est excellent pour resumer de longs rapports.', 'actif', '2026-01-20', NULL, 3, 2, NULL),
(4, 'Perplexity donne des sources claires pour commencer une recherche.', 'actif', '2026-02-04', NULL, 5, 6, NULL),
(5, 'Stable Diffusion est puissant si on sait gerer les prompts et les modeles.', 'actif', '2026-02-18', NULL, 8, 8, NULL),
(6, 'Runway est pratique pour les montages courts de presentation.', 'actif', '2026-03-03', NULL, 4, 9, NULL),
(7, 'La qualite des voix ElevenLabs est tres convaincante.', 'actif', '2026-03-08', NULL, 2, 10, NULL),
(8, 'Whisper reste tres fiable pour les cours et reunions.', 'actif', '2026-03-15', NULL, 3, 11, NULL),
(9, 'Le Chat est rapide et simple a prendre en main.', 'actif', '2026-04-01', NULL, 6, 4, NULL),
(10, 'Notion AI marche bien pour organiser les notes de reunion.', 'actif', '2026-04-11', NULL, 5, 7, NULL),
(11, 'Je trouve Canva Magic Studio efficace pour les posts marketing.', 'actif', '2026-05-01', NULL, 8, 15, NULL),
(12, 'Hugging Face Spaces est parfait pour publier une demo etudiant.', 'actif', '2026-05-14', NULL, 2, 13, NULL);

INSERT IGNORE INTO `signalements`
(`id_Sig`, `motif`, `statut`, `date`, `description`, `created_at`, `idU`, `idOut`, `id_com`) VALUES
(1, 'Information obsolete', 'traite', '2026-02-20', 'Ancien tarif signale puis corrige.', '2026-02-20', 3, 9, NULL),
(2, 'Commentaire incomplet', 'en_attente', '2026-03-10', 'Demande de precision sur un avis.', '2026-03-10', 5, 10, 7),
(3, 'Lien a verifier', 'en_attente', '2026-04-03', 'Le lien de documentation semble changer.', '2026-04-03', 2, 12, NULL),
(4, 'Contenu duplique', 'rejete', '2026-04-19', 'Signalement non confirme apres verification.', '2026-04-19', 8, 1, 1);

INSERT IGNORE INTO `favori`
(`idFav`, `date_ajouter`, `idU`, `idOut`) VALUES
(1, '2026-01-12', 2, 1),
(2, '2026-01-22', 2, 6),
(3, '2026-02-05', 3, 2),
(4, '2026-02-18', 3, 11),
(5, '2026-03-02', 4, 9),
(6, '2026-03-09', 4, 12),
(7, '2026-03-15', 5, 7),
(8, '2026-04-01', 5, 15),
(9, '2026-04-14', 8, 8),
(10, '2026-05-01', 8, 10),
(11, '2026-05-04', 6, 4),
(12, '2026-05-17', 6, 14);

INSERT IGNORE INTO `historique_recherches`
(`id_Rech`, `query`, `date_Rech`, `resultats`, `idU`) VALUES
(1, 'meilleur outil IA pour redaction rapport', '2026-01-12 10:15:00', 8, 2),
(2, 'outil transcription cours francais arabe', '2026-01-18 18:44:00', 5, 3),
(3, 'generateur image open source', '2026-02-11 09:21:00', 6, 8),
(4, 'assistant code React', '2026-02-28 14:10:00', 7, 4),
(5, 'outil recherche avec sources', '2026-03-04 16:35:00', 4, 5),
(6, 'voix IA realiste video youtube', '2026-03-19 20:02:00', 5, 2),
(7, 'API LLM pas cher', '2026-04-07 12:11:00', 6, 6),
(8, 'outil marketing pour publication instagram', '2026-05-01 11:08:00', 5, 8),
(9, 'modele open source local', '2026-05-10 17:30:00', 4, 3),
(10, 'generation video presentation', '2026-05-21 19:45:00', 3, 4);

INSERT IGNORE INTO `collection`
(`id_coll`, `nom`, `decription`, `created_at`, `idU`) VALUES
(1, 'Outils pour etudes', 'Selection pour cours, resumes et recherche.', '2026-01-12', 2),
(2, 'Stack developpeur', 'APIs et assistants pour projets web.', '2026-02-01', 4),
(3, 'Creation contenu', 'Image, video, voix et marketing.', '2026-02-18', 8),
(4, 'Recherche et veille', 'Sources, synthese et analyse documentaire.', '2026-03-04', 5),
(5, 'Open source local', 'Modeles et outils deployables sans dependance forte.', '2026-04-15', 3),
(6, 'Admin favoris', 'Outils verifies par la moderation.', '2026-05-02', 1);

INSERT IGNORE INTO `soumission_outil`
(`id_soum`, `statut`, `note_admin`, `nombre_soum`, `limite_soum`, `created_at`, `update_at`, `idU`, `idOut`) VALUES
(1, 'validé', 'Outil populaire et fiche complete.', 1, 3, '2026-01-10', '2026-01-12', 2, 1),
(2, 'validé', 'Ajoute dans la categorie recherche.', 1, 3, '2026-02-01', '2026-02-03', 5, 6),
(3, 'en_attente', NULL, 1, 3, '2026-03-12', NULL, 8, 15),
(4, 'refusé', 'Description trop courte et lien non officiel.', 2, 3, '2026-03-19', '2026-03-20', 7, NULL),
(5, 'validé', 'API utile pour les developpeurs.', 1, 3, '2026-04-06', '2026-04-07', 6, 14),
(6, 'en_attente', 'Verifier les informations tarifaires.', 1, 3, '2026-05-09', NULL, 3, 13);

INSERT IGNORE INTO `notification`
(`id_Notif`, `cible`, `type`, `titre`, `message`, `created_at`, `idU`) VALUES
(1, 'user', 'soumission', 'Soumission validee', 'Votre proposition ChatGPT a ete validee.', '2026-01-12', 2),
(2, 'user', 'favori', 'Nouvel outil recommande', 'Perplexity correspond a votre historique de recherche.', '2026-02-05', 5),
(3, 'admin', 'signalement', 'Signalement a traiter', 'Un utilisateur a signale un commentaire sur ElevenLabs.', '2026-03-10', 1),
(4, 'user', 'collection', 'Collection mise a jour', 'Votre collection Creation contenu contient de nouveaux outils.', '2026-03-20', 8),
(5, 'moderateur', 'soumission', 'Nouvelle soumission', 'Une nouvelle fiche est en attente de verification.', '2026-05-09', 6),
(6, 'user', 'avis', 'Merci pour votre avis', 'Votre avis aide la communaute AIFinder.', '2026-05-18', 3),
(7, 'user', 'securite', 'Connexion recente', 'Connexion detectee sur votre compte.', '2026-06-02', 4),
(8, 'admin', 'systeme', 'Rapport mensuel', 'Le tableau de bord contient les statistiques du mois.', '2026-06-01', 1);

INSERT IGNORE INTO `avis`
(`id_avis`, `note`, `titre`, `contenu`, `created_at`, `idU`, `idOut`) VALUES
(1, 5, 'Indispensable', 'Tres bon assistant pour redaction, idees et code.', '2026-01-15', 2, 1),
(2, 5, 'Excellent pour les documents', 'Claude aide beaucoup pour les longs textes.', '2026-01-22', 3, 2),
(3, 4, 'Bon outil de recherche', 'Perplexity donne des pistes rapides avec sources.', '2026-02-08', 5, 6),
(4, 4, 'Pratique pour developpeurs', 'OpenAI API est bien documentee et flexible.', '2026-02-19', 4, 14),
(5, 5, 'Voix tres naturelles', 'ElevenLabs est impressionnant pour narration.', '2026-03-10', 8, 10),
(6, 4, 'Bon rapport qualite prix', 'Mistral API est interessante pour des apps europeennes.', '2026-03-24', 6, 12),
(7, 3, 'Courbe d apprentissage', 'Stable Diffusion demande du temps pour de bons resultats.', '2026-04-02', 3, 8),
(8, 4, 'Utile pour videos courtes', 'Runway accelere les prototypes video.', '2026-04-17', 4, 9),
(9, 5, 'Super pour etudiants', 'Whisper transcrit bien les cours et reunions.', '2026-05-02', 2, 11),
(10, 4, 'Design rapide', 'Canva Magic Studio aide pour supports de presentation.', '2026-05-15', 8, 15);

INSERT IGNORE INTO `outil_categorie`
(`idOut`, `id_Cat`) VALUES
(1, 1), (1, 5), (1, 6), (2, 1), (2, 5), (3, 1), (3, 6), (4, 1), (4, 6),
(5, 1), (5, 5), (6, 7), (6, 6), (7, 6), (7, 1), (8, 2), (9, 3), (10, 4),
(11, 4), (12, 5), (14, 5), (14, 1), (15, 2), (15, 8);

INSERT IGNORE INTO `outil_tag`
(`idOut`, `id_tag`) VALUES
(1, 1), (1, 2), (1, 4), (1, 12), (2, 1), (2, 2), (2, 13), (3, 1), (3, 12),
(4, 1), (4, 15), (5, 1), (5, 3), (6, 11), (6, 2), (7, 10), (7, 13),
(8, 3), (8, 8), (9, 12), (10, 7), (11, 7), (11, 4), (12, 4), (12, 9),
(13, 3), (13, 9), (14, 4), (14, 9), (15, 5), (15, 6), (15, 8);

INSERT IGNORE INTO `outil_model`
(`idOut`, `idMod`) VALUES
(1, 1), (1, 2), (2, 3), (3, 4), (4, 5), (4, 6), (5, 9), (6, 3), (6, 4),
(8, 7), (9, 7), (10, 10), (11, 8), (12, 5), (12, 6), (13, 9), (14, 1), (14, 2), (15, 7);

INSERT IGNORE INTO `outil_caracteristique`
(`idOut`, `id_Carct`) VALUES
(1, 1), (1, 2), (1, 3), (1, 11), (2, 1), (2, 2), (2, 6), (3, 2), (3, 3),
(4, 2), (4, 5), (5, 4), (5, 15), (6, 11), (6, 12), (7, 13), (7, 18),
(8, 4), (8, 8), (8, 17), (9, 9), (9, 16), (10, 10), (10, 16),
(11, 10), (11, 11), (12, 11), (12, 5), (13, 4), (13, 13), (14, 11), (14, 14),
(15, 8), (15, 13), (15, 18);

INSERT IGNORE INTO `outil_plateforme`
(`idOut`, `id`) VALUES
(1, 1), (1, 2), (1, 6), (1, 7), (2, 1), (2, 2), (2, 6), (2, 7), (3, 1), (3, 6), (3, 7),
(4, 1), (4, 2), (5, 1), (6, 1), (6, 2), (6, 8), (7, 1), (7, 6), (7, 7),
(8, 1), (8, 5), (8, 3), (8, 4), (9, 1), (10, 1), (10, 2), (11, 2), (12, 2),
(13, 1), (14, 2), (15, 1), (15, 6), (15, 7);

INSERT IGNORE INTO `collection_outil`
(`id_coll`, `idOut`) VALUES
(1, 1), (1, 2), (1, 6), (1, 11), (2, 1), (2, 12), (2, 13), (2, 14),
(3, 8), (3, 9), (3, 10), (3, 15), (4, 2), (4, 6), (4, 7), (5, 5),
(5, 8), (5, 13), (6, 1), (6, 6), (6, 14);

INSERT IGNORE INTO `validation_outil`
(`idU`, `idOut`, `date`, `statut`) VALUES
(1, 1, '2026-01-12 09:30:00', 'validé'),
(1, 2, '2026-01-20 11:00:00', 'validé'),
(1, 6, '2026-02-03 15:45:00', 'validé'),
(6, 8, '2026-02-18 10:20:00', 'validé'),
(6, 10, '2026-03-10 16:12:00', 'validé'),
(1, 12, '2026-04-07 14:35:00', 'validé'),
(1, 14, '2026-04-08 09:15:00', 'validé'),
(6, 15, '2026-05-14 18:25:00', 'en_attente');

INSERT IGNORE INTO `model_caracteristique`
(`id_Carct`, `idMod`) VALUES
(1, 1), (2, 1), (3, 1), (11, 1), (1, 2), (2, 2), (5, 2), (1, 3), (2, 3), (6, 3),
(1, 4), (2, 4), (3, 4), (2, 5), (5, 5), (11, 5), (4, 6), (15, 6), (8, 7),
(17, 7), (10, 8), (11, 8), (4, 9), (15, 9), (10, 10), (16, 10);

INSERT IGNORE INTO `model_feature`
(`id_features`, `idMod`) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (12, 1), (1, 2), (2, 2), (5, 2),
(1, 3), (2, 3), (3, 3), (5, 3), (1, 4), (4, 4), (6, 4), (1, 5), (2, 5),
(5, 5), (12, 5), (1, 6), (2, 6), (5, 6), (7, 7), (8, 7), (10, 8),
(1, 9), (2, 9), (5, 9), (11, 10), (12, 10);

INSERT IGNORE INTO `outil_feature`
(`id_features`, `idOut`) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (12, 1), (1, 2), (2, 2), (3, 2),
(1, 3), (4, 3), (6, 3), (1, 4), (2, 4), (1, 5), (5, 5), (6, 6), (3, 6),
(2, 7), (3, 7), (13, 7), (7, 8), (8, 8), (9, 9), (10, 11), (11, 10),
(12, 12), (12, 14), (13, 13), (14, 15), (15, 15);

INSERT IGNORE INTO `plan_feature`
(`id_features`, `id_pricing_plans`) VALUES
(1, 1), (2, 1), (1, 2), (2, 2), (4, 2), (5, 2), (1, 3), (3, 3), (5, 3),
(1, 4), (4, 4), (6, 4), (1, 5), (2, 5), (1, 6), (5, 6), (6, 7), (3, 7),
(2, 8), (13, 8), (7, 9), (8, 9), (9, 10), (11, 11), (10, 12), (12, 13),
(12, 14), (14, 15), (15, 15);

INSERT IGNORE INTO `outil_performance`
(`idOut`, `id_performance`) VALUES
(1, 1), (1, 2), (1, 3), (1, 9), (2, 1), (2, 2), (2, 3), (3, 4), (3, 9),
(4, 1), (4, 2), (5, 3), (6, 4), (6, 7), (7, 9), (8, 5), (9, 6), (10, 8),
(11, 7), (12, 3), (13, 3), (14, 3), (14, 10), (15, 12);

INSERT IGNORE INTO `model_performance`
(`idMod`, `id_performance`) VALUES
(1, 1), (1, 2), (1, 3), (1, 9), (2, 1), (2, 3), (3, 1), (3, 2), (3, 3),
(4, 2), (4, 4), (5, 1), (5, 2), (5, 3), (6, 3), (6, 10), (7, 5), (8, 7),
(9, 3), (9, 10), (10, 8);

SET FOREIGN_KEY_CHECKS = 1;
