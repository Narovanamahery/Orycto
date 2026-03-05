DROP VIEW IF EXISTS v_indicateurs;
DROP VIEW IF EXISTS v_accouplements;
DROP VIEW IF EXISTS v_alertes_stock;
DROP VIEW IF EXISTS v_lapins;

DROP TABLE IF EXISTS distributions_aliment;
DROP TABLE IF EXISTS stocks_aliment;
DROP TABLE IF EXISTS aliments;
DROP TABLE IF EXISTS suivis_sante;
DROP TABLE IF EXISTS pathologies;
DROP TABLE IF EXISTS mise_bas;
DROP TABLE IF EXISTS accouplements;
DROP TABLE IF EXISTS pesees;
DROP TABLE IF EXISTS evenements;
DROP TABLE IF EXISTS lapins;
DROP TABLE IF EXISTS cages;
DROP TABLE IF EXISTS races;
DROP TABLE IF EXISTS utilisateurs;


CREATE TABLE utilisateurs (
  id            SERIAL PRIMARY KEY,
  nom           VARCHAR(80)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  role          VARCHAR(30)  NOT NULL DEFAULT 'worker',
  mot_de_passe  VARCHAR(255) NOT NULL,
  actif         BOOLEAN      NOT NULL DEFAULT TRUE,
  cree_le       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO utilisateurs (nom, email, role, mot_de_passe) VALUES
  ('Admin',        'admin@orycto.mg',  'admin',        '$2b$10$PLACEHOLDER_HASH'),
  ('Marie Dupont', 'marie@orycto.mg',  'veterinarian', '$2b$10$PLACEHOLDER_HASH'),
  ('Jean Rakoto',  'jean@orycto.mg',   'worker',       '$2b$10$PLACEHOLDER_HASH');


CREATE TABLE races (
  id            SERIAL PRIMARY KEY,
  nom           VARCHAR(60)  NOT NULL UNIQUE,
  origine       VARCHAR(80),
  poids_moyen   DECIMAL(4,2),
  description   TEXT
);

INSERT INTO races (nom, origine, poids_moyen, description) VALUES
  ('Flemish Giant', 'Belgique',   6.50, 'Grande race, docile, croissance lente'),
  ('Rex',           'France',     3.50, 'Fourrure veloutée, bonne reproduction'),
  ('Californian',   'Etats-Unis', 4.00, 'Race a viande, prolifique'),
  ('Dutch',         'Pays-Bas',   2.50, 'Petite race, bonne mere'),
  ('New Zealand',   'Etats-Unis', 4.50, 'Race a viande standard, rustique');


CREATE TABLE cages (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(10)  NOT NULL UNIQUE,
  section       CHAR(1)      NOT NULL,
  capacite_max  SMALLINT     NOT NULL DEFAULT 1,
  type_cage     VARCHAR(30)  NOT NULL DEFAULT 'standard',
  actif         BOOLEAN      NOT NULL DEFAULT TRUE,
  notes         TEXT
);

INSERT INTO cages (code, section, capacite_max, type_cage) VALUES
  ('A-01','A',1,'standard'), ('A-02','A',1,'standard'), ('A-03','A',1,'standard'),
  ('A-04','A',1,'standard'), ('A-05','A',1,'standard'), ('A-06','A',1,'standard'),
  ('A-07','A',1,'standard'), ('A-08','A',1,'standard'), ('A-09','A',1,'standard'),
  ('B-01','B',1,'maternite'),('B-02','B',1,'maternite'),('B-03','B',2,'standard'),
  ('B-04','B',1,'standard'), ('B-05','B',1,'standard'), ('B-06','B',1,'standard'),
  ('C-01','C',1,'nursery'),  ('C-02','C',1,'nursery'),  ('C-03','C',1,'standard'),
  ('C-04','C',1,'standard'), ('C-05','C',1,'standard');


CREATE TABLE lapins (
  id             SERIAL PRIMARY KEY,
  tag            VARCHAR(20)  NOT NULL UNIQUE,
  nom            VARCHAR(60)  NOT NULL,
  sexe           CHAR(1)      NOT NULL CHECK (sexe IN ('M','F')),
  race_id        INT          REFERENCES races(id),
  date_naissance DATE,
  cage_id        INT          REFERENCES cages(id),
  poids_actuel   DECIMAL(5,2),
  statut         VARCHAR(20)  NOT NULL DEFAULT 'actif',
  mere_id        INT          REFERENCES lapins(id),
  pere_id        INT          REFERENCES lapins(id),
  notes          TEXT,
  cree_le        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mis_a_jour     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lapins_statut ON lapins(statut);
CREATE INDEX idx_lapins_sexe   ON lapins(sexe);
CREATE INDEX idx_lapins_cage   ON lapins(cage_id);

INSERT INTO lapins (tag, nom, sexe, race_id, date_naissance, cage_id, poids_actuel, statut) VALUES
  ('LP-2023-001','Atlas',      'M',(SELECT id FROM races WHERE nom='Flemish Giant'),'2023-03-10',(SELECT id FROM cages WHERE code='A-01'),4.80,'actif'),
  ('LP-2023-002','Luna',       'F',(SELECT id FROM races WHERE nom='Rex'),          '2023-04-05',(SELECT id FROM cages WHERE code='B-02'),3.20,'gestante'),
  ('LP-2023-003','Noisette',   'F',(SELECT id FROM races WHERE nom='Californian'),  '2023-05-18',(SELECT id FROM cages WHERE code='B-01'),2.95,'gestante'),
  ('LP-2023-004','Rex',        'M',(SELECT id FROM races WHERE nom='Rex'),          '2023-06-22',(SELECT id FROM cages WHERE code='A-02'),3.60,'actif'),
  ('LP-2023-005','Cleo',       'F',(SELECT id FROM races WHERE nom='Dutch'),        '2023-07-01',(SELECT id FROM cages WHERE code='C-01'),2.80,'allaitante'),
  ('LP-2023-006','Brutus',     'M',(SELECT id FROM races WHERE nom='Flemish Giant'),'2023-08-14',(SELECT id FROM cages WHERE code='A-03'),5.10,'actif'),
  ('LP-2023-007','Bella',      'F',(SELECT id FROM races WHERE nom='New Zealand'),  '2023-09-03',(SELECT id FROM cages WHERE code='B-03'),3.40,'actif'),
  ('LP-2023-008','Toby',       'M',(SELECT id FROM races WHERE nom='Californian'),  '2023-10-20',(SELECT id FROM cages WHERE code='A-04'),3.85,'actif'),
  ('LP-2024-001','Biscotte',   'F',(SELECT id FROM races WHERE nom='Dutch'),        '2024-01-12',(SELECT id FROM cages WHERE code='C-02'),2.50,'actif'),
  ('LP-2024-002','Petit Paul', 'M',(SELECT id FROM races WHERE nom='Californian'),  '2024-02-05',NULL,                                    2.90,'vendu'),
  ('LP-2024-003','Moka',       'F',(SELECT id FROM races WHERE nom='Rex'),          '2024-03-18',(SELECT id FROM cages WHERE code='C-03'),2.10,'actif'),
  ('LP-2024-004','Caramel',    'M',(SELECT id FROM races WHERE nom='Dutch'),        '2024-04-07',(SELECT id FROM cages WHERE code='A-05'),2.30,'actif'),
  ('LP-2024-005','Vanille',    'F',(SELECT id FROM races WHERE nom='New Zealand'),  '2024-05-22',(SELECT id FROM cages WHERE code='B-04'),2.70,'actif'),
  ('LP-2024-006','Oreo',       'M',(SELECT id FROM races WHERE nom='Dutch'),        '2024-06-10',(SELECT id FROM cages WHERE code='A-06'),1.95,'actif'),
  ('LP-2024-007','Perle',      'F',(SELECT id FROM races WHERE nom='Flemish Giant'),'2024-07-01',(SELECT id FROM cages WHERE code='C-04'),3.10,'actif'),
  ('LP-2024-008','Blanche',    'F',(SELECT id FROM races WHERE nom='Rex'),          '2024-08-15',(SELECT id FROM cages WHERE code='C-01'),2.40,'actif'),
  ('LP-2024-009','Choco',      'M',(SELECT id FROM races WHERE nom='Californian'),  '2024-09-05',(SELECT id FROM cages WHERE code='A-07'),2.20,'malade'),
  ('LP-2024-010','Fifi',       'F',(SELECT id FROM races WHERE nom='New Zealand'),  '2024-10-18',(SELECT id FROM cages WHERE code='B-05'),1.85,'actif'),
  ('LP-2024-011','Maximus',    'M',(SELECT id FROM races WHERE nom='Flemish Giant'),'2024-11-02',(SELECT id FROM cages WHERE code='A-08'),2.60,'actif'),
  ('LP-2024-012','Lily',       'F',(SELECT id FROM races WHERE nom='Dutch'),        '2024-12-14',(SELECT id FROM cages WHERE code='C-05'),1.70,'actif'),
  ('LP-2024-015','Oscar',      'M',(SELECT id FROM races WHERE nom='Flemish Giant'),'2024-09-20',(SELECT id FROM cages WHERE code='A-04'),3.10,'actif'),
  ('LP-2025-001','Tigre',      'M',(SELECT id FROM races WHERE nom='Rex'),          '2025-01-08',(SELECT id FROM cages WHERE code='A-09'),1.50,'actif'),
  ('LP-2025-002','Rose',       'F',(SELECT id FROM races WHERE nom='Californian'),  '2025-02-20',(SELECT id FROM cages WHERE code='B-06'),1.20,'actif');

-- Relations mere / pere
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2023-005'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-004') WHERE tag='LP-2024-001';
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2023-003'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-001') WHERE tag='LP-2024-002';
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2023-002'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-004') WHERE tag='LP-2024-003';
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2023-005'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-004') WHERE tag='LP-2024-004';
UPDATE lapins SET                                                           pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-006') WHERE tag='LP-2024-007';
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2023-002'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-004') WHERE tag='LP-2024-008';
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2023-003'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-001') WHERE tag='LP-2024-009';
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2023-007'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-008') WHERE tag='LP-2024-010';
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2024-007'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-006') WHERE tag='LP-2024-011';
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2024-001'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2024-004') WHERE tag='LP-2024-012';
UPDATE lapins SET                                                           pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-006') WHERE tag='LP-2024-015';
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2024-001'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2024-004') WHERE tag='LP-2024-006';
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2024-003'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-004') WHERE tag='LP-2025-001';
UPDATE lapins SET mere_id=(SELECT id FROM lapins WHERE tag='LP-2023-003'), pere_id=(SELECT id FROM lapins WHERE tag='LP-2023-008') WHERE tag='LP-2025-002';


CREATE TABLE pesees (
  id          SERIAL PRIMARY KEY,
  lapin_id    INT          NOT NULL REFERENCES lapins(id) ON DELETE CASCADE,
  poids       DECIMAL(5,2) NOT NULL,
  date_pesee  DATE         NOT NULL,
  notes       TEXT,
  cree_par    INT          REFERENCES utilisateurs(id)
);

CREATE INDEX idx_pesees_lapin ON pesees(lapin_id);

INSERT INTO pesees (lapin_id, poids, date_pesee, notes) VALUES
  ((SELECT id FROM lapins WHERE tag='LP-2023-001'), 4.80, '2026-03-04', 'Pesee mensuelle'),
  ((SELECT id FROM lapins WHERE tag='LP-2023-002'), 3.20, '2026-03-04', 'Pesee mensuelle'),
  ((SELECT id FROM lapins WHERE tag='LP-2023-004'), 3.60, '2026-03-04', 'Pesee mensuelle'),
  ((SELECT id FROM lapins WHERE tag='LP-2024-015'), 3.10, '2026-03-04', 'Pesee hebdomadaire'),
  ((SELECT id FROM lapins WHERE tag='LP-2023-001'), 4.75, '2026-02-04', NULL),
  ((SELECT id FROM lapins WHERE tag='LP-2023-001'), 4.70, '2026-01-04', NULL);


CREATE TABLE accouplements (
  id                    SERIAL PRIMARY KEY,
  code                  VARCHAR(15) NOT NULL UNIQUE,
  male_id               INT         NOT NULL REFERENCES lapins(id),
  femelle_id            INT         NOT NULL REFERENCES lapins(id),
  date_accouplement     DATE        NOT NULL,
  date_naissance_prevue DATE,
  date_naissance_reelle DATE,
  statut                VARCHAR(15) NOT NULL DEFAULT 'planifie',
  taille_portee         SMALLINT,
  notes                 TEXT,
  cree_le               TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accouplements_statut  ON accouplements(statut);
CREATE INDEX idx_accouplements_femelle ON accouplements(femelle_id);

INSERT INTO accouplements
  (code, male_id, femelle_id, date_accouplement, date_naissance_prevue, date_naissance_reelle, statut, taille_portee) VALUES
  ('ACC-001',
    (SELECT id FROM lapins WHERE tag='LP-2023-001'),
    (SELECT id FROM lapins WHERE tag='LP-2023-002'),
    '2025-12-01','2026-01-01','2026-01-01','succes',6),
  ('ACC-002',
    (SELECT id FROM lapins WHERE tag='LP-2023-004'),
    (SELECT id FROM lapins WHERE tag='LP-2023-005'),
    '2026-01-08','2026-02-08','2026-02-10','succes',5),
  ('ACC-003',
    (SELECT id FROM lapins WHERE tag='LP-2023-001'),
    (SELECT id FROM lapins WHERE tag='LP-2023-003'),
    '2026-02-02','2026-03-05',NULL,'en_attente',NULL),
  ('ACC-004',
    (SELECT id FROM lapins WHERE tag='LP-2023-006'),
    (SELECT id FROM lapins WHERE tag='LP-2023-002'),
    '2026-02-10','2026-03-13',NULL,'en_attente',NULL),
  ('ACC-005',
    (SELECT id FROM lapins WHERE tag='LP-2023-008'),
    (SELECT id FROM lapins WHERE tag='LP-2024-005'),
    '2026-03-01','2026-04-01',NULL,'planifie',NULL),
  ('ACC-006',
    (SELECT id FROM lapins WHERE tag='LP-2023-004'),
    (SELECT id FROM lapins WHERE tag='LP-2024-003'),
    '2025-09-10','2025-10-11',NULL,'echec',NULL),
  ('ACC-007',
    (SELECT id FROM lapins WHERE tag='LP-2023-001'),
    (SELECT id FROM lapins WHERE tag='LP-2023-007'),
    '2026-03-03','2026-04-03',NULL,'planifie',NULL);


CREATE TABLE mise_bas (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(15) NOT NULL UNIQUE,
  accouplement_id INT         NOT NULL REFERENCES accouplements(id),
  date_naissance  DATE        NOT NULL,
  nb_nes          SMALLINT    NOT NULL DEFAULT 0,
  nb_vivants      SMALLINT    NOT NULL DEFAULT 0,
  nb_morts        SMALLINT    NOT NULL DEFAULT 0,
  nb_sevres       SMALLINT    NOT NULL DEFAULT 0,
  cage_id         INT         REFERENCES cages(id),
  notes           TEXT
);

INSERT INTO mise_bas
  (code, accouplement_id, date_naissance, nb_nes, nb_vivants, nb_morts, nb_sevres, cage_id, notes) VALUES
  ('LIT-001',
    (SELECT id FROM accouplements WHERE code='ACC-001'),
    '2026-01-01',6,6,0,6,
    (SELECT id FROM cages WHERE code='C-01'),
    'Portee saine, tous sevrés'),
  ('LIT-002',
    (SELECT id FROM accouplements WHERE code='ACC-002'),
    '2026-02-10',5,5,0,0,
    (SELECT id FROM cages WHERE code='C-01'),
    'Sevrage en cours'),
  ('LIT-003',
    (SELECT id FROM accouplements WHERE code='ACC-001'),
    '2025-10-05',7,6,1,6,
    (SELECT id FROM cages WHERE code='C-02'),
    'Portee precedente ACC-001');


CREATE TABLE suivis_sante (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(15)  NOT NULL UNIQUE,
  lapin_id        INT          NOT NULL REFERENCES lapins(id) ON DELETE CASCADE,
  type_soin       VARCHAR(30)  NOT NULL,
  nom_traitement  VARCHAR(100) NOT NULL,
  date_debut      DATE,
  date_fin        DATE,
  statut          VARCHAR(15)  NOT NULL DEFAULT 'planifie',
  notes           TEXT,
  cree_par        INT          REFERENCES utilisateurs(id),
  cree_le         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sante_lapin  ON suivis_sante(lapin_id);
CREATE INDEX idx_sante_statut ON suivis_sante(statut);

INSERT INTO suivis_sante
  (code, lapin_id, type_soin, nom_traitement, date_debut, date_fin, statut, notes) VALUES
  ('TRT-001',(SELECT id FROM lapins WHERE tag='LP-2023-001'),'vaccin',         'Vaccin VHD',      '2025-12-10','2025-12-10','termine',   'Annuel VHD'),
  ('TRT-002',(SELECT id FROM lapins WHERE tag='LP-2023-002'),'antiparasitaire','Ivermectine',     '2026-01-05','2026-01-12','termine',   'Prevention gale'),
  ('TRT-003',(SELECT id FROM lapins WHERE tag='LP-2023-003'),'medicament',     'Enrofloxacine',   '2026-02-10','2026-02-17','en_cours',  'Infection respiratoire'),
  ('TRT-004',(SELECT id FROM lapins WHERE tag='LP-2023-004'),'vaccin',         'Vaccin VHD',      '2026-02-20','2026-02-20','en_retard', 'Annuel EN RETARD'),
  ('TRT-005',(SELECT id FROM lapins WHERE tag='LP-2023-001'),'vaccin',         'Vaccin VHD',      '2026-02-20','2026-02-20','en_retard', 'Annuel EN RETARD'),
  ('TRT-006',(SELECT id FROM lapins WHERE tag='LP-2024-015'),'vaccin',         'Vaccin VHD',      '2026-02-20','2026-02-20','en_retard', 'Annuel EN RETARD'),
  ('TRT-007',(SELECT id FROM lapins WHERE tag='LP-2024-009'),'medicament',     'Trimethoprime',   '2026-02-15','2026-02-25','en_cours',  'Coccidiose'),
  ('TRT-008',(SELECT id FROM lapins WHERE tag='LP-2023-007'),'antiparasitaire','Fenbendazole',    '2026-01-20','2026-01-25','termine',   'Prevention E. cuniculi'),
  ('TRT-009',(SELECT id FROM lapins WHERE tag='LP-2023-005'),'vitamine',       'Complexe vit. B', '2026-02-01','2026-02-07','termine',   'Recuperation post-naissance'),
  ('TRT-010',(SELECT id FROM lapins WHERE tag='LP-2024-003'),'medicament',     'Metronidazole',   '2026-02-18','2026-02-28','en_cours',  'Troubles digestifs');


CREATE TABLE pathologies (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(15) NOT NULL UNIQUE,
  lapin_id        INT         NOT NULL REFERENCES lapins(id) ON DELETE CASCADE,
  maladie         VARCHAR(100) NOT NULL,
  date_diagnostic DATE        NOT NULL,
  statut          VARCHAR(15) NOT NULL DEFAULT 'en_cours',
  severite        VARCHAR(10) NOT NULL DEFAULT 'leger',
  notes           TEXT
);

INSERT INTO pathologies
  (code, lapin_id, maladie, date_diagnostic, statut, severite, notes) VALUES
  ('PATH-001',(SELECT id FROM lapins WHERE tag='LP-2024-009'),'Coccidiose',            '2026-02-15','en_cours','modere','En traitement'),
  ('PATH-002',(SELECT id FROM lapins WHERE tag='LP-2023-003'),'Infection respiratoire','2026-02-10','en_cours','leger', 'Antibiotiques'),
  ('PATH-003',(SELECT id FROM lapins WHERE tag='LP-2024-003'),'Enterite',              '2026-02-18','en_cours','leger', 'Support digestif'),
  ('PATH-004',(SELECT id FROM lapins WHERE tag='LP-2023-006'),'Malocclusion dentaire', '2025-11-05','stable',  'modere','Limage regulier requis'),
  ('PATH-005',(SELECT id FROM lapins WHERE tag='LP-2023-007'),'E. cuniculi',           '2026-01-15','gueri',   'leger', 'Resolu avec traitement');


CREATE TABLE aliments (
  id             SERIAL PRIMARY KEY,
  code           VARCHAR(15)   NOT NULL UNIQUE,
  nom            VARCHAR(60)   NOT NULL,
  type_aliment   VARCHAR(30)   NOT NULL,
  unite          VARCHAR(10)   NOT NULL DEFAULT 'kg',
  cout_unitaire  DECIMAL(10,2) NOT NULL DEFAULT 0,
  actif          BOOLEAN       NOT NULL DEFAULT TRUE
);

INSERT INTO aliments (code, nom, type_aliment, unite, cout_unitaire) VALUES
  ('ALM-001','Foin',         'fourrage',   'kg', 500),
  ('ALM-002','Granules',     'concentre',  'kg', 3500),
  ('ALM-003','Legumes verts','legumes',    'kg', 200),
  ('ALM-004','Eau',          'eau',        'L',  0),
  ('ALM-005','Mais',         'cereales',   'kg', 1200),
  ('ALM-006','Mix vitamines','complement', 'g',  8000);


CREATE TABLE stocks_aliment (
  id              SERIAL PRIMARY KEY,
  aliment_id      INT           NOT NULL UNIQUE REFERENCES aliments(id),
  quantite        DECIMAL(10,3) NOT NULL DEFAULT 0,
  seuil_alerte    DECIMAL(10,3) NOT NULL DEFAULT 0,
  quantite_max    DECIMAL(10,3),
  date_expiration DATE,
  mis_a_jour      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stocks_aliment
  (aliment_id, quantite, seuil_alerte, quantite_max, date_expiration) VALUES
  ((SELECT id FROM aliments WHERE code='ALM-001'), 12,  20,  50,  '2026-03-20'),
  ((SELECT id FROM aliments WHERE code='ALM-002'), 8,   15,  25,  '2026-06-01'),
  ((SELECT id FROM aliments WHERE code='ALM-003'), 45,  5,   50,  '2026-03-15'),
  ((SELECT id FROM aliments WHERE code='ALM-004'), 200, 50,  200, NULL),
  ((SELECT id FROM aliments WHERE code='ALM-005'), 6,   10,  20,  '2026-05-15'),
  ((SELECT id FROM aliments WHERE code='ALM-006'), 350, 100, 500, '2026-08-01');


CREATE TABLE distributions_aliment (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(15)  NOT NULL UNIQUE,
  date_dist   DATE         NOT NULL,
  aliment_id  INT          NOT NULL REFERENCES aliments(id),
  lapin_id    INT          REFERENCES lapins(id),
  cage_id     INT          REFERENCES cages(id),
  quantite    DECIMAL(8,3) NOT NULL,
  notes       TEXT,
  cree_par    INT          REFERENCES utilisateurs(id),
  cree_le     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dist_date    ON distributions_aliment(date_dist);
CREATE INDEX idx_dist_aliment ON distributions_aliment(aliment_id);

INSERT INTO distributions_aliment
  (code, date_dist, aliment_id, lapin_id, cage_id, quantite, notes) VALUES
  ('DST-001','2026-03-05',(SELECT id FROM aliments WHERE code='ALM-001'),NULL,NULL,2.5,'Ration matinale'),
  ('DST-002','2026-03-05',(SELECT id FROM aliments WHERE code='ALM-002'),NULL,NULL,0.8,'Ration matinale'),
  ('DST-003','2026-03-05',
    (SELECT id FROM aliments WHERE code='ALM-003'),
    (SELECT id FROM lapins WHERE tag='LP-2023-005'),
    (SELECT id FROM cages WHERE code='C-01'),0.3,'Regime allaitante'),
  ('DST-004','2026-03-04',(SELECT id FROM aliments WHERE code='ALM-001'),NULL,NULL,2.5,'Ration du soir'),
  ('DST-005','2026-03-04',
    (SELECT id FROM aliments WHERE code='ALM-002'),
    (SELECT id FROM lapins WHERE tag='LP-2023-002'),
    (SELECT id FROM cages WHERE code='B-02'),0.4,'Regime gestation'),
  ('DST-006','2026-03-04',
    (SELECT id FROM aliments WHERE code='ALM-006'),
    (SELECT id FROM lapins WHERE tag='LP-2023-003'),
    (SELECT id FROM cages WHERE code='B-01'),5,'Supplement prenatal'),
  ('DST-007','2026-03-03',(SELECT id FROM aliments WHERE code='ALM-001'),NULL,NULL,2.5,NULL),
  ('DST-008','2026-03-03',(SELECT id FROM aliments WHERE code='ALM-005'),NULL,NULL,0.5,NULL);


CREATE TABLE evenements (
  id           SERIAL PRIMARY KEY,
  type_event   VARCHAR(30)   NOT NULL,
  lapin_id     INT           REFERENCES lapins(id),
  cage_id      INT           REFERENCES cages(id),
  titre        VARCHAR(200)  NOT NULL,
  description  TEXT,
  montant      DECIMAL(12,2),
  date_event   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cree_par     INT           REFERENCES utilisateurs(id)
);

CREATE INDEX idx_event_type  ON evenements(type_event);
CREATE INDEX idx_event_date  ON evenements(date_event);
CREATE INDEX idx_event_lapin ON evenements(lapin_id);

INSERT INTO evenements
  (type_event, lapin_id, cage_id, titre, description, montant, date_event) VALUES
  ('naissance',
    (SELECT id FROM lapins WHERE tag='LP-2023-005'),
    (SELECT id FROM cages WHERE code='C-01'),
    'Naissance LIT-002 · 5 lapereaux · Cleo',
    'ACC-002 · 5 lapereaux vivants, sevrage en cours',
    NULL,'2026-02-10 10:30:00'),
  ('vente',
    (SELECT id FROM lapins WHERE tag='LP-2024-002'),NULL,
    'Vente · Petit Paul LP-2024-002',
    'Vendu a un particulier',
    45000,'2026-03-05 09:15:00'),
  ('pesee',
    (SELECT id FROM lapins WHERE tag='LP-2023-001'),
    (SELECT id FROM cages WHERE code='A-01'),
    'Pesee · Atlas · 4.80 kg',
    NULL,NULL,'2026-03-04 14:00:00'),
  ('traitement',
    (SELECT id FROM lapins WHERE tag='LP-2024-009'),
    (SELECT id FROM cages WHERE code='A-07'),
    'Traitement · Choco · Trimethoprime',
    'Coccidiose en cours',
    NULL,'2026-03-04 11:00:00'),
  ('transfert',
    (SELECT id FROM lapins WHERE tag='LP-2023-002'),
    (SELECT id FROM cages WHERE code='B-02'),
    'Transfert · Luna vers Cage B-02',
    'Mise en cage maternite gestation',
    NULL,'2026-03-03 08:00:00'),
  ('accouplement',
    (SELECT id FROM lapins WHERE tag='LP-2023-001'),NULL,
    'Accouplement ACC-007 · Atlas x Bella',
    NULL,NULL,'2026-03-03 07:30:00'),
  ('deces',NULL,NULL,
    'Deces · 1 lapereau portee LIT-001',
    '1 mort-ne sur 6 · ACC-001',
    NULL,'2026-01-01 12:00:00'),
  ('naissance',
    (SELECT id FROM lapins WHERE tag='LP-2023-002'),
    (SELECT id FROM cages WHERE code='C-01'),
    'Naissance LIT-001 · 6 lapereaux · Luna',
    'ACC-001 · 6 lapereaux vivants',
    NULL,'2026-01-01 08:00:00'),
  ('vente',
    (SELECT id FROM lapins WHERE tag='LP-2024-002'),NULL,
    'Vente · Biscotte LP-2024-001',
    'Vendu a un eleveur',
    38000,'2026-02-15 10:00:00'),
  ('pesee',
    (SELECT id FROM lapins WHERE tag='LP-2023-004'),
    (SELECT id FROM cages WHERE code='A-02'),
    'Pesee · Rex · 3.60 kg',
    NULL,NULL,'2025-12-20 09:00:00');



-- Vue lapins : expose race_id et cage_id pour les updates
CREATE OR REPLACE VIEW v_lapins AS
  SELECT
    l.id,
    l.tag,
    l.nom,
    l.sexe,
    r.nom        AS race,
    l.race_id,
    l.date_naissance,
    c.code       AS cage,
    l.cage_id,
    l.poids_actuel,
    l.statut,
    m.tag        AS tag_mere,
    m.nom        AS nom_mere,
    p.tag        AS tag_pere,
    p.nom        AS nom_pere,
    l.notes,
    l.cree_le
  FROM lapins l
  LEFT JOIN races  r ON l.race_id = r.id
  LEFT JOIN cages  c ON l.cage_id = c.id
  LEFT JOIN lapins m ON l.mere_id = m.id
  LEFT JOIN lapins p ON l.pere_id = p.id;


-- Vue stocks : expose aliment_id pour la route /stocks/restock
CREATE OR REPLACE VIEW v_alertes_stock AS
  SELECT
    s.id,
    s.aliment_id,
    a.code           AS code_aliment,
    a.nom,
    a.type_aliment,
    s.quantite,
    a.unite,
    s.seuil_alerte,
    s.quantite_max,
    s.date_expiration,
    s.mis_a_jour,
    CASE
      WHEN s.quantite <= s.seuil_alerte * 0.6 THEN 'critique'
      WHEN s.quantite <= s.seuil_alerte        THEN 'bas'
      ELSE 'ok'
    END AS statut_stock
  FROM stocks_aliment s
  JOIN aliments a ON s.aliment_id = a.id
  ORDER BY
    CASE
      WHEN s.quantite <= s.seuil_alerte * 0.6 THEN 1
      WHEN s.quantite <= s.seuil_alerte        THEN 2
      ELSE 3
    END;


-- Vue accouplements : expose les IDs base de données des lapins
CREATE OR REPLACE VIEW v_accouplements AS
  SELECT
    ac.id,
    ac.code,
    m.id           AS male_db_id,
    m.tag          AS tag_male,
    m.nom          AS nom_male,
    f.id           AS femelle_db_id,
    f.tag          AS tag_femelle,
    f.nom          AS nom_femelle,
    ac.date_accouplement,
    ac.date_naissance_prevue,
    ac.date_naissance_reelle,
    ac.statut,
    ac.taille_portee,
    ac.notes,
    ac.cree_le
  FROM accouplements ac
  JOIN lapins m ON ac.male_id    = m.id
  JOIN lapins f ON ac.femelle_id = f.id;


-- Vue indicateurs : tous les KPIs en une seule requete
-- nb_malades est inclus (utilise par statistics.js)
CREATE OR REPLACE VIEW v_indicateurs AS
  SELECT
    (SELECT COUNT(*) FROM lapins WHERE statut NOT IN ('vendu','mort'))              AS total_actifs,
    (SELECT COUNT(*) FROM lapins WHERE sexe='M' AND statut NOT IN ('vendu','mort')) AS total_males,
    (SELECT COUNT(*) FROM lapins WHERE sexe='F' AND statut NOT IN ('vendu','mort')) AS total_femelles,
    (SELECT COUNT(*) FROM lapins WHERE statut = 'gestante')                         AS nb_gestantes,
    (SELECT COUNT(*) FROM lapins WHERE statut = 'allaitante')                       AS nb_allaitantes,
    (SELECT COUNT(*) FROM lapins WHERE statut = 'malade')                           AS nb_malades,
    (SELECT COUNT(*) FROM accouplements WHERE statut = 'en_attente')                AS naissances_attendues,
    (SELECT ROUND(AVG(nb_nes),1) FROM mise_bas WHERE nb_nes > 0)                   AS taille_portee_moy,
    (SELECT COUNT(*) FROM suivis_sante WHERE statut = 'en_retard')                  AS vaccins_en_retard,
    (SELECT COUNT(*) FROM suivis_sante WHERE statut = 'en_cours')                   AS traitements_en_cours,
    (SELECT COUNT(*) FROM stocks_aliment s WHERE s.quantite <= s.seuil_alerte)      AS stocks_alertes;
