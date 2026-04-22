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
