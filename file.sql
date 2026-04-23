INSERT INTO classes (nom) VALUES ('Systèmes Embarqués');


INSERT INTO matieres (nom) VALUES ('Systèmes Embarqués');


INSERT INTO enseignants (cin, nom, prenom, id_matiere) VALUES
('12345678', 'Bedoui', 'Ali', 1);


INSERT INTO etudiants (empreinte_id, nom, prenom, id_classe) VALUES
('1', 'Bounenni', 'Rayhane', 1),
('2', 'Abbassi', 'Ichrak', 1);


INSERT INTO seances (id_enseignant, id_matiere, id_classe, date, heure_debut, heure_fin)
VALUES (1, 1, 1, CURDATE(), '00:00:00', '23:59:00');


INSERT INTO presences (id_etudiant, id_seance, statut) VALUES
(1, 1, 'absent'),
(2, 1, 'absent');

SELECT
    e.nom,
    e.prenom,
    e.empreinte_id,
    p.statut,
    p.heure_pointage
FROM presences p
JOIN etudiants e ON p.id_etudiant = e.id
JOIN seances s ON p.id_seance = s.id
WHERE s.id = 1;




///code de remplsisage de base de données pour les tests

INSERT INTO classes (nom) VALUES ('Systèmes Embarqués');

INSERT INTO matieres (nom) VALUES ('Systèmes Embarqués');

INSERT INTO enseignants (cin, nom, prenom, id_matiere) VALUES
('12345678', 'Bedoui', 'Ali', 1);

INSERT INTO etudiants (empreinte_id, nom, prenom, id_classe) VALUES
('1', 'Bounenni', 'Rayhane', 1),
('2', 'Abbassi', 'Ichrak', 1);

INSERT INTO seances (id_enseignant, id_matiere, id_classe, date, heure_debut, heure_fin)
VALUES (1, 1, 1, CURDATE(), '00:00:00', '23:59:00');

INSERT INTO presences (id_etudiant, id_seance, statut) VALUES
(1, 1, 'absent'),
(2, 1, 'absent');


SELECT e.nom, e.prenom, p.statut, p.heure_pointage
FROM presences p
JOIN etudiants e ON p.id_etudiant = e.id
WHERE p.id_seance = 1;





-- ajout 2eme classe



USE gestion_presence;

-- Ajouter une deuxième classe
INSERT INTO classes (nom) VALUES ('2ème RT');

-- Ajouter une deuxième matière
INSERT INTO matieres (nom) VALUES ('Réseaux');

-- Ajouter un deuxième enseignant
INSERT INTO enseignants (cin, nom, prenom, id_matiere) VALUES
('87654321', 'Trabelsi', 'Sonia', 2);

-- Ajouter des étudiants à la deuxième classe
INSERT INTO etudiants (empreinte_id, nom, prenom, id_classe) VALUES
('3', 'Jlassi', 'Omar', 2),
('4', 'Khalil', 'Nour', 2);





--recherche complet 



-- Voir toutes les classes
SELECT * FROM classes;

-- Voir tous les enseignants avec leurs matières
SELECT e.nom, e.prenom, m.nom as matiere
FROM enseignants e
JOIN matieres m ON e.id_matiere = m.id;

-- Voir tous les étudiants avec leurs classes
SELECT e.nom, e.prenom, c.nom as classe
FROM etudiants e
JOIN classes c ON e.id_classe = c.id;