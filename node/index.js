const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());

// Connexion MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12727455kassem',  // ← change ici
    database: 'gestion_presence'
});

db.connect((err) => {
    if (err) {
        console.log('Erreur connexion MySQL:', err.message);
        return;
    }
    console.log('MySQL connecté !');
});

// Route principale
app.post('/pointage', (req, res) => {
    const { empreinte_id, id_seance } = req.body;
    console.log(`Pointage reçu - empreinte: ${empreinte_id}, séance: ${id_seance}`);

    // Étape 1 : vérifier si l'étudiant existe
    db.query(
        'SELECT * FROM etudiants WHERE empreinte_id = ?',
        [empreinte_id],
        (err, etudiants) => {
            if (err) {
                console.log('Erreur SQL:', err.message);
                return res.json({ erreur: 'erreur base de données' });
            }

            if (etudiants.length === 0) {
                console.log('Étudiant non trouvé');
                return res.json({ erreur: 'étudiant non trouvé' });
            }

            const etudiant = etudiants[0];
            console.log(`Étudiant trouvé: ${etudiant.prenom} ${etudiant.nom}`);

            // Étape 2 : récupérer l'heure de début de séance
            db.query(
                'SELECT heure_debut FROM seances WHERE id = ?',
                [id_seance],
                (err, seances) => {
                    if (err || seances.length === 0) {
                        return res.json({ erreur: 'séance non trouvée' });
                    }

                    const heureDebut = seances[0].heure_debut;
                    const maintenant = new Date();
                    const heureActuelle = maintenant.toTimeString().split(' ')[0];

                    // Étape 3 : calculer le statut
                    const statut = heureActuelle <= heureDebut ? 'present' : 'retard';
                    console.log(`Statut: ${statut} - pointage: ${heureActuelle} - début: ${heureDebut}`);

                    // Étape 4 : mettre à jour la présence
                    db.query(
                        `UPDATE presences SET statut = ?, heure_pointage = ?
                         WHERE id_etudiant = ? AND id_seance = ?`,
                        [statut, heureActuelle, etudiant.id, id_seance],
                        (err) => {
                            if (err) {
                                console.log('Erreur UPDATE:', err.message);
                                return res.json({ erreur: 'erreur mise à jour' });
                            }

                            console.log('Présence mise à jour !');

                            // Étape 5 : répondre à Python
                            res.json({
                                statut: statut,
                                nom: etudiant.nom,
                                prenom: etudiant.prenom
                            });
                        }
                    );
                }
            );
        }
    );
});
// Créer une nouvelle séance
app.post('/seances/creer', (req, res) => {
    const { id_enseignant, id_matiere, id_classe, date, heure_debut, heure_fin } = req.body;

    console.log('Création séance:', req.body);

    db.query(
        `INSERT INTO seances (id_enseignant, id_matiere, id_classe, date, heure_debut, heure_fin)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id_enseignant, id_matiere, id_classe, date, heure_debut, heure_fin],
        (err, result) => {
            if (err) {
                console.log('Erreur création séance:', err.message);
                return res.json({ erreur: err.message });
            }

            const id_seance = result.insertId;
            console.log('Séance créée avec ID:', id_seance);

            // Insérer automatiquement tous les étudiants de la classe comme absents
            db.query(
                `INSERT INTO presences (id_etudiant, id_seance, statut)
                 SELECT id, ?, 'absent' FROM etudiants WHERE id_classe = ?`,
                [id_seance, id_classe],
                (err) => {
                    if (err) {
                        console.log('Erreur insertion présences:', err.message);
                        return res.json({ erreur: err.message });
                    }

                    console.log('Présences initiales créées');
                    res.json({ 
                        message: 'Séance créée avec succès',
                        id_seance: id_seance
                    });
                }
            );
        }
    );
});


// Récupérer la liste des séances
app.get('/seances', (req, res) => {
    const { id_enseignant } = req.query;

    let query = `
        SELECT s.id, s.date, s.heure_debut, s.heure_fin,
               e.nom as enseignant_nom, e.prenom as enseignant_prenom,
               m.nom as matiere, c.nom as classe
        FROM seances s
        JOIN enseignants e ON s.id_enseignant = e.id
        JOIN matieres m ON s.id_matiere = m.id
        JOIN classes c ON s.id_classe = c.id
    `;

    if (id_enseignant) {
        query += ` WHERE s.id_enseignant = ${db.escape(id_enseignant)}`;
    }

    query += ` ORDER BY s.date DESC, s.heure_debut DESC`;

    db.query(query, (err, seances) => {
        if (err) return res.json({ erreur: err.message });
        res.json(seances);
    });
});


// Récupérer enseignants, matières et classes pour le formulaire
app.get('/infos', (req, res) => {
    db.query('SELECT * FROM enseignants', (err, enseignants) => {
        if (err) return res.json({ erreur: err.message });

        db.query('SELECT * FROM matieres', (err, matieres) => {
            if (err) return res.json({ erreur: err.message });

            db.query('SELECT * FROM classes', (err, classes) => {
                if (err) return res.json({ erreur: err.message });

                res.json({ enseignants, matieres, classes });
            });
        });
    });
});


// Récupérer les présences d'une séance
app.get('/presences/:id_seance', (req, res) => {
    const { id_seance } = req.params;

    db.query(
        `SELECT
            e.id,
            e.nom,
            e.prenom,
            p.statut,
            p.heure_pointage
         FROM presences p
         JOIN etudiants e ON p.id_etudiant = e.id
         WHERE p.id_seance = ?
         ORDER BY e.nom ASC`,
        [id_seance],
        (err, presences) => {
            if (err) {
                return res.json({ erreur: err.message });
            }
            res.json(presences);
        }
    );
});


// Récupérer les infos d'une séance
app.get('/seances/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT s.*, 
                e.nom as enseignant_nom, e.prenom as enseignant_prenom,
                m.nom as matiere, c.nom as classe
         FROM seances s
         JOIN enseignants e ON s.id_enseignant = e.id
         JOIN matieres m ON s.id_matiere = m.id
         JOIN classes c ON s.id_classe = c.id
         WHERE s.id = ?`,
        [id],
        (err, result) => {
            if (err) return res.json({ erreur: err.message });
            res.json(result[0]);
        }
    );
});


// Connexion enseignant
app.post('/login', (req, res) => {
    const { cin, mot_de_passe } = req.body;

    console.log('Tentative connexion:', cin);

    db.query(
        'SELECT * FROM enseignants WHERE cin = ? AND mot_de_passe = ?',
        [cin, mot_de_passe],
        (err, results) => {
            if (err) {
                return res.json({ erreur: err.message });
            }

            if (results.length === 0) {
                return res.json({ erreur: 'CIN ou mot de passe incorrect' });
            }

            const enseignant = results[0];
            console.log('Connexion réussie:', enseignant.prenom, enseignant.nom);

            res.json({
                success: true,
                enseignant: {
                    id: enseignant.id,
                    nom: enseignant.nom,
                    prenom: enseignant.prenom,
                    cin: enseignant.cin
                }
            });
        }
    );
});

app.listen(3000, () => {
    console.log('API démarrée sur port 3000');
});