-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 16 juin 2026 à 06:47
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

CREATE DATABASE IF NOT EXISTS `AI_TOOL`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE `AI_TOOL`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ai_tool`
--

-- --------------------------------------------------------

--
-- Structure de la table `caracteristique`
--

CREATE TABLE `caracteristique` (
  `ID_CARACT` int(11) NOT NULL,
  `CLE` char(50) DEFAULT NULL,
  `VALEUR` char(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `caracteristique`
--

INSERT INTO `caracteristique` (`ID_CARACT`, `CLE`, `VALEUR`) VALUES
(1, 'context_window', '128k tokens'),
(2, 'languages', 'Multilingue'),
(3, 'deployment', 'Cloud'),
(4, 'deployment', 'Local possible'),
(5, 'latency', 'Faible'),
(6, 'privacy', 'Enterprise controls'),
(7, 'output', 'Texte'),
(8, 'output', 'Image'),
(9, 'output', 'Vid?o'),
(10, 'output', 'Audio'),
(11, 'integration', 'REST API'),
(12, 'integration', 'Extension navigateur'),
(13, 'collaboration', 'Espace de travail partag?'),
(14, 'safety', 'Mod?ration de contenu'),
(15, 'license', 'Open weights'),
(16, 'billing', 'Cr?dits'),
(17, 'max_resolution', '1024x1024'),
(18, 'export', 'PDF, DOCX, Markdown');

-- --------------------------------------------------------

--
-- Structure de la table `caracteristique_modele`
--

CREATE TABLE `caracteristique_modele` (
  `ID_CARACT` int(11) NOT NULL,
  `IDMOD` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `caracteristique_modele`
--

INSERT INTO `caracteristique_modele` (`ID_CARACT`, `IDMOD`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(3, 1),
(3, 4),
(4, 6),
(4, 9),
(5, 2),
(5, 5),
(6, 3),
(8, 7),
(10, 8),
(10, 10),
(11, 1),
(11, 5),
(11, 8),
(15, 6),
(15, 9),
(16, 10),
(17, 7);

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `ID_CATEGORIE` int(11) NOT NULL,
  `NOM` char(100) DEFAULT NULL,
  `SLUG` char(100) DEFAULT NULL,
  `ICONE` char(200) DEFAULT NULL,
  `DESCRIPTION` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`ID_CATEGORIE`, `NOM`, `SLUG`, `ICONE`, `DESCRIPTION`) VALUES
(1, 'Texte', 'texte', 'file-text', 'Outils IA pour r?daction, r?sum? et g?n?ration de contenu.'),
(2, 'Image', 'image', 'image', 'G?n?ration, ?dition et am?lioration d\'images.'),
(3, 'Vid?o', 'video', 'video', 'Cr?ation et montage vid?o assist?s par IA.'),
(4, 'Audio', 'audio', 'mic', 'Transcription, voix, musique et traitement audio.'),
(5, 'Code', 'code', 'code', 'Assistants de programmation, revue de code.'),
(6, 'Productivit?', 'productivite', 'zap', 'Automatisation, organisation et travail quotidien.'),
(7, 'Recherche', 'recherche', 'search', 'Recherche documentaire et analyse de sources.'),
(8, 'Marketing', 'marketing', 'megaphone', 'Cr?ation de campagnes, SEO, publicit?.'),
(9, '?ducation', 'education', 'graduation-cap', 'Apprentissage, tutorat, quiz.'),
(10, 'Data', 'data', 'bar-chart', 'Analyse de donn?es et business intelligence.'),
(13, 'moi', 'moi', 'Layers', 'rererere'),
(14, 'bonne chance', 'mon-example', 'Image', 'c \'est  une categorie qui fait bien des chose');

-- --------------------------------------------------------

--
-- Structure de la table `collection`
--

CREATE TABLE `collection` (
  `ID_COLLECTION` int(11) NOT NULL,
  `IDU` int(11) NOT NULL,
  `NOM` char(100) DEFAULT NULL,
  `DESCRIPTION` longtext DEFAULT NULL,
  `DATE_MISE_A_JOUR` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `collection`
--

INSERT INTO `collection` (`ID_COLLECTION`, `IDU`, `NOM`, `DESCRIPTION`, `DATE_MISE_A_JOUR`) VALUES
(1, 2, 'Outils pour ?tudes', 'S?lection pour cours, r?sum?s et recherche.', '2026-01-12'),
(2, 4, 'Stack d?veloppeur', 'APIs et assistants pour projets web.', '2026-02-01'),
(3, 8, 'Cr?ation contenu', 'Image, vid?o, voix et marketing.', '2026-02-18'),
(4, 5, 'Recherche et veille', 'Sources, synth?se et analyse documentaire.', '2026-03-04'),
(5, 3, 'Open source local', 'Mod?les et outils d?ployables sans d?pendance forte.', '2026-04-15'),
(6, 1, 'Admin favoris', 'Outils v?rifi?s par la mod?ration.', '2026-05-02'),
(7, 9, 'zezeze', 'zezeze', '2026-06-14'),
(8, 9, 'nouvelle collect', 'pour une concentration ', '2026-06-14');

-- --------------------------------------------------------

--
-- Structure de la table `collection_outil`
--

CREATE TABLE `collection_outil` (
  `ID_COLLECTION` int(11) NOT NULL,
  `IDOUT` int(11) NOT NULL,
  `DATE_AJOUT` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `collection_outil`
--

INSERT INTO `collection_outil` (`ID_COLLECTION`, `IDOUT`, `DATE_AJOUT`) VALUES
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
(6, 14, '2026-05-10'),
(7, 2, '2026-06-14'),
(7, 6, '2026-06-14'),
(8, 1, '2026-06-14'),
(8, 2, '2026-06-14');

-- --------------------------------------------------------

--
-- Structure de la table `commentaires`
--

CREATE TABLE `commentaires` (
  `ID_COMMENTAIRE` int(11) NOT NULL,
  `COMMENTAIRE_PARENT_ID` int(11) DEFAULT NULL,
  `IDOUT` int(11) NOT NULL,
  `IDU` int(11) NOT NULL,
  `CONTENU` longtext DEFAULT NULL,
  `STATUT` char(10) DEFAULT NULL,
  `DATE_MISE_A_JOUR` date DEFAULT NULL,
  `UPDATED_AT` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `commentaires`
--

INSERT INTO `commentaires` (`ID_COMMENTAIRE`, `COMMENTAIRE_PARENT_ID`, `IDOUT`, `IDU`, `CONTENU`, `STATUT`, `DATE_MISE_A_JOUR`, `UPDATED_AT`) VALUES
(1, NULL, 1, 2, 'Tr?s utile pour pr?parer un plan de projet et g?n?rer du code rapidement.', 'actif', '2026-01-12', NULL),
(2, 1, 1, 4, 'Je confirme, mais il faut toujours v?rifier les r?sultats techniques.', 'actif', '2026-01-13', NULL),
(3, NULL, 2, 3, 'Claude est excellent pour r?sumer de longs rapports.', 'actif', '2026-01-20', NULL),
(4, NULL, 6, 5, 'Perplexity donne des sources claires pour commencer une recherche.', 'actif', '2026-02-04', NULL),
(5, NULL, 8, 8, 'Stable Diffusion est puissant si on sait g?rer les prompts.', 'actif', '2026-02-18', NULL),
(6, NULL, 9, 4, 'Runway est pratique pour les montages courts de pr?sentation.', 'actif', '2026-03-03', NULL),
(7, NULL, 10, 2, 'La qualit? des voix ElevenLabs est tr?s convaincante.', 'actif', '2026-03-08', NULL),
(8, NULL, 11, 3, 'Whisper reste tr?s fiable pour les cours et r?unions.', 'actif', '2026-03-15', NULL),
(9, NULL, 4, 6, 'Le Chat est rapide et simple ? prendre en main.', 'actif', '2026-04-01', NULL),
(10, NULL, 7, 5, 'Notion AI marche bien pour organiser les notes de r?union.', 'actif', '2026-04-11', NULL),
(11, NULL, 15, 8, 'Je trouve Canva Magic Studio efficace pour les posts marketing.', 'actif', '2026-05-01', NULL),
(12, NULL, 13, 2, 'Hugging Face Spaces est parfait pour publier une d?mo ?tudiante.', 'actif', '2026-05-14', NULL),
(14, NULL, 1, 9, 'salut\n', 'actif', '2026-06-14', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `favori`
--

CREATE TABLE `favori` (
  `ID_FAVORI` int(11) NOT NULL,
  `IDOUT` int(11) NOT NULL,
  `IDU` int(11) NOT NULL,
  `DATE_AJOUT` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `favori`
--

INSERT INTO `favori` (`ID_FAVORI`, `IDOUT`, `IDU`, `DATE_AJOUT`) VALUES
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
(12, 14, 6, '2026-05-17'),
(13, 2, 10, '2026-06-13'),
(14, 1, 10, '2026-06-13'),
(15, 1, 9, '2026-06-14'),
(17, 2, 9, '2026-06-14');

-- --------------------------------------------------------

--
-- Structure de la table `features`
--

CREATE TABLE `features` (
  `ID_FEATURE` int(11) NOT NULL,
  `NOM` char(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `features`
--

INSERT INTO `features` (`ID_FEATURE`, `NOM`) VALUES
(1, 'Chat interactif'),
(2, 'G?n?ration de texte'),
(3, 'R?sum? de document'),
(4, 'Analyse de fichier'),
(5, 'G?n?ration de code'),
(6, 'Recherche web'),
(7, 'G?n?ration d\'image'),
(8, '?dition d\'image'),
(9, 'G?n?ration vid?o'),
(10, 'Transcription audio'),
(11, 'Text to speech'),
(12, 'API d?veloppeur'),
(13, 'Collaboration ?quipe'),
(14, 'Templates marketing'),
(15, 'Export multi-format'),
(16, 'azazazaza'),
(17, 'qssqsqsqssqsqsqq'),
(18, 'wxwwxw'),
(19, 'une fonctionnalité ali'),
(20, 'manger'),
(21, 'ami'),
(22, 'dancer'),
(23, 'poarler'),
(24, 'fonct');

-- --------------------------------------------------------

--
-- Structure de la table `feature_modele`
--

CREATE TABLE `feature_modele` (
  `ID_FEATURE` int(11) NOT NULL,
  `IDMOD` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `feature_modele`
--

INSERT INTO `feature_modele` (`ID_FEATURE`, `IDMOD`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 9),
(2, 1),
(2, 2),
(2, 3),
(2, 5),
(2, 6),
(2, 9),
(3, 1),
(3, 3),
(4, 1),
(4, 4),
(5, 1),
(5, 2),
(5, 3),
(5, 5),
(5, 6),
(5, 9),
(6, 4),
(7, 7),
(8, 7),
(10, 8),
(11, 10),
(12, 1),
(12, 5),
(12, 10);

-- --------------------------------------------------------

--
-- Structure de la table `feature_pricing`
--

CREATE TABLE `feature_pricing` (
  `ID_FEATURE` int(11) NOT NULL,
  `ID_PRICING_PLAN` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `feature_pricing`
--

INSERT INTO `feature_pricing` (`ID_FEATURE`, `ID_PRICING_PLAN`) VALUES
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 27),
(1, 28),
(2, 5),
(2, 8),
(2, 27),
(2, 28),
(3, 3),
(3, 7),
(4, 4),
(4, 28),
(5, 3),
(5, 6),
(5, 28),
(6, 4),
(6, 7),
(7, 9),
(8, 9),
(9, 10),
(10, 12),
(11, 11),
(12, 13),
(12, 14),
(13, 8),
(14, 15),
(15, 15),
(20, 20),
(24, 17);

-- --------------------------------------------------------

--
-- Structure de la table `fournisseur`
--

CREATE TABLE `fournisseur` (
  `ID_FOURNISSEUR` int(11) NOT NULL,
  `NOM` char(100) DEFAULT NULL,
  `SLUG` char(100) DEFAULT NULL,
  `WEBSITE` char(200) DEFAULT NULL,
  `PAYS` char(100) DEFAULT NULL,
  `LOGO_URL` char(200) DEFAULT NULL,
  `DATE_MISE_A_JOUR` date DEFAULT NULL,
  `UPDATED_AT` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `fournisseur`
--

INSERT INTO `fournisseur` (`ID_FOURNISSEUR`, `NOM`, `SLUG`, `WEBSITE`, `PAYS`, `LOGO_URL`, `DATE_MISE_A_JOUR`, `UPDATED_AT`) VALUES
(1, 'OpenAI', 'openai', 'https://openai.com', 'United States', 'https://cdn.aifinder.ma/logos/openai.svg', '2026-05-01', '2026-05-01'),
(2, 'Anthropic', 'anthropic', 'https://anthropic.com', 'United States', 'https://cdn.aifinder.ma/logos/anthropic.svg', '2026-04-20', '2026-04-20'),
(3, 'Google DeepMind', 'google-deepmind', 'https://deepmind.google', 'United Kingdom', 'https://cdn.aifinder.ma/logos/deepmind.svg', '2026-04-18', '2026-04-18'),
(4, 'Mistral AI', 'mistral-ai', 'https://mistral.ai', 'France', 'https://cdn.aifinder.ma/logos/mistral.svg', '2026-04-10', '2026-04-10'),
(5, 'Hugging Face', 'hugging-face', 'https://huggingface.co', 'United States', 'https://cdn.aifinder.ma/logos/huggingface.svg', '2026-03-28', '2026-03-28'),
(6, 'Stability AI', 'stability-ai', 'https://stability.ai', 'United Kingdom', 'https://cdn.aifinder.ma/logos/stability.svg', '2026-03-12', '2026-03-12'),
(7, 'Runway', 'runway', 'https://runwayml.com', 'United States', 'https://cdn.aifinder.ma/logos/runway.svg', '2026-03-22', '2026-03-22'),
(8, 'Perplexity AI', 'perplexity-ai', 'https://perplexity.ai', 'United States', 'https://cdn.aifinder.ma/logos/perplexity.svg', '2026-04-16', '2026-04-16'),
(9, 'Notion Labs', 'notion-labs', 'https://notion.so', 'United States', 'https://cdn.aifinder.ma/logos/notion.svg', '2026-02-11', '2026-02-11'),
(10, 'ElevenLabs', 'elevenlabs', 'https://elevenlabs.io', 'United States', 'https://cdn.aifinder.ma/logos/elevenlabs.svg', '2026-04-05', '2026-04-05'),
(11, 'anass', 'anass', NULL, NULL, NULL, '2026-06-14', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `historique_recherches`
--

CREATE TABLE `historique_recherches` (
  `ID_RECHERCHE` int(11) NOT NULL,
  `IDU` int(11) NOT NULL,
  `QUERY` longtext DEFAULT NULL,
  `DATE_RECHERCHE` datetime DEFAULT NULL,
  `RESULTATS` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `historique_recherches`
--

INSERT INTO `historique_recherches` (`ID_RECHERCHE`, `IDU`, `QUERY`, `DATE_RECHERCHE`, `RESULTATS`) VALUES
(1, 2, 'meilleur outil IA pour r?daction rapport', '2026-01-12 10:15:00', 8),
(2, 3, 'outil transcription cours fran?ais arabe', '2026-01-18 18:44:00', 5),
(3, 8, 'g?n?rateur image open source', '2026-02-11 09:21:00', 6),
(4, 4, 'assistant code React', '2026-02-28 14:10:00', 7),
(5, 5, 'outil recherche avec sources', '2026-03-04 16:35:00', 4),
(6, 2, 'voix IA r?aliste vid?o youtube', '2026-03-19 20:02:00', 5),
(7, 6, 'API LLM pas cher', '2026-04-07 12:11:00', 6),
(8, 8, 'outil marketing pour publication instagram', '2026-05-01 11:08:00', 5),
(9, 3, 'mod?le open source local', '2026-05-10 17:30:00', 4),
(10, 4, 'g?n?ration vid?o pr?sentation', '2026-05-21 19:45:00', 3);

-- --------------------------------------------------------

--
-- Structure de la table `models`
--

CREATE TABLE `models` (
  `IDMOD` int(11) NOT NULL,
  `ID_FOURNISSEUR` int(11) NOT NULL,
  `NOM` char(100) DEFAULT NULL,
  `SLUG` char(100) DEFAULT NULL,
  `TYPE` char(20) DEFAULT NULL,
  `DESCRIPTION` longtext DEFAULT NULL,
  `API_URL` char(255) DEFAULT NULL,
  `EST_OPEN_SOURCE` tinyint(1) DEFAULT NULL,
  `DATE_SORTIE` date DEFAULT NULL,
  `POSSEDE_API` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `models`
--

INSERT INTO `models` (`IDMOD`, `ID_FOURNISSEUR`, `NOM`, `SLUG`, `TYPE`, `DESCRIPTION`, `API_URL`, `EST_OPEN_SOURCE`, `DATE_SORTIE`, `POSSEDE_API`) VALUES
(1, 1, 'GPT-4o', 'gpt-4o', 'LLM multimodal', 'Mod?le g?n?raliste pour texte, image et conversation.', 'https://api.openai.com/v1', 0, '2024-05-13', 1),
(2, 1, 'GPT-4o mini', 'gpt-4o-mini', 'LLM', 'Mod?le rapide et ?conomique.', 'https://api.openai.com/v1', 0, '2024-07-18', 1),
(3, 2, 'Claude 3.5 Sonnet', 'claude-3-5-sonnet', 'LLM', 'Mod?le d\'analyse, r?daction et code.', 'https://api.anthropic.com', 0, '2024-06-20', 1),
(4, 3, 'Gemini 1.5 Pro', 'gemini-1-5-pro', 'LLM multimodal', 'Mod?le multimodal avec grande fen?tre de contexte.', 'https://generativelanguage.googleapis.com', 0, '2024-02-15', 1),
(5, 4, 'Mistral Large', 'mistral-large', 'LLM', 'Mod?le europ?en performant.', 'https://api.mistral.ai', 0, '2024-02-26', 1),
(6, 4, 'Mixtral 8x7B', 'mixtral-8x7b', 'LLM open source', 'Mod?le mixture-of-experts.', 'https://api.mistral.ai', 1, '2023-12-11', 1),
(7, 6, 'Stable Diffusion XL', 'stable-diffusion-xl', 'Image generation', 'Mod?le de g?n?ration d\'images haute qualit?.', 'https://api.stability.ai', 1, '2023-07-26', 1),
(8, 1, 'Whisper Large v3', 'whisper-large-v3', 'Speech to text', 'Transcription et traduction audio.', 'https://api.openai.com/v1/audio', 1, '2023-11-06', 1),
(9, 5, 'Llama 3.1 70B', 'llama-3-1-70b', 'LLM open weights', 'Mod?le open weights puissant.', 'https://huggingface.co/meta-llama', 1, '2024-07-23', 1),
(10, 10, 'Eleven Multilingual v2', 'eleven-multilingual-v2', 'Text to speech', 'Synth?se vocale naturelle multilingue.', 'https://api.elevenlabs.io', 0, '2023-08-01', 1),
(11, 11, 'essai', 'essai', 'LLM', 'c \'est une description', NULL, 0, '2026-06-01', 1),
(12, 11, 'nouv', 'nouv', 'LLM', 'azezerzrezr', '', 0, '2026-06-01', 1),
(13, 11, 'mon model de test', 'mon-model-de-test', '', 'sfwsdgsgqg', '', 1, '2026-06-02', 1);

-- --------------------------------------------------------

--
-- Structure de la table `model_pricing`
--

CREATE TABLE `model_pricing` (
  `ID_MODEL_PRICING` int(11) NOT NULL,
  `IDMOD` int(11) NOT NULL,
  `PRIX_ENTREE` decimal(20,2) DEFAULT NULL,
  `PRIX_SORTIE` decimal(20,2) DEFAULT NULL,
  `DEVISE` varchar(3) DEFAULT NULL,
  `UNITE` int(11) DEFAULT NULL,
  `DATE_EFFECTIVE` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `model_pricing`
--

INSERT INTO `model_pricing` (`ID_MODEL_PRICING`, `IDMOD`, `PRIX_ENTREE`, `PRIX_SORTIE`, `DEVISE`, `UNITE`, `DATE_EFFECTIVE`) VALUES
(1, 1, 5.00, 15.00, 'USD', 1000000, '2025-01-01'),
(2, 2, 0.15, 0.60, 'USD', 1000000, '2025-01-01'),
(3, 3, 3.00, 15.00, 'USD', 1000000, '2025-01-01'),
(4, 4, 3.50, 10.50, 'USD', 1000000, '2025-01-01'),
(5, 5, 2.00, 6.00, 'EUR', 1000000, '2025-01-01'),
(6, 6, 0.70, 0.70, 'EUR', 1000000, '2025-01-01'),
(7, 7, 0.04, 0.04, 'USD', 1, '2025-01-01'),
(8, 8, 0.01, 0.00, 'USD', 1, '2025-01-01'),
(9, 9, 0.90, 0.90, 'USD', 1000000, '2025-01-01'),
(10, 10, 0.30, 0.30, 'USD', 1000, '2025-01-01'),
(11, 11, 50.00, 60.00, '€', 1000000, '2026-06-14'),
(12, 12, 5455.00, NULL, '€', 1000000, '2026-06-14');

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `ID_NOTIF` int(11) NOT NULL,
  `CIBLE` varchar(10) DEFAULT NULL,
  `TYPE` char(20) DEFAULT NULL,
  `MESSAGE` longtext DEFAULT NULL,
  `DATE_MISE_A_JOUR` date DEFAULT NULL,
  `TITRE` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notification`
--

INSERT INTO `notification` (`ID_NOTIF`, `CIBLE`, `TYPE`, `MESSAGE`, `DATE_MISE_A_JOUR`, `TITRE`) VALUES
(1, 'user', 'soumission', 'Votre soumission pour ChatGPT a ?t? valid?e.', '2026-01-12', NULL),
(2, 'user', 'favori', 'Perplexity correspond ? vos centres d\'int?r?t.', '2026-02-05', NULL),
(3, 'admin', 'signalement', 'Nouveau signalement ? traiter.', '2026-03-10', NULL),
(4, 'user', 'collection', 'Votre collection \"Cr?ation contenu\" a ?t? enrichie.', '2026-03-20', NULL),
(5, 'moderateur', 'soumission', 'Une nouvelle fiche outil attend validation.', '2026-05-09', NULL),
(6, 'user', 'avis', 'Merci pour votre avis, il aide la communaut?.', '2026-05-18', NULL),
(7, 'user', 'securite', 'Nouvelle connexion d?tect?e sur votre compte.', '2026-06-02', NULL),
(8, 'admin', 'systeme', 'Rapport d\'activit? mensuel disponible.', '2026-06-01', NULL),
(9, 'user', 'error', '[Outil refusé] Votre outil \"Hugging Face Spaces\" n\'a pas été retenu. Motif : Validation échouée pour les champs suivants :\n- Categorie renseignee : 0/100 (Categorie manquante.)\n\nVeuillez corriger ces points.', '2026-06-13', NULL),
(10, 'user', 'success', '[Outil approuvé] Votre outil \"Canva Magic Studio\" a été approuvé et est maintenant publié dans le catalogue.', '2026-06-13', NULL),
(11, 'all', 'info', '[exxanple] dfdfdfdfdfdfdfdfdfd', '2026-06-13', NULL),
(12, 'user', 'success', '[Outil approuvé] Votre outil \"ester 2\" a été approuvé et est maintenant publié dans le catalogue.', '2026-06-15', NULL),
(13, 'user', 'error', '[Outil refusé] Votre outil \"autre proposition\" n\'a pas été retenu. Motif : Validation échouée pour les champs suivants :\n- Plateformes renseignee : 0/100 (Plateformes manquante.)\n- URL valide et coherente : 21/100 (URL publique attendue, pas une adresse locale/IP., Le domaine ne semble pas correspondre au nom de l outil., URL locale non valide pour un outil public., Le domaine ne correspond pas au nom de l\'outil.)\n- Description detaillee valide : 32/100 (Description detaillee trop courte., Description trop courte et manque de détails sur l\'usage IA.)\n- Coherence semantique : 46/100 (La description ne precise pas clairement l usage IA de l outil., Manque de clarté sur l\'application spécifique de l\'IA., Le nom et la description ne sont pas alignés.)\n- Nom coherent : 48/100 (Nom trop générique et potentiellement non unique.)\n\nVeuillez corriger ces points.', '2026-06-15', NULL),
(14, 'user', 'success', '[Outil approuvé] Votre outil \"test\" a été approuvé et est maintenant publié dans le catalogue.', '2026-06-15', NULL),
(15, 'user', 'success', '[Outil approuvé] Votre outil \"outil admin\" a été approuvé et est maintenant publié dans le catalogue.', '2026-06-15', NULL),
(16, 'user', 'success', '[Outil approuvé] Votre outil \"ChatGPT\" a été approuvé et est maintenant publié dans le catalogue.', '2026-06-16', NULL),
(17, 'user', 'success', '[Outil approuvé] Votre outil \"ChatGPT 3\" a été approuvé et est maintenant publié dans le catalogue.', '2026-06-16', NULL),
(18, 'user', 'success', '[Outil approuvé] Votre outil \"ChatGPT\" a été approuvé et est maintenant publié dans le catalogue.', '2026-06-16', NULL),
(19, 'user', 'success', '[Outil approuvé] Votre outil \"deepseek\" a été approuvé et est maintenant publié dans le catalogue.', '2026-06-16', NULL),
(20, 'user', 'success', '[Outil approuvé] Votre outil \"final example\" a été approuvé et est maintenant publié dans le catalogue.', '2026-06-16', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `notification_utilisateur`
--

CREATE TABLE `notification_utilisateur` (
  `ID_NOTIF` int(11) NOT NULL,
  `IDU` int(11) NOT NULL,
  `DATE_LECTURE` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notification_utilisateur`
--

INSERT INTO `notification_utilisateur` (`ID_NOTIF`, `IDU`, `DATE_LECTURE`) VALUES
(1, 2, '2026-01-12'),
(2, 5, '2026-02-06'),
(3, 1, '2026-03-10'),
(4, 8, '2026-03-21'),
(5, 6, '2026-05-09'),
(6, 3, '2026-05-19'),
(7, 4, NULL),
(8, 1, '2026-06-02'),
(9, 9, '2026-06-14'),
(10, 9, '2026-06-14'),
(11, 1, NULL),
(11, 2, NULL),
(11, 3, NULL),
(11, 4, NULL),
(11, 5, NULL),
(11, 6, NULL),
(11, 7, NULL),
(11, 8, NULL),
(11, 9, '2026-06-14'),
(11, 10, NULL),
(11, 11, NULL),
(11, 12, NULL),
(11, 13, NULL),
(11, 14, NULL),
(12, 9, NULL),
(13, 9, NULL),
(14, 10, NULL),
(15, 10, NULL),
(16, 2, NULL),
(17, 2, NULL),
(18, 2, NULL),
(19, 10, NULL),
(20, 10, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `outils`
--

CREATE TABLE `outils` (
  `IDOUT` int(11) NOT NULL,
  `IDU` int(11) DEFAULT NULL,
  `ID_SOUMISSION` int(11) DEFAULT NULL,
  `ID_FOURNISSEUR` int(11) NOT NULL,
  `ID_STAT` int(11) DEFAULT NULL,
  `NOM` char(100) DEFAULT NULL,
  `SLUG` char(100) DEFAULT NULL,
  `TYPE_TARIF` char(10) DEFAULT NULL,
  `DESCRIPTION_COURTE` char(255) DEFAULT NULL,
  `DESCRIPTION_LONGUE` longtext DEFAULT NULL,
  `LOGO_URL` char(200) DEFAULT NULL,
  `SITE_URL` char(200) DEFAULT NULL,
  `STATUT` char(10) DEFAULT NULL,
  `DATE_MISE_A_JOUR` date DEFAULT NULL,
  `DATE_SORTIE` date DEFAULT NULL,
  `EST_OPEN_SOURCE` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `outils`
--

INSERT INTO `outils` (`IDOUT`, `IDU`, `ID_SOUMISSION`, `ID_FOURNISSEUR`, `ID_STAT`, `NOM`, `SLUG`, `TYPE_TARIF`, `DESCRIPTION_COURTE`, `DESCRIPTION_LONGUE`, `LOGO_URL`, `SITE_URL`, `STATUT`, `DATE_MISE_A_JOUR`, `DATE_SORTIE`, `EST_OPEN_SOURCE`) VALUES
(1, 2, 1, 1, NULL, 'ChatGPT', 'chatgpt', 'freemium', 'Assistant IA g?n?raliste pour texte, code et images.', 'ChatGPT aide ? r?diger, analyser, coder, apprendre et automatiser.', 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', 'https://chatgpt.com', 'actif', '2026-06-16', '2022-11-30', 0),
(2, 3, NULL, 2, NULL, 'Claude', 'claude', 'freemium', 'Assistant IA orient? analyse, r?daction et code.', 'Claude est utilis? pour les longs documents, la synth?se et la programmation.', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Claude_AI_logo.svg', 'https://claude.ai', 'actif', '2026-04-25', '2023-03-14', 0),
(3, 5, NULL, 3, NULL, 'Gemini', 'gemini', 'freemium', 'Assistant IA de Google pour recherche, texte et multimodal.', 'Gemini combine conversation, recherche et images.', 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Google_Gemini_logo_2025.svg', 'https://gemini.google.com', 'actif', '2026-04-20', '2023-12-06', 0),
(4, 6, NULL, 4, NULL, 'Mistral Le Chat', 'mistral-le-chat', 'freemium', 'Assistant IA europ?en pour chat et productivit?.', 'Le Chat donne acc?s aux mod?les Mistral pour r?ponses rapides.', 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Mistral_AI_logo_%282025%E2%80%93%29.svg', 'https://chat.mistral.ai', 'actif', '2026-03-20', '2024-02-26', 0),
(5, 8, NULL, 5, NULL, 'HuggingChat', 'huggingchat', 'free', 'Chat open source bas? sur des mod?les communautaires.', 'HuggingChat permet de tester plusieurs mod?les ouverts.', 'https://huggingface.co/spaces/huggingchat/chat-ui/resolve/main/static/huggingchat/logo.svg', 'https://huggingface.co/chat', 'actif', '2026-02-19', '2023-04-25', 1),
(6, 5, 2, 8, NULL, 'Perplexity', 'perplexity', 'freemium', 'Moteur de r?ponse IA avec sources cit?es.', 'Perplexity combine recherche web, citations et synth?se.', 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Perplexity_AI_logo.svg', 'https://perplexity.ai', 'actif', '2026-04-16', '2022-12-01', 0),
(7, 8, NULL, 9, NULL, 'Notion AI', 'notion-ai', 'paid', 'Assistant IA int?gr? ? Notion pour notes et documents.', 'Notion AI aide ? r?sumer, reformuler et organiser.', 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg', 'https://notion.so/product/ai', 'actif', '2026-02-11', '2023-02-22', 0),
(8, 4, NULL, 6, NULL, 'Stable Diffusion', 'stable-diffusion', 'free', 'G?n?ration d\'images open source.', 'Stable Diffusion produit des images ? partir de prompts.', 'https://cdn.aifinder.ma/tools/stable-diffusion.svg', 'https://stability.ai', 'actif', '2026-03-12', '2022-08-22', 1),
(9, 4, NULL, 7, NULL, 'Runway', 'runway', 'freemium', 'Cr?ation et ?dition vid?o assist?e par IA.', 'Runway propose g?n?ration vid?o, suppression d\'objets, sous-titrage.', 'https://cdn.aifinder.ma/tools/runway.svg', 'https://runwayml.com', 'actif', '2026-03-22', '2018-01-01', 0),
(10, 2, NULL, 10, NULL, 'ElevenLabs', 'elevenlabs', 'freemium', 'Voix IA r?alistes et clonage vocal.', 'ElevenLabs g?n?re une synth?se vocale naturelle et multilingue.', 'https://cdn.aifinder.ma/tools/elevenlabs.svg', 'https://elevenlabs.io', 'actif', '2026-04-05', '2022-01-01', 0),
(11, 3, NULL, 1, NULL, 'Whisper API', 'whisper-api', 'paid', 'Transcription audio via API.', 'Whisper API transforme audio en texte exploitable.', 'https://cdn.aifinder.ma/tools/whisper.svg', 'https://platform.openai.com/docs/guides/audio', 'actif', '2026-01-10', '2023-03-01', 1),
(12, 9, 4, 4, NULL, 'Mistral API', 'mistral-api', 'paid', 'API pour mod?les Mistral.', 'Mistral API permet d\'int?grer les mod?les Mistral.', 'https://cdn.aifinder.ma/tools/mistral-api.svg', 'https://console.mistral.ai', 'refusé', '2026-03-20', '2023-09-27', 0),
(13, 9, 6, 5, NULL, 'Hugging Face Spaces', 'hugging-face-spaces', 'freemium', 'H?bergement de d?mos IA et applications ML.', 'Spaces permet de publier des d?mos IA en Gradio, Streamlit.', 'https://cdn.aifinder.ma/tools/hf-spaces.svg', 'https://huggingface.co/spaces', 'refusé', '2026-02-20', '2021-01-01', 1),
(14, 6, 5, 1, NULL, 'OpenAI API', 'openai-api', 'paid', 'API pour int?grer les mod?les OpenAI.', 'OpenAI API donne acc?s ? des mod?les texte, audio, image.', 'https://cdn.aifinder.ma/tools/openai-api.svg', 'https://platform.openai.com', 'actif', '2026-05-01', '2020-06-11', 0),
(15, 9, 3, 0, NULL, 'Canva Magic Studio', 'canva-magic-studio', 'freemium', 'Suite cr?ative IA pour design et marketing.', 'Magic Studio aide ? cr?er visuels, pr?sentations, posts.', 'https://cdn.aifinder.ma/tools/canva-magic.svg', 'https://www.canva.com/magic', 'actif', '2026-01-15', '2023-10-04', 0),
(16, NULL, 7, 11, NULL, 'mon objet', 'mon-objet', 'paid', 'kkkkkkk', 'azeyyttytytyty', 'http://localhost:5173/propose-tool', 'http://localhost:5173/propose-tool', 'en_attente', NULL, '2026-06-09', 1),
(17, NULL, 8, 2, NULL, 'ester 2', 'ester-2', 'paid', 'azerty', 'qsdfg', 'http://localhost:5173/propose-tool', 'http://localhost:5173/propose-tool', 'actif', NULL, '2026-06-10', 1),
(18, 9, 9, 11, NULL, 'autre proposition 3', 'autre-proposition', 'freemium', 'c est un courte description', 'c\'est une longue description', 'http://localhost:5173/propose-tool', 'http://localhost:5173/propose-tool', 'en_attente', '2026-06-16', '2026-06-08', 0),
(19, 9, 10, 11, NULL, 'nouveau', 'nouveau', 'freemium', 'description courte', 'description longue', 'http://localhost:5173/propose-tool', 'http://localhost:5173/propose-tool', 'en_attente', NULL, '2026-06-01', 0),
(20, 9, 11, 11, NULL, 'exemple', 'exemple', 'freemium', 'querty', 'longue', '', 'http://localhost:5173/propose-tool', 'en_attente', '2026-06-16', NULL, 0),
(21, 9, 12, 11, NULL, 'exemple 2', 'exemple-2', 'freemium', 'aazzaaaaaa', 'ssssssssssssss', '', 'http://localhost:5173/propose-tool', 'en_attente', NULL, NULL, 0),
(22, 9, 13, 11, NULL, 'exemple 3', 'exemple-3', 'freemium', 'hjsdfd', 'sdsfsdgsggsd', '', 'http://localhost:5173/propose-tool', 'en_attente', NULL, NULL, 0),
(23, 9, 14, 11, NULL, 'exemple4', 'exemple4', 'freemium', 'sqsddfdgsdgd', 'qsdshhdqssdfg', '', 'http://localhost:5173/propose-tool', 'en_attente', NULL, NULL, 0),
(24, 9, 15, 11, NULL, '123', '123', 'freemium', 'erzeererge', 'sdsdfgsdsg\"rzertze', '', 'http://localhost:5173/propose-tool', 'en_attente', NULL, NULL, 0),
(25, 9, 16, 11, NULL, 'nv', 'nv', 'freemium', 'sqddfsfsds', 'qsddsgsdsf', '', 'http://localhost:5173/propose-tool', 'en_attente', NULL, NULL, 0),
(26, 10, 17, 11, NULL, 'outil admin', 'outil-admin', 'freemium', 'admin ujqgfgqs', 'admin fzehfbkfqdfjksdfbfd', '', 'http://localhost:5173/propose-tool', 'actif', NULL, NULL, 0),
(27, 10, 18, 11, NULL, 'test', 'test', 'freemium', 'dsfgsqfgsfg', 'sdfgsfgsgf', 'http://image.svg', 'http://localhost:5173/propose-tool', 'actif', NULL, NULL, 0),
(28, 10, 19, 3, NULL, 'deepseek', 'deepseek', 'freemium', 'qdqsdfdf', 'qsdfqsdfsdf', '', 'http://localhost:5173/propose-tool', 'actif', NULL, NULL, 0),
(29, 10, 20, 11, NULL, 'khalil', 'khalil', 'freemium', 'qfdqsdfqs', 'qsfdqsdfsdf', '', 'http://localhost:5173/propose-tool', 'en_attente', NULL, NULL, 0),
(33, 10, 21, 11, NULL, 'example  2', 'example-2', 'freemium', 'gsdgsg', 'qgsfgqg', '', 'http://localhost:5173/propose-tool', 'en_attente', NULL, NULL, 0),
(34, 10, 22, 11, NULL, 'final example', 'final-example', 'freemium', 'admin ujqgfgqs', 'qgsdqgg', '', 'http://localhost:5173/propose-tool', 'actif', NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Structure de la table `outil_caracteristique`
--

CREATE TABLE `outil_caracteristique` (
  `IDOUT` int(11) NOT NULL,
  `ID_CARACT` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `outil_caracteristique`
--

INSERT INTO `outil_caracteristique` (`IDOUT`, `ID_CARACT`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 11),
(2, 1),
(2, 2),
(2, 6),
(3, 2),
(3, 3),
(4, 2),
(4, 5),
(5, 4),
(5, 15),
(6, 11),
(6, 12),
(7, 13),
(7, 18),
(8, 4),
(8, 8),
(8, 17),
(9, 9),
(9, 16),
(10, 10),
(10, 16),
(11, 10),
(11, 11),
(12, 5),
(12, 11),
(13, 4),
(13, 13),
(14, 11),
(14, 14),
(15, 8),
(15, 13),
(15, 18);

-- --------------------------------------------------------

--
-- Structure de la table `outil_categorie`
--

CREATE TABLE `outil_categorie` (
  `IDOUT` int(11) NOT NULL,
  `ID_CATEGORIE` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `outil_categorie`
--

INSERT INTO `outil_categorie` (`IDOUT`, `ID_CATEGORIE`) VALUES
(1, 1),
(1, 4),
(1, 5),
(1, 6),
(2, 1),
(2, 5),
(3, 1),
(3, 6),
(4, 1),
(4, 6),
(5, 1),
(5, 5),
(6, 6),
(6, 7),
(7, 1),
(7, 6),
(8, 2),
(9, 3),
(10, 4),
(11, 4),
(12, 5),
(14, 1),
(14, 5),
(15, 2),
(15, 8),
(18, 9),
(19, 9),
(19, 13),
(20, 13),
(21, 9),
(22, 9),
(23, 13),
(24, 9),
(25, 9),
(26, 9),
(27, 4),
(28, 4),
(28, 9),
(29, 4),
(33, 9),
(34, 9);

-- --------------------------------------------------------

--
-- Structure de la table `outil_feature`
--

CREATE TABLE `outil_feature` (
  `ID_FEATURE` int(11) NOT NULL,
  `IDOUT` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `outil_feature`
--

INSERT INTO `outil_feature` (`ID_FEATURE`, `IDOUT`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(2, 1),
(2, 2),
(2, 4),
(2, 7),
(3, 1),
(3, 2),
(3, 6),
(3, 7),
(4, 1),
(4, 3),
(5, 1),
(5, 5),
(6, 3),
(6, 6),
(7, 8),
(8, 8),
(9, 9),
(10, 11),
(11, 10),
(12, 1),
(12, 12),
(12, 14),
(13, 7),
(13, 13),
(14, 15),
(15, 15),
(16, 16),
(17, 16),
(18, 16),
(19, 18),
(21, 19),
(22, 19),
(23, 19);

-- --------------------------------------------------------

--
-- Structure de la table `outil_modele`
--

CREATE TABLE `outil_modele` (
  `IDOUT` int(11) NOT NULL,
  `IDMOD` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `outil_modele`
--

INSERT INTO `outil_modele` (`IDOUT`, `IDMOD`) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 4),
(4, 5),
(4, 6),
(5, 9),
(6, 3),
(6, 4),
(8, 7),
(9, 7),
(10, 10),
(11, 8),
(12, 5),
(12, 6),
(13, 9),
(14, 1),
(14, 2),
(15, 7),
(16, 1),
(16, 2),
(16, 3),
(17, 1),
(18, 1),
(19, 11),
(20, 11),
(21, 11),
(22, 11),
(23, 11),
(24, 12),
(25, 12),
(26, 11),
(27, 11),
(28, 11),
(29, 11),
(33, 11),
(34, 11);

-- --------------------------------------------------------

--
-- Structure de la table `outil_performance`
--

CREATE TABLE `outil_performance` (
  `IDOUT` int(11) NOT NULL,
  `ID_PERFORMANCE` int(11) NOT NULL,
  `SCORE` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `outil_performance`
--

INSERT INTO `outil_performance` (`IDOUT`, `ID_PERFORMANCE`, `SCORE`) VALUES
(1, 1, 94),
(1, 2, 91),
(1, 3, 92),
(1, 9, 90),
(2, 1, 95),
(2, 2, 92),
(2, 3, 91),
(3, 4, 89),
(3, 9, 88),
(4, 1, 85),
(4, 2, 84),
(5, 3, 80),
(6, 4, 89),
(6, 7, 92),
(7, 9, 87),
(8, 5, 88),
(9, 6, 84),
(10, 8, 93),
(11, 7, 95),
(12, 3, 85),
(13, 3, 82),
(14, 3, 92),
(14, 10, 86),
(15, 12, 87),
(16, 13, 87),
(18, 14, 12),
(19, 16, 10),
(19, 17, 30),
(19, 18, 50),
(19, 19, 70),
(19, 20, 85),
(19, 21, 95);

-- --------------------------------------------------------

--
-- Structure de la table `outil_plateforme`
--

CREATE TABLE `outil_plateforme` (
  `IDOUT` int(11) NOT NULL,
  `ID_PLATEFORME` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `outil_plateforme`
--

INSERT INTO `outil_plateforme` (`IDOUT`, `ID_PLATEFORME`) VALUES
(1, 1),
(1, 2),
(1, 6),
(1, 7),
(2, 1),
(2, 2),
(2, 6),
(2, 7),
(3, 1),
(3, 6),
(3, 7),
(4, 1),
(4, 2),
(5, 1),
(6, 1),
(6, 2),
(6, 8),
(7, 1),
(7, 6),
(7, 7),
(8, 1),
(8, 3),
(8, 4),
(8, 5),
(9, 1),
(10, 1),
(10, 2),
(11, 2),
(12, 2),
(13, 1),
(14, 2),
(15, 1),
(15, 6),
(15, 7),
(17, 12),
(23, 1),
(23, 3),
(23, 7),
(23, 12);

-- --------------------------------------------------------

--
-- Structure de la table `performance`
--

CREATE TABLE `performance` (
  `ID_PERFORMANCE` int(11) NOT NULL,
  `DOMAINE` char(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `performance`
--

INSERT INTO `performance` (`ID_PERFORMANCE`, `DOMAINE`) VALUES
(1, 'R?daction g?n?rale'),
(2, 'Raisonnement'),
(3, 'Code'),
(4, 'Recherche avec sources'),
(5, 'G?n?ration image'),
(6, '?dition vid?o'),
(7, 'Transcription audio'),
(8, 'Synth?se vocale'),
(9, 'Productivit?'),
(10, 'Analyse de donn?es'),
(11, '?ducation'),
(12, 'Marketing'),
(13, 'mlskdsdsds'),
(14, 'Maison'),
(15, 'domaine'),
(16, 'jouer'),
(17, 'voir'),
(18, 'entendre'),
(19, 'ecouter'),
(20, 'sentir'),
(21, 'parler'),
(22, 'gggg');

-- --------------------------------------------------------

--
-- Structure de la table `performance_modele`
--

CREATE TABLE `performance_modele` (
  `ID_PERFORMANCE` int(11) NOT NULL,
  `IDMOD` int(11) NOT NULL,
  `SCORE` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `performance_modele`
--

INSERT INTO `performance_modele` (`ID_PERFORMANCE`, `IDMOD`, `SCORE`) VALUES
(1, 1, 94),
(1, 2, 90),
(1, 3, 95),
(1, 5, 87),
(2, 1, 91),
(2, 3, 92),
(2, 4, 88),
(2, 5, 85),
(3, 1, 92),
(3, 2, 88),
(3, 3, 93),
(3, 5, 86),
(3, 6, 82),
(3, 9, 84),
(4, 4, 89),
(5, 7, 88),
(7, 8, 95),
(8, 10, 93),
(9, 1, 90),
(10, 6, 85),
(10, 9, 82),
(15, 11, 60),
(22, 13, 444);

-- --------------------------------------------------------

--
-- Structure de la table `plateforme`
--

CREATE TABLE `plateforme` (
  `ID_PLATEFORME` int(11) NOT NULL,
  `NOM` char(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `plateforme`
--

INSERT INTO `plateforme` (`ID_PLATEFORME`, `NOM`) VALUES
(1, 'Web'),
(2, 'API'),
(3, 'Windows'),
(4, 'macOS'),
(5, 'Linux'),
(6, 'iOS'),
(7, 'Android'),
(8, 'Extension Chrome'),
(9, 'Slack'),
(10, 'Discord'),
(12, 'Desktop');

-- --------------------------------------------------------

--
-- Structure de la table `pricing_modele`
--

CREATE TABLE `pricing_modele` (
  `ID_PRICING_MODELE` int(11) NOT NULL,
  `ID_PRICING_PLAN` int(11) NOT NULL,
  `IDMOD` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `pricing_modele`
--

INSERT INTO `pricing_modele` (`ID_PRICING_MODELE`, `ID_PRICING_PLAN`, `IDMOD`) VALUES
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
(19, 15, 7),
(30, 27, 2),
(31, 28, 1),
(32, 28, 2);

-- --------------------------------------------------------

--
-- Structure de la table `pricing_modele_limite`
--

CREATE TABLE `pricing_modele_limite` (
  `ID_PRICING_MODELE_LIMITE` int(11) NOT NULL,
  `ID_PRICING_MODELE` int(11) NOT NULL,
  `TYPE_LIMITE` char(30) DEFAULT NULL,
  `VALEUR` int(11) DEFAULT NULL,
  `PERIODE` char(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `pricing_modele_limite`
--

INSERT INTO `pricing_modele_limite` (`ID_PRICING_MODELE_LIMITE`, `ID_PRICING_MODELE`, `TYPE_LIMITE`, `VALEUR`, `PERIODE`) VALUES
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

-- --------------------------------------------------------

--
-- Structure de la table `pricing_plans`
--

CREATE TABLE `pricing_plans` (
  `ID_PRICING_PLAN` int(11) NOT NULL,
  `IDOUT` int(11) NOT NULL,
  `NOM` char(200) DEFAULT NULL,
  `PRIX` decimal(10,2) DEFAULT NULL,
  `DEVISE` varchar(3) DEFAULT NULL,
  `PERIODE` char(20) DEFAULT NULL,
  `DESCRIPTION` longtext DEFAULT NULL,
  `TYPE` char(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `pricing_plans`
--

INSERT INTO `pricing_plans` (`ID_PRICING_PLAN`, `IDOUT`, `NOM`, `PRIX`, `DEVISE`, `PERIODE`, `DESCRIPTION`, `TYPE`) VALUES
(3, 2, 'Claude Pro', 20.00, 'USD', 'mois', 'Utilisation avanc?e de Claude.', 'premium'),
(4, 3, 'Gemini Advanced', 19.99, 'USD', 'mois', 'Fonctions avanc?es et int?gration Google.', 'premium'),
(5, 4, 'Le Chat Free', 0.00, 'EUR', 'mois', 'Acc?s gratuit aux mod?les Mistral.', 'free'),
(6, 5, 'HuggingChat Free', 0.00, 'USD', 'mois', 'Chat communautaire gratuit.', 'free'),
(7, 6, 'Perplexity Pro', 20.00, 'USD', 'mois', 'Recherche IA avec usage pro.', 'premium'),
(8, 7, 'Notion AI Add-on', 10.00, 'USD', 'mois', 'Assistant IA par membre.', 'premium'),
(9, 8, 'Stable Diffusion Local', 0.00, 'USD', 'mois', 'Ex?cution locale open source.', 'free'),
(10, 9, 'Runway Standard', 15.00, 'USD', 'mois', 'Cr?dits vid?o pour cr?ateurs.', 'premium'),
(11, 10, 'ElevenLabs Starter', 5.00, 'USD', 'mois', 'Voix IA pour petits projets.', 'premium'),
(12, 11, 'Whisper Pay as you go', 0.01, 'USD', 'minute', 'Facturation ? la minute transcrite.', 'usage'),
(13, 12, 'Mistral API Build', 0.00, 'EUR', 'usage', 'Facturation selon les tokens consomm?s.', 'usage'),
(14, 14, 'OpenAI API Usage', 0.00, 'USD', 'usage', 'Paiement selon consommation API.', 'usage'),
(15, 15, 'Canva Pro', 15.00, 'USD', 'mois', 'Suite cr?ative avec Magic Studio.', 'premium'),
(17, 19, 'Gratuit', 88.00, '€', 'month', 'oooooo', 'paid'),
(18, 25, 'Pro', 54.00, '€', 'month', 'nbvcxdfw', 'paid'),
(20, 18, 'Plus', 60.00, '€', 'month', 'c est la description du plan', 'paid'),
(27, 1, 'Free', 0.00, 'USD', 'mois', 'Acc?s limit? pour tester ChatGPT.', 'free'),
(28, 1, 'Plus', 20.00, 'USD', 'mois', 'Acc?s ?tendu aux mod?les avanc?s.', 'premium');

-- --------------------------------------------------------

--
-- Structure de la table `signalements`
--

CREATE TABLE `signalements` (
  `ID_SIGNALEMENT` int(11) NOT NULL,
  `IDOUT` int(11) DEFAULT NULL,
  `IDU` int(11) NOT NULL,
  `ID_COMMENTAIRE` int(11) DEFAULT NULL,
  `MOTIF` varchar(70) DEFAULT NULL,
  `STATUT` char(10) DEFAULT NULL,
  `DESCRIPTION` longtext DEFAULT NULL,
  `DATE_MISE_A_JOUR` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `signalements`
--

INSERT INTO `signalements` (`ID_SIGNALEMENT`, `IDOUT`, `IDU`, `ID_COMMENTAIRE`, `MOTIF`, `STATUT`, `DESCRIPTION`, `DATE_MISE_A_JOUR`) VALUES
(1, 9, 3, NULL, 'Information obsol?te', 'trait?', 'Ancien tarif signal? puis corrig?.', '2026-02-20'),
(2, 10, 5, 7, 'Commentaire incomplet', 'resolu', 'Demande de pr?cision sur un avis.', '2026-03-10'),
(3, 12, 2, NULL, 'Lien ? v?rifier', 'en_attente', 'Le lien de documentation semble changer.', '2026-04-03'),
(4, 1, 8, 1, 'Contenu dupliqu?', 'rejet?', 'Signalement non confirm? apr?s v?rification.', '2026-04-19'),
(5, 1, 9, 1, 'hateful', 'rejete', 'dghghghjghgj', '2026-06-14'),
(6, 1, 9, 1, 'inappropriate', 'resolu', 'eerererghghghghgh', '2026-06-14');

-- --------------------------------------------------------

--
-- Structure de la table `soumission_outil`
--

CREATE TABLE `soumission_outil` (
  `ID_SOUMISSION` int(11) NOT NULL,
  `IDOUT` int(11) NOT NULL,
  `IDU` int(11) NOT NULL,
  `STATUT` char(10) DEFAULT NULL,
  `NOTE_ADMIN` longtext DEFAULT NULL,
  `TENTATIVES_EFFECTUEES` int(11) DEFAULT NULL,
  `TENTATIVES_MAX` int(11) DEFAULT 3,
  `DATE_MISE_A_JOUR` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `soumission_outil`
--

INSERT INTO `soumission_outil` (`ID_SOUMISSION`, `IDOUT`, `IDU`, `STATUT`, `NOTE_ADMIN`, `TENTATIVES_EFFECTUEES`, `TENTATIVES_MAX`, `DATE_MISE_A_JOUR`) VALUES
(1, 1, 2, 'approuve', NULL, 3, 3, '2026-06-16'),
(2, 6, 5, 'validé', 'Ajout? dans la cat?gorie recherche.', 1, 3, '2026-02-03'),
(3, 15, 9, 'approuve', NULL, 1, 3, NULL),
(4, 12, 9, 'refusé', 'Description trop courte et lien non officiel.', 3, 3, '2026-03-20'),
(5, 14, 6, 'validé', 'API utile pour les d?veloppeurs.', 1, 3, '2026-04-07'),
(6, 13, 9, 'rejete', 'Validation échouée pour les champs suivants :\n- Categorie renseignee : 0/100 (Categorie manquante.)\n\nVeuillez corriger ces points.', 1, 3, NULL),
(7, 16, 9, 'en_attente', NULL, 1, 3, '2026-06-14'),
(8, 17, 9, 'approuve', NULL, 1, 3, '2026-06-14'),
(9, 18, 9, 'en_attente', 'Validation échouée pour les champs suivants :\n- Plateformes renseignee : 0/100 (Plateformes manquante.)\n- URL valide et coherente : 21/100 (URL publique attendue, pas une adresse locale/IP., Le domaine ne semble pas correspondre au nom de l outil., URL locale non valide pour un outil public., Le domaine ne correspond pas au nom de l\'outil.)\n- Description detaillee valide : 32/100 (Description detaillee trop courte., Description trop courte et manque de détails sur l\'usage IA.)\n- Coherence semantique : 46/100 (La description ne precise pas clairement l usage IA de l outil., Manque de clarté sur l\'application spécifique de l\'IA., Le nom et la description ne sont pas alignés.)\n- Nom coherent : 48/100 (Nom trop générique et potentiellement non unique.)\n\nVeuillez corriger ces points.', 2, 3, '2026-06-16'),
(10, 19, 9, 'en_attente', NULL, 1, 3, '2026-06-14'),
(11, 20, 9, 'en_attente', NULL, 1, 3, '2026-06-14'),
(12, 21, 9, 'en_attente', NULL, 1, 3, '2026-06-14'),
(13, 22, 9, 'en_attente', NULL, 1, 3, '2026-06-14'),
(14, 23, 9, 'en_attente', NULL, 1, 3, '2026-06-14'),
(15, 24, 9, 'en_attente', NULL, 1, 3, '2026-06-14'),
(16, 25, 9, 'en_attente', NULL, 1, 3, '2026-06-14'),
(17, 26, 10, 'approuve', NULL, 1, 3, '2026-06-15'),
(18, 27, 10, 'approuve', NULL, 1, 3, '2026-06-15'),
(19, 28, 10, 'approuve', NULL, 1, 3, '2026-06-16'),
(20, 29, 10, 'en_attente', NULL, 1, 3, '2026-06-16'),
(21, 33, 10, 'en_attente', NULL, 1, 3, '2026-06-16'),
(22, 34, 10, 'approuve', NULL, 0, 3, '2026-06-16');

-- --------------------------------------------------------

--
-- Structure de la table `statistiques_externes`
--

CREATE TABLE `statistiques_externes` (
  `ID_STAT` int(11) NOT NULL,
  `IDOUT` int(11) NOT NULL,
  `NOTE_MOYENNE` decimal(3,2) DEFAULT NULL,
  `NB_NOTATIONS` int(11) DEFAULT NULL,
  `NB_UTILISATEURS` int(11) DEFAULT NULL,
  `CONTENU` longtext DEFAULT NULL,
  `DATE_MISE_A_JOUR` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `statistiques_externes`
--

INSERT INTO `statistiques_externes` (`ID_STAT`, `IDOUT`, `NOTE_MOYENNE`, `NB_NOTATIONS`, `NB_UTILISATEURS`, `CONTENU`, `DATE_MISE_A_JOUR`) VALUES
(1, 1, 4.80, 20, 1200, 'Statistiques r?cup?r?es de source externe', '2026-06-16'),
(2, 2, 4.70, 890, 750, NULL, '2026-06-01'),
(3, 6, 4.50, 672, 500, NULL, '2026-06-01'),
(4, 10, 4.90, 432, 350, NULL, '2026-06-01');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `IDU` int(11) NOT NULL,
  `NOM` char(100) DEFAULT NULL,
  `PRENOM` char(30) DEFAULT NULL,
  `EMAIL` char(100) DEFAULT NULL,
  `MOT_DE_PASSE` char(255) DEFAULT NULL,
  `ROLE` varchar(20) DEFAULT NULL,
  `STATUT` char(10) DEFAULT NULL,
  `AVATAR_URL` longtext DEFAULT NULL,
  `DATE_INSCRIPTION` datetime DEFAULT NULL,
  `DERNIERE_CONNEXION` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`IDU`, `NOM`, `PRENOM`, `EMAIL`, `MOT_DE_PASSE`, `ROLE`, `STATUT`, `AVATAR_URL`, `DATE_INSCRIPTION`, `DERNIERE_CONNEXION`) VALUES
(1, 'Admin', 'Anass', 'admin@aifinder.ma', '$2y$10$demoAdminHash', 'admin', 'actif', 'https://cdn.aifinder.ma/avatars/admin.png', '2025-01-05 09:15:00', '2026-06-03 18:30:00'),
(2, 'Oukhmou', 'Youssef', 'youssef@aifinder.ma', '$2y$10$demoUserHash02', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/youssef.png', '2025-02-11 12:40:00', '2026-06-01 10:05:00'),
(3, 'El Amrani', 'Sara', 'sara@aifinder.ma', '$2y$10$demoUserHash03', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/sara.png', '2025-03-09 16:20:00', '2026-05-29 21:11:00'),
(4, 'Bennani', 'Hamza', 'hamza@aifinder.ma', '$2y$10$demoUserHash04', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/hamza.png', '2025-04-18 08:10:00', '2026-05-30 14:45:00'),
(5, 'Mansouri', 'Nadia', 'nadia@aifinder.ma', '$2y$10$demoUserHash05', 'user', 'actif', NULL, '2025-05-02 19:05:00', '2026-05-25 09:00:00'),
(6, 'Khalil', 'Maad', 'kmaad@aifinder.ma', '$2y$10$demoUserHash06', 'moderateur', 'actif', NULL, '2025-06-14 11:35:00', '2026-06-02 17:20:00'),
(7, 'Lahcen', 'Omar', 'omar@aifinder.ma', '$2y$10$demoUserHash07', 'user', 'suspendu', NULL, '2025-07-01 13:00:00', '2026-04-14 12:00:00'),
(8, 'Raji', 'Imane', 'imane@aifinder.ma', '$2y$10$demoUserHash08', 'user', 'actif', 'https://cdn.aifinder.ma/avatars/imane.png', '2025-08-22 20:10:00', '2026-06-04 08:55:00'),
(9, 'Mohamed', 'Khalil', 'khalil4567620@gmail.com', '$2y$10$pjAzlrpwCKfy9qDRScpVkOIFVzcWRQ5D/ytZ5BVpIUzLtpdIgkL0e', 'user', 'actif', 'data:image/jpeg;base64,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', '2026-06-12 15:53:34', '2026-06-16 04:55:11'),
(10, 'mister', 'Sam', 'samedi10032000@gmail.com', '$2y$10$lvLlVnww/zyBLReiN0tM6exjPvG3UrohSZnKzoBk1bpL92mfBkXLW', 'admin', 'actif', 'https://api.dicebear.com/7.x/avataaars/svg?seed=male_1&backgroundColor=b6e3f4', '2026-06-12 15:53:45', '2026-06-16 06:11:01'),
(11, 'khalil', 'khalil', 'khalilmohamed@gmail.com', '$2y$10$A3l0cvAAn6/6T8G1tM2GtuLV9xV9e9Ew2suNo6PTJ4GDCcp/JCTPW', 'user', 'actif', NULL, '2026-06-12 16:11:04', NULL),
(12, 'khalil', 'khalil', 'khalilmohamed4567620@gmail.com', '$2y$10$Hz5TAE/dyagtXD4ZWDQlVeuhzz8nXVHbCuz50KGIUJNvM.Ipx3zAu', 'user', 'actif', NULL, '2026-06-12 16:18:54', '2026-06-16 04:30:30'),
(13, 'azere', 'khalil', 'khalil@gmail.com', '$2y$10$Ry1hMn9ndDcjWoxioUcHduCzqK4MLe9/JRwQ5rdPHt/2nZjrYG6TG', 'user', 'actif', NULL, '2026-06-13 04:44:57', '2026-06-13 04:45:19'),
(14, 'anass', 'ahmed', 'ahmed@gmail.com', '$2y$10$KMexdmMWvty0IWHXmx.GZucpoxOpixBUMVUAHU8VIb8aneBpUhaf.', 'admin', 'actif', NULL, '2026-06-13 17:18:58', '2026-06-15 02:43:58');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `caracteristique`
--
ALTER TABLE `caracteristique`
  ADD PRIMARY KEY (`ID_CARACT`);

--
-- Index pour la table `caracteristique_modele`
--
ALTER TABLE `caracteristique_modele`
  ADD PRIMARY KEY (`ID_CARACT`,`IDMOD`),
  ADD KEY `FK_CARACT_MODELE_MODELE` (`IDMOD`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`ID_CATEGORIE`);

--
-- Index pour la table `collection`
--
ALTER TABLE `collection`
  ADD PRIMARY KEY (`ID_COLLECTION`),
  ADD KEY `FK_COLLECTION_UTILISATEUR` (`IDU`);

--
-- Index pour la table `collection_outil`
--
ALTER TABLE `collection_outil`
  ADD PRIMARY KEY (`ID_COLLECTION`,`IDOUT`),
  ADD KEY `FK_COLLECTION_OUTIL_OUTIL` (`IDOUT`);

--
-- Index pour la table `commentaires`
--
ALTER TABLE `commentaires`
  ADD PRIMARY KEY (`ID_COMMENTAIRE`),
  ADD KEY `FK_COMMENTAIRE_UTILISATEUR` (`IDU`),
  ADD KEY `FK_COMMENTAIRE_REPONSE` (`COMMENTAIRE_PARENT_ID`),
  ADD KEY `FK_COMMENTAIRE_OUTIL` (`IDOUT`);

--
-- Index pour la table `favori`
--
ALTER TABLE `favori`
  ADD PRIMARY KEY (`ID_FAVORI`),
  ADD KEY `FK_FAVORI_UTILISATEUR` (`IDU`),
  ADD KEY `FK_FAVORI_OUTIL` (`IDOUT`);

--
-- Index pour la table `features`
--
ALTER TABLE `features`
  ADD PRIMARY KEY (`ID_FEATURE`);

--
-- Index pour la table `feature_modele`
--
ALTER TABLE `feature_modele`
  ADD PRIMARY KEY (`ID_FEATURE`,`IDMOD`),
  ADD KEY `FK_FEATURE_MODELE_MODELE` (`IDMOD`);

--
-- Index pour la table `feature_pricing`
--
ALTER TABLE `feature_pricing`
  ADD PRIMARY KEY (`ID_FEATURE`,`ID_PRICING_PLAN`),
  ADD KEY `FK_FEATURE_PRICING_PRICING` (`ID_PRICING_PLAN`);

--
-- Index pour la table `fournisseur`
--
ALTER TABLE `fournisseur`
  ADD PRIMARY KEY (`ID_FOURNISSEUR`);

--
-- Index pour la table `historique_recherches`
--
ALTER TABLE `historique_recherches`
  ADD PRIMARY KEY (`ID_RECHERCHE`),
  ADD KEY `FK_HISTORIQUE_UTILISATEUR` (`IDU`);

--
-- Index pour la table `models`
--
ALTER TABLE `models`
  ADD PRIMARY KEY (`IDMOD`),
  ADD KEY `FK_MODELE_FOURNISSEUR` (`ID_FOURNISSEUR`);

--
-- Index pour la table `model_pricing`
--
ALTER TABLE `model_pricing`
  ADD PRIMARY KEY (`ID_MODEL_PRICING`),
  ADD KEY `FK_MODEL_PRICING_MODELE` (`IDMOD`);

--
-- Index pour la table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`ID_NOTIF`);

--
-- Index pour la table `notification_utilisateur`
--
ALTER TABLE `notification_utilisateur`
  ADD PRIMARY KEY (`ID_NOTIF`,`IDU`),
  ADD KEY `FK_NOTIF_USER_USER` (`IDU`);

--
-- Index pour la table `outils`
--
ALTER TABLE `outils`
  ADD PRIMARY KEY (`IDOUT`),
  ADD KEY `FK_OUTILS_FOURNISSEUR` (`ID_FOURNISSEUR`),
  ADD KEY `FK_OUTILS_SOUMISSION` (`ID_SOUMISSION`),
  ADD KEY `FK_OUTILS_VALIDATEUR` (`IDU`),
  ADD KEY `FK_OUTILS_STATS` (`ID_STAT`);

--
-- Index pour la table `outil_caracteristique`
--
ALTER TABLE `outil_caracteristique`
  ADD PRIMARY KEY (`IDOUT`,`ID_CARACT`),
  ADD KEY `FK_OUTIL_CARACT_CARACT` (`ID_CARACT`);

--
-- Index pour la table `outil_categorie`
--
ALTER TABLE `outil_categorie`
  ADD PRIMARY KEY (`IDOUT`,`ID_CATEGORIE`),
  ADD KEY `FK_OUTIL_CATEGORIE_CATEGORIE` (`ID_CATEGORIE`);

--
-- Index pour la table `outil_feature`
--
ALTER TABLE `outil_feature`
  ADD PRIMARY KEY (`ID_FEATURE`,`IDOUT`),
  ADD KEY `FK_OUTIL_FEATURE_OUTIL` (`IDOUT`);

--
-- Index pour la table `outil_modele`
--
ALTER TABLE `outil_modele`
  ADD PRIMARY KEY (`IDOUT`,`IDMOD`),
  ADD KEY `FK_OUTIL_MODELE_MODELE` (`IDMOD`);

--
-- Index pour la table `outil_performance`
--
ALTER TABLE `outil_performance`
  ADD PRIMARY KEY (`IDOUT`,`ID_PERFORMANCE`),
  ADD KEY `FK_OUTIL_PERF_PERFORMANCE` (`ID_PERFORMANCE`);

--
-- Index pour la table `outil_plateforme`
--
ALTER TABLE `outil_plateforme`
  ADD PRIMARY KEY (`IDOUT`,`ID_PLATEFORME`),
  ADD KEY `FK_OUTIL_PLATEFORME_PLATEFORME` (`ID_PLATEFORME`);

--
-- Index pour la table `performance`
--
ALTER TABLE `performance`
  ADD PRIMARY KEY (`ID_PERFORMANCE`);

--
-- Index pour la table `performance_modele`
--
ALTER TABLE `performance_modele`
  ADD PRIMARY KEY (`ID_PERFORMANCE`,`IDMOD`),
  ADD KEY `FK_PERF_MODELE_MODELE` (`IDMOD`);

--
-- Index pour la table `plateforme`
--
ALTER TABLE `plateforme`
  ADD PRIMARY KEY (`ID_PLATEFORME`);

--
-- Index pour la table `pricing_modele`
--
ALTER TABLE `pricing_modele`
  ADD PRIMARY KEY (`ID_PRICING_MODELE`),
  ADD KEY `FK_PRICING_MODELE_PRICING` (`ID_PRICING_PLAN`),
  ADD KEY `FK_PRICING_MODELE_MODELE` (`IDMOD`);

--
-- Index pour la table `pricing_modele_limite`
--
ALTER TABLE `pricing_modele_limite`
  ADD PRIMARY KEY (`ID_PRICING_MODELE_LIMITE`),
  ADD KEY `FK_LIMITE_PRICING_MODELE` (`ID_PRICING_MODELE`);

--
-- Index pour la table `pricing_plans`
--
ALTER TABLE `pricing_plans`
  ADD PRIMARY KEY (`ID_PRICING_PLAN`),
  ADD KEY `FK_PRICING_OUTIL` (`IDOUT`);

--
-- Index pour la table `signalements`
--
ALTER TABLE `signalements`
  ADD PRIMARY KEY (`ID_SIGNALEMENT`),
  ADD KEY `FK_SIGNALEMENT_UTILISATEUR` (`IDU`),
  ADD KEY `FK_SIGNALEMENT_COMMENTAIRE` (`ID_COMMENTAIRE`),
  ADD KEY `FK_SIGNALEMENT_OUTIL` (`IDOUT`);

--
-- Index pour la table `soumission_outil`
--
ALTER TABLE `soumission_outil`
  ADD PRIMARY KEY (`ID_SOUMISSION`),
  ADD KEY `FK_SOUMISSION_UTILISATEUR` (`IDU`),
  ADD KEY `FK_SOUMISSION_OUTIL` (`IDOUT`);

--
-- Index pour la table `statistiques_externes`
--
ALTER TABLE `statistiques_externes`
  ADD PRIMARY KEY (`ID_STAT`),
  ADD KEY `FK_STATS_OUTIL` (`IDOUT`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`IDU`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `caracteristique`
--
ALTER TABLE `caracteristique`
  MODIFY `ID_CARACT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `ID_CATEGORIE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `collection`
--
ALTER TABLE `collection`
  MODIFY `ID_COLLECTION` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `commentaires`
--
ALTER TABLE `commentaires`
  MODIFY `ID_COMMENTAIRE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `favori`
--
ALTER TABLE `favori`
  MODIFY `ID_FAVORI` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `features`
--
ALTER TABLE `features`
  MODIFY `ID_FEATURE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT pour la table `fournisseur`
--
ALTER TABLE `fournisseur`
  MODIFY `ID_FOURNISSEUR` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `models`
--
ALTER TABLE `models`
  MODIFY `IDMOD` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `model_pricing`
--
ALTER TABLE `model_pricing`
  MODIFY `ID_MODEL_PRICING` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `notification`
--
ALTER TABLE `notification`
  MODIFY `ID_NOTIF` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `outils`
--
ALTER TABLE `outils`
  MODIFY `IDOUT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT pour la table `performance`
--
ALTER TABLE `performance`
  MODIFY `ID_PERFORMANCE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pour la table `plateforme`
--
ALTER TABLE `plateforme`
  MODIFY `ID_PLATEFORME` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `pricing_modele`
--
ALTER TABLE `pricing_modele`
  MODIFY `ID_PRICING_MODELE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT pour la table `pricing_modele_limite`
--
ALTER TABLE `pricing_modele_limite`
  MODIFY `ID_PRICING_MODELE_LIMITE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `pricing_plans`
--
ALTER TABLE `pricing_plans`
  MODIFY `ID_PRICING_PLAN` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT pour la table `signalements`
--
ALTER TABLE `signalements`
  MODIFY `ID_SIGNALEMENT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `soumission_outil`
--
ALTER TABLE `soumission_outil`
  MODIFY `ID_SOUMISSION` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pour la table `statistiques_externes`
--
ALTER TABLE `statistiques_externes`
  MODIFY `ID_STAT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `IDU` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `caracteristique_modele`
--
ALTER TABLE `caracteristique_modele`
  ADD CONSTRAINT `FK_CARACT_MODELE_CARACT` FOREIGN KEY (`ID_CARACT`) REFERENCES `caracteristique` (`ID_CARACT`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_CARACT_MODELE_MODELE` FOREIGN KEY (`IDMOD`) REFERENCES `models` (`IDMOD`) on DELETE CASCADE;

--
-- Contraintes pour la table `collection`
--
ALTER TABLE `collection`
  ADD CONSTRAINT `FK_COLLECTION_UTILISATEUR` FOREIGN KEY (`IDU`) REFERENCES `utilisateur` (`IDU`) on DELETE CASCADE;

--
-- Contraintes pour la table `collection_outil`
--
ALTER TABLE `collection_outil`
  ADD CONSTRAINT `FK_COLLECTION_OUTIL_COLLECTION` FOREIGN KEY (`ID_COLLECTION`) REFERENCES `collection` (`ID_COLLECTION`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_COLLECTION_OUTIL_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE;

--
-- Contraintes pour la table `commentaires`
--
ALTER TABLE `commentaires`
  ADD CONSTRAINT `FK_COMMENTAIRE_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_COMMENTAIRE_REPONSE` FOREIGN KEY (`COMMENTAIRE_PARENT_ID`) REFERENCES `commentaires` (`ID_COMMENTAIRE`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_COMMENTAIRE_UTILISATEUR` FOREIGN KEY (`IDU`) REFERENCES `utilisateur` (`IDU`) on DELETE CASCADE;

--
-- Contraintes pour la table `favori`
--
ALTER TABLE `favori`
  ADD CONSTRAINT `FK_FAVORI_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_FAVORI_UTILISATEUR` FOREIGN KEY (`IDU`) REFERENCES `utilisateur` (`IDU`) on DELETE CASCADE;

--
-- Contraintes pour la table `feature_modele`
--
ALTER TABLE `feature_modele`
  ADD CONSTRAINT `FK_FEATURE_MODELE_FEATURE` FOREIGN KEY (`ID_FEATURE`) REFERENCES `features` (`ID_FEATURE`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_FEATURE_MODELE_MODELE` FOREIGN KEY (`IDMOD`) REFERENCES `models` (`IDMOD`) on DELETE CASCADE;

--
-- Contraintes pour la table `feature_pricing`
--
ALTER TABLE `feature_pricing`
  ADD CONSTRAINT `FK_FEATURE_PRICING_FEATURE` FOREIGN KEY (`ID_FEATURE`) REFERENCES `features` (`ID_FEATURE`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_FEATURE_PRICING_PRICING` FOREIGN KEY (`ID_PRICING_PLAN`) REFERENCES `pricing_plans` (`ID_PRICING_PLAN`) on DELETE CASCADE;

--
-- Contraintes pour la table `historique_recherches`
--
ALTER TABLE `historique_recherches`
  ADD CONSTRAINT `FK_HISTORIQUE_UTILISATEUR` FOREIGN KEY (`IDU`) REFERENCES `utilisateur` (`IDU`) on DELETE CASCADE;

--
-- Contraintes pour la table `models`
--
ALTER TABLE `models`
  ADD CONSTRAINT `FK_MODELE_FOURNISSEUR` FOREIGN KEY (`ID_FOURNISSEUR`) REFERENCES `fournisseur` (`ID_FOURNISSEUR`) on DELETE CASCADE;

--
-- Contraintes pour la table `model_pricing`
--
ALTER TABLE `model_pricing`
  ADD CONSTRAINT `FK_MODEL_PRICING_MODELE` FOREIGN KEY (`IDMOD`) REFERENCES `models` (`IDMOD`) on DELETE CASCADE;

--
-- Contraintes pour la table `notification_utilisateur`
--
ALTER TABLE `notification_utilisateur`
  ADD CONSTRAINT `FK_NOTIF_USER_NOTIF` FOREIGN KEY (`ID_NOTIF`) REFERENCES `notification` (`ID_NOTIF`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_NOTIF_USER_USER` FOREIGN KEY (`IDU`) REFERENCES `utilisateur` (`IDU`) on DELETE CASCADE;

--
-- Contraintes pour la table `outils`
--
ALTER TABLE `outils`
  ADD CONSTRAINT `FK_OUTILS_FOURNISSEUR` FOREIGN KEY (`ID_FOURNISSEUR`) REFERENCES `fournisseur` (`ID_FOURNISSEUR`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_OUTILS_SOUMISSION` FOREIGN KEY (`ID_SOUMISSION`) REFERENCES `soumission_outil` (`ID_SOUMISSION`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_OUTILS_STATS` FOREIGN KEY (`ID_STAT`) REFERENCES `statistiques_externes` (`ID_STAT`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_OUTILS_VALIDATEUR` FOREIGN KEY (`IDU`) REFERENCES `utilisateur` (`IDU`) on DELETE CASCADE;

--
-- Contraintes pour la table `outil_caracteristique`
--
ALTER TABLE `outil_caracteristique`
  ADD CONSTRAINT `FK_OUTIL_CARACT_CARACT` FOREIGN KEY (`ID_CARACT`) REFERENCES `caracteristique` (`ID_CARACT`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_OUTIL_CARACT_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE;

--
-- Contraintes pour la table `outil_categorie`
--
ALTER TABLE `outil_categorie`
  ADD CONSTRAINT `FK_OUTIL_CATEGORIE_CATEGORIE` FOREIGN KEY (`ID_CATEGORIE`) REFERENCES `categories` (`ID_CATEGORIE`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_OUTIL_CATEGORIE_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE;

--
-- Contraintes pour la table `outil_feature`
--
ALTER TABLE `outil_feature`
  ADD CONSTRAINT `FK_OUTIL_FEATURE_FEATURE` FOREIGN KEY (`ID_FEATURE`) REFERENCES `features` (`ID_FEATURE`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_OUTIL_FEATURE_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE;

--
-- Contraintes pour la table `outil_modele`
--
ALTER TABLE `outil_modele`
  ADD CONSTRAINT `FK_OUTIL_MODELE_MODELE` FOREIGN KEY (`IDMOD`) REFERENCES `models` (`IDMOD`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_OUTIL_MODELE_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE;

--
-- Contraintes pour la table `outil_performance`
--
ALTER TABLE `outil_performance`
  ADD CONSTRAINT `FK_OUTIL_PERF_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_OUTIL_PERF_PERFORMANCE` FOREIGN KEY (`ID_PERFORMANCE`) REFERENCES `performance` (`ID_PERFORMANCE`) on DELETE CASCADE;

--
-- Contraintes pour la table `outil_plateforme`
--
ALTER TABLE `outil_plateforme`
  ADD CONSTRAINT `FK_OUTIL_PLATEFORME_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_OUTIL_PLATEFORME_PLATEFORME` FOREIGN KEY (`ID_PLATEFORME`) REFERENCES `plateforme` (`ID_PLATEFORME`) on DELETE CASCADE;

--
-- Contraintes pour la table `performance_modele`
--
ALTER TABLE `performance_modele`
  ADD CONSTRAINT `FK_PERF_MODELE_MODELE` FOREIGN KEY (`IDMOD`) REFERENCES `models` (`IDMOD`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_PERF_MODELE_PERF` FOREIGN KEY (`ID_PERFORMANCE`) REFERENCES `performance` (`ID_PERFORMANCE`) on DELETE CASCADE;

--
-- Contraintes pour la table `pricing_modele`
--
ALTER TABLE `pricing_modele`
  ADD CONSTRAINT `FK_PRICING_MODELE_MODELE` FOREIGN KEY (`IDMOD`) REFERENCES `models` (`IDMOD`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_PRICING_MODELE_PRICING` FOREIGN KEY (`ID_PRICING_PLAN`) REFERENCES `pricing_plans` (`ID_PRICING_PLAN`) on DELETE CASCADE;

--
-- Contraintes pour la table `pricing_modele_limite`
--
ALTER TABLE `pricing_modele_limite`
  ADD CONSTRAINT `FK_LIMITE_PRICING_MODELE` FOREIGN KEY (`ID_PRICING_MODELE`) REFERENCES `pricing_modele` (`ID_PRICING_MODELE`) on DELETE CASCADE;

--
-- Contraintes pour la table `pricing_plans`
--
ALTER TABLE `pricing_plans`
  ADD CONSTRAINT `FK_PRICING_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE;

--
-- Contraintes pour la table `signalements`
--
ALTER TABLE `signalements`
  ADD CONSTRAINT `FK_SIGNALEMENT_COMMENTAIRE` FOREIGN KEY (`ID_COMMENTAIRE`) REFERENCES `commentaires` (`ID_COMMENTAIRE`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_SIGNALEMENT_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_SIGNALEMENT_UTILISATEUR` FOREIGN KEY (`IDU`) REFERENCES `utilisateur` (`IDU`) on DELETE CASCADE;

--
-- Contraintes pour la table `soumission_outil`
--
ALTER TABLE `soumission_outil`
  ADD CONSTRAINT `FK_SOUMISSION_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE,
  ADD CONSTRAINT `FK_SOUMISSION_UTILISATEUR` FOREIGN KEY (`IDU`) REFERENCES `utilisateur` (`IDU`) on DELETE CASCADE;

--
-- Contraintes pour la table `statistiques_externes`
--
ALTER TABLE `statistiques_externes`
  ADD CONSTRAINT `FK_STATS_OUTIL` FOREIGN KEY (`IDOUT`) REFERENCES `outils` (`IDOUT`) on DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
