-- =============================================================
--  Schéma MySQL - Prêt pour XAMPP / phpMyAdmin
--  Projet : Annuaire d'outils IA
--  Créateur original : Mr.Anass / Oukhmou
--  Import : phpMyAdmin > Importer > Choisir ce fichier
-- =============================================================

CREATE DATABASE IF NOT EXISTS `dbAI`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `dbAI`;

SET SQL_MODE   = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone  = "+00:00";

-- =============================================================
--  Schéma MySQL généré depuis ModeleConceptuelDonnees_v2.mcd
--  Créateur original : Mr.Anass / Oukhmou
--  Généré automatiquement via PowerAMC CDM parser
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- -------------------------------------------------------------
-- TABLE : Utilsateur
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `utilisateur` (
  `idU`                  INT            NOT NULL AUTO_INCREMENT,
  `nom`                  VARCHAR(100)   NOT NULL,
  `prenom`               VARCHAR(20)    NOT NULL,
  `email`                VARCHAR(35)    NOT NULL UNIQUE,
  `mot_de_passe`         VARCHAR(255)   NOT NULL,
  `role`                 VARCHAR(20)    NOT NULL DEFAULT 'user',
  `statut`               VARCHAR(50)    NOT NULL DEFAULT 'actif',
  `avatar_url`           VARCHAR(255)   NULL,
  `date_inscription`     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `derniere_connexion`   DATETIME       NULL,
  PRIMARY KEY (`idU`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : categories
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id_Cat`       INT           NOT NULL AUTO_INCREMENT,
  `nom_Cat`      VARCHAR(30)   NOT NULL,
  `slug`         VARCHAR(100)  NOT NULL UNIQUE,
  `icone`        VARCHAR(40)   NULL,
  `description`  TEXT          NULL,
  PRIMARY KEY (`id_Cat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : tags
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tags` (
  `id_tag`  INT           NOT NULL AUTO_INCREMENT,
  `nom`     VARCHAR(100)  NOT NULL,
  `slug`    VARCHAR(100)  NOT NULL UNIQUE,
  PRIMARY KEY (`id_tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : plateforme
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plateforme` (
  `id`    INT           NOT NULL AUTO_INCREMENT,
  `nom`   VARCHAR(100)  NOT NULL,
  `slug`  VARCHAR(100)  NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : fournisseur
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fournisseur` (
  `id_fourn`    INT           NOT NULL AUTO_INCREMENT,
  `nom`         VARCHAR(100)  NOT NULL,
  `slug`        VARCHAR(100)  NOT NULL UNIQUE,
  `website`     VARCHAR(255)  NULL,
  `country`     VARCHAR(100)  NULL,
  `logo_url`    VARCHAR(255)  NULL,
  `created_at`  DATE          NOT NULL,
  `updated_at`  DATE          NULL,
  PRIMARY KEY (`id_fourn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : Models (modèles IA)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `models` (
  `idMod`           INT           NOT NULL AUTO_INCREMENT,
  `nom`             VARCHAR(100)  NOT NULL,
  `slug`            VARCHAR(100)  NOT NULL UNIQUE,
  `type`            VARCHAR(100)  NULL,
  `description`     TEXT          NULL,
  `licence`         VARCHAR(100)  NULL,
  `api_url`         VARCHAR(255)  NULL,
  `est_open_source` TINYINT(1)    NOT NULL DEFAULT 0,
  `release_date`    DATE          NULL,
  `multimodal`      TINYINT(1)    NOT NULL DEFAULT 0,
  `a_api`           TINYINT(1)    NOT NULL DEFAULT 0,
  `id_fourn`        INT           NOT NULL,
  PRIMARY KEY (`idMod`),
  CONSTRAINT `fk_models_fournisseur`
    FOREIGN KEY (`id_fourn`) REFERENCES `fournisseur` (`id_fourn`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : outils
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `outils` (
  `idOut`               INT           NOT NULL AUTO_INCREMENT,
  `nom`                 VARCHAR(100)  NOT NULL,
  `slug`                VARCHAR(100)  NOT NULL UNIQUE,
  `pricing_type`        VARCHAR(100)  NULL,
  `description_courte`  VARCHAR(255)  NULL,
  `description_longue`  TEXT          NULL,
  `logo_url`            VARCHAR(255)  NULL,
  `site_url`            VARCHAR(255)  NULL,
  `statut`              VARCHAR(50)   NOT NULL DEFAULT 'actif',
  `created_at`          DATE          NOT NULL,
  `update_at`           DATE          NULL,
  `release_date`        DATE          NULL,
  `open_source`         TINYINT(1)    NOT NULL DEFAULT 0,
  `type_tarif`          VARCHAR(100)  NULL,
  `id_fourn`            INT           NULL,
  PRIMARY KEY (`idOut`),
  CONSTRAINT `fk_outils_fournisseur`
    FOREIGN KEY (`id_fourn`) REFERENCES `fournisseur` (`id_fourn`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : caracteristique
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `caracteristique` (
  `id_Carct`    INT           NOT NULL AUTO_INCREMENT,
  `cle`         VARCHAR(100)  NOT NULL,
  `valeur`      VARCHAR(255)  NOT NULL,
  `type_valeur` VARCHAR(100)  NULL,
  PRIMARY KEY (`id_Carct`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : features
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `features` (
  `id_features`  INT    NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(100)  NOT NULL,
  `description`  TEXT          NULL,
  PRIMARY KEY (`id_features`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : pricing_plans
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pricing_plans` (
  `id_pricing_plans`  INT            NOT NULL AUTO_INCREMENT,
  `name`              VARCHAR(100)   NOT NULL,
  `price`             DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `currency`          VARCHAR(10)    NOT NULL DEFAULT 'USD',
  `period`            VARCHAR(50)    NULL,
  `description`       TEXT           NULL,
  `type`              VARCHAR(50)    NULL,
  `idOut`             INT            NOT NULL,
  PRIMARY KEY (`id_pricing_plans`),
  CONSTRAINT `fk_pricing_plans_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : model_pricing
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `model_pricing` (
  `id_model_pricing`  INT            NOT NULL AUTO_INCREMENT,
  `input_price`       DECIMAL(12,6)  NULL,
  `output_price`      DECIMAL(12,6)  NULL,
  `currency`          VARCHAR(10)    NOT NULL DEFAULT 'USD',
  `unit`              VARCHAR(50)    NULL,
  `effective_date`    DATE           NULL,
  `idMod`             INT            NOT NULL,
  PRIMARY KEY (`id_model_pricing`),
  CONSTRAINT `fk_model_pricing_models`
    FOREIGN KEY (`idMod`) REFERENCES `models` (`idMod`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : plan_models (liaison pricing_plans <-> models)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plan_models` (
  `id_plan_models`    INT  NOT NULL AUTO_INCREMENT,
  `id_pricing_plans`  INT  NOT NULL,
  `idMod`             INT  NOT NULL,
  PRIMARY KEY (`id_plan_models`),
  CONSTRAINT `fk_plan_models_pricing_plans`
    FOREIGN KEY (`id_pricing_plans`) REFERENCES `pricing_plans` (`id_pricing_plans`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_plan_models_models`
    FOREIGN KEY (`idMod`) REFERENCES `models` (`idMod`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : plan_model_limits
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plan_model_limits` (
  `id_plan_model_limits`  INT           NOT NULL AUTO_INCREMENT,
  `id_plan_models`        INT           NOT NULL,
  `limit_type`            VARCHAR(100)  NOT NULL,
  `value`                 INT           NULL,
  `period`                VARCHAR(50)   NULL,
  PRIMARY KEY (`id_plan_model_limits`),
  CONSTRAINT `fk_plan_model_limits_plan_models`
    FOREIGN KEY (`id_plan_models`) REFERENCES `plan_models` (`id_plan_models`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : Perfomance
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `performance` (
  `id_performance`  INT           NOT NULL AUTO_INCREMENT,
  `domaine`         VARCHAR(100)  NOT NULL,
  `score`           INT           NULL,
  PRIMARY KEY (`id_performance`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : reaction
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reaction` (
  `id_Reac`   INT           NOT NULL AUTO_INCREMENT,
  `type`      VARCHAR(50)   NOT NULL,
  `idU`       INT           NOT NULL,
  `idOut`     INT           NOT NULL,
  PRIMARY KEY (`id_Reac`),
  CONSTRAINT `fk_reaction_utilisateur`
    FOREIGN KEY (`idU`) REFERENCES `utilisateur` (`idU`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reaction_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : commentaires
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `commentaires` (
  `id_com`       INT    NOT NULL AUTO_INCREMENT,
  `contenu`      TEXT   NOT NULL,
  `statut`       VARCHAR(50)  NOT NULL DEFAULT 'actif',
  `created_at`   DATE  NOT NULL,
  `update_at`    DATE  NULL,
  `idU`          INT   NOT NULL,
  `idOut`        INT   NOT NULL,
  `parent_id`    INT   NULL COMMENT 'Réponse à un commentaire parent',
  PRIMARY KEY (`id_com`),
  CONSTRAINT `fk_commentaires_utilisateur`
    FOREIGN KEY (`idU`) REFERENCES `utilisateur` (`idU`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_commentaires_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_commentaires_parent`
    FOREIGN KEY (`parent_id`) REFERENCES `commentaires` (`id_com`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : signalements
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `signalements` (
  `id_Sig`      INT           NOT NULL AUTO_INCREMENT,
  `motif`       VARCHAR(100)  NOT NULL,
  `statut`      VARCHAR(50)   NOT NULL DEFAULT 'en_attente',
  `date`        DATE          NOT NULL,
  `description` TEXT          NULL,
  `created_at`  DATE          NOT NULL,
  `idU`         INT           NOT NULL,
  `idOut`       INT           NOT NULL,
  `id_com`      INT           NULL COMMENT 'Signalement d un commentaire (optionnel)',
  PRIMARY KEY (`id_Sig`),
  CONSTRAINT `fk_signalements_utilisateur`
    FOREIGN KEY (`idU`) REFERENCES `utilisateur` (`idU`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_signalements_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_signalements_commentaires`
    FOREIGN KEY (`id_com`) REFERENCES `commentaires` (`id_com`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : favori
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `favori` (
  `idFav`        INT   NOT NULL AUTO_INCREMENT,
  `date_ajouter` DATE  NOT NULL,
  `idU`          INT   NOT NULL,
  `idOut`        INT   NOT NULL,
  PRIMARY KEY (`idFav`),
  UNIQUE KEY `uq_favori_user_outil` (`idU`, `idOut`),
  CONSTRAINT `fk_favori_utilisateur`
    FOREIGN KEY (`idU`) REFERENCES `utilisateur` (`idU`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favori_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : historique_recherches
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `historique_recherches` (
  `id_Rech`    INT       NOT NULL AUTO_INCREMENT,
  `query`      TEXT      NOT NULL,
  `date_Rech`  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resultats`  INT       NULL DEFAULT 0,
  `idU`        INT       NOT NULL,
  PRIMARY KEY (`id_Rech`),
  CONSTRAINT `fk_historique_utilisateur`
    FOREIGN KEY (`idU`) REFERENCES `utilisateur` (`idU`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : collection
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `collection` (
  `id_coll`    INT           NOT NULL AUTO_INCREMENT,
  `nom`        VARCHAR(100)  NOT NULL,
  `decription` VARCHAR(255)  NULL,
  `created_at` DATE          NOT NULL,
  `idU`        INT           NOT NULL,
  PRIMARY KEY (`id_coll`),
  CONSTRAINT `fk_collection_utilisateur`
    FOREIGN KEY (`idU`) REFERENCES `utilisateur` (`idU`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : soumission_outil
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `soumission_outil` (
  `id_soum`      INT   NOT NULL AUTO_INCREMENT,
  `statut`       VARCHAR(50)  NOT NULL DEFAULT 'en_attente',
  `note_admin`   TEXT         NULL,
  `nombre_soum`  INT          NOT NULL DEFAULT 0,
  `limite_soum`  INT          NOT NULL DEFAULT 3,
  `created_at`   DATE         NOT NULL,
  `update_at`    DATE         NULL,
  `idU`          INT          NOT NULL,
  `idOut`        INT          NULL,
  PRIMARY KEY (`id_soum`),
  CONSTRAINT `fk_soumission_utilisateur`
    FOREIGN KEY (`idU`) REFERENCES `utilisateur` (`idU`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_soumission_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : notification
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notification` (
  `id_Notif`    INT           NOT NULL AUTO_INCREMENT,
  `cible`       VARCHAR(50)   NOT NULL,
  `type`        VARCHAR(50)   NOT NULL,
  `titre`       VARCHAR(255)  NOT NULL,
  `message`     TEXT          NOT NULL,
  `created_at`  DATE          NOT NULL,
  `idU`         INT           NOT NULL,
  PRIMARY KEY (`id_Notif`),
  CONSTRAINT `fk_notification_utilisateur`
    FOREIGN KEY (`idU`) REFERENCES `utilisateur` (`idU`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- TABLE : avis
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `avis` (
  `id_avis`    INT    NOT NULL AUTO_INCREMENT,
  `note`       INT    NOT NULL CHECK (`note` BETWEEN 1 AND 5),
  `titre`      VARCHAR(255)  NULL,
  `contenu`    TEXT          NOT NULL,
  `created_at` DATE          NOT NULL,
  `idU`        INT           NOT NULL,
  `idOut`      INT           NOT NULL,
  PRIMARY KEY (`id_avis`),
  UNIQUE KEY `uq_avis_user_outil` (`idU`, `idOut`),
  CONSTRAINT `fk_avis_utilisateur`
    FOREIGN KEY (`idU`) REFERENCES `utilisateur` (`idU`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_avis_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
--  TABLES DE JONCTION  (relations Many-to-Many)
-- =============================================================

-- outils <-> categories  (classifier)
CREATE TABLE IF NOT EXISTS `outil_categorie` (
  `idOut`    INT  NOT NULL,
  `id_Cat`   INT  NOT NULL,
  PRIMARY KEY (`idOut`, `id_Cat`),
  CONSTRAINT `fk_oc_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_oc_categories`
    FOREIGN KEY (`id_Cat`) REFERENCES `categories` (`id_Cat`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- outils <-> tags  (associé à)
CREATE TABLE IF NOT EXISTS `outil_tag` (
  `idOut`   INT  NOT NULL,
  `id_tag`  INT  NOT NULL,
  PRIMARY KEY (`idOut`, `id_tag`),
  CONSTRAINT `fk_ot_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ot_tags`
    FOREIGN KEY (`id_tag`) REFERENCES `tags` (`id_tag`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- outils <-> Models  (utilise)
CREATE TABLE IF NOT EXISTS `outil_model` (
  `idOut`   INT  NOT NULL,
  `idMod`   INT  NOT NULL,
  PRIMARY KEY (`idOut`, `idMod`),
  CONSTRAINT `fk_om_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_om_models`
    FOREIGN KEY (`idMod`) REFERENCES `models` (`idMod`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- outils <-> caracteristique  (possède)
CREATE TABLE IF NOT EXISTS `outil_caracteristique` (
  `idOut`     INT  NOT NULL,
  `id_Carct`  INT  NOT NULL,
  PRIMARY KEY (`idOut`, `id_Carct`),
  CONSTRAINT `fk_oca_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_oca_caracteristique`
    FOREIGN KEY (`id_Carct`) REFERENCES `caracteristique` (`id_Carct`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- outils <-> plateforme  (disponible)
CREATE TABLE IF NOT EXISTS `outil_plateforme` (
  `idOut`  INT  NOT NULL,
  `id`     INT  NOT NULL,
  PRIMARY KEY (`idOut`, `id`),
  CONSTRAINT `fk_op_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_op_plateforme`
    FOREIGN KEY (`id`) REFERENCES `plateforme` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- collection <-> outils  (contient)
CREATE TABLE IF NOT EXISTS `collection_outil` (
  `id_coll`  INT  NOT NULL,
  `idOut`    INT  NOT NULL,
  PRIMARY KEY (`id_coll`, `idOut`),
  CONSTRAINT `fk_co_collection`
    FOREIGN KEY (`id_coll`) REFERENCES `collection` (`id_coll`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_co_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- utilisateur <-> outils  (valider - modération admin)
CREATE TABLE IF NOT EXISTS `validation_outil` (
  `idU`    INT          NOT NULL,
  `idOut`  INT          NOT NULL,
  `date`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `statut` VARCHAR(50)  NOT NULL DEFAULT 'validé',
  PRIMARY KEY (`idU`, `idOut`),
  CONSTRAINT `fk_vo_utilisateur`
    FOREIGN KEY (`idU`) REFERENCES `utilisateur` (`idU`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vo_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- caracteristique <-> Models  (possede)
CREATE TABLE IF NOT EXISTS `model_caracteristique` (
  `id_Carct`  INT  NOT NULL,
  `idMod`     INT  NOT NULL,
  PRIMARY KEY (`id_Carct`, `idMod`),
  CONSTRAINT `fk_mc_caracteristique`
    FOREIGN KEY (`id_Carct`) REFERENCES `caracteristique` (`id_Carct`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mc_models`
    FOREIGN KEY (`idMod`) REFERENCES `models` (`idMod`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- features <-> Models  (possède)
CREATE TABLE IF NOT EXISTS `model_feature` (
  `id_features`  INT  NOT NULL,
  `idMod`        INT  NOT NULL,
  PRIMARY KEY (`id_features`, `idMod`),
  CONSTRAINT `fk_mf_features`
    FOREIGN KEY (`id_features`) REFERENCES `features` (`id_features`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mf_models`
    FOREIGN KEY (`idMod`) REFERENCES `models` (`idMod`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- features <-> outils  (concerne)
CREATE TABLE IF NOT EXISTS `outil_feature` (
  `id_features`  INT  NOT NULL,
  `idOut`        INT  NOT NULL,
  PRIMARY KEY (`id_features`, `idOut`),
  CONSTRAINT `fk_of_features`
    FOREIGN KEY (`id_features`) REFERENCES `features` (`id_features`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_of_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- features <-> pricing_plans  (plan_features)
CREATE TABLE IF NOT EXISTS `plan_feature` (
  `id_features`       INT  NOT NULL,
  `id_pricing_plans`  INT  NOT NULL,
  PRIMARY KEY (`id_features`, `id_pricing_plans`),
  CONSTRAINT `fk_pf_features`
    FOREIGN KEY (`id_features`) REFERENCES `features` (`id_features`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pf_pricing_plans`
    FOREIGN KEY (`id_pricing_plans`) REFERENCES `pricing_plans` (`id_pricing_plans`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- outils <-> performance  (possede)
CREATE TABLE IF NOT EXISTS `outil_performance` (
  `idOut`           INT  NOT NULL,
  `id_performance`  INT  NOT NULL,
  PRIMARY KEY (`idOut`, `id_performance`),
  CONSTRAINT `fk_operf_outils`
    FOREIGN KEY (`idOut`) REFERENCES `outils` (`idOut`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_operf_performance`
    FOREIGN KEY (`id_performance`) REFERENCES `performance` (`id_performance`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Models <-> performance  (possede)
CREATE TABLE IF NOT EXISTS `model_performance` (
  `idMod`           INT  NOT NULL,
  `id_performance`  INT  NOT NULL,
  PRIMARY KEY (`idMod`, `id_performance`),
  CONSTRAINT `fk_mperf_models`
    FOREIGN KEY (`idMod`) REFERENCES `models` (`idMod`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mperf_performance`
    FOREIGN KEY (`id_performance`) REFERENCES `performance` (`id_performance`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- model_pricing <-> Models  (correspond — many-to-many si besoin)
-- Déjà géré par la FK dans model_pricing.idMod (1,1 côté model_pricing)

SET FOREIGN_KEY_CHECKS = 1;
