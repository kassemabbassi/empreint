const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

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

app.listen(3000, () => {
    console.log('API démarrée sur port 3000');
});