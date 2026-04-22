-- Vider les tables liées aux présences
DELETE FROM presences;
DELETE FROM seances;
DELETE FROM etudiants;
DELETE FROM enseignants;
DELETE FROM matieres;
DELETE FROM classes;

-- Remettre les IDs à zéro
ALTER TABLE presences AUTO_INCREMENT = 1;
ALTER TABLE seances AUTO_INCREMENT = 1;
ALTER TABLE etudiants AUTO_INCREMENT = 1;
ALTER TABLE enseignants AUTO_INCREMENT = 1;
ALTER TABLE matieres AUTO_INCREMENT = 1;
ALTER TABLE classes AUTO_INCREMENT = 1;