'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './dashboard.css';

export default function Home() {
    const router = useRouter();
    const [enseignant, setEnseignant] = useState(null);
    const [infos, setInfos] = useState({ matieres: [], classes: [] });
    const [seances, setSeances] = useState([]);
    const [form, setForm] = useState({
        id_matiere: '',
        id_classe: '',
        date: '',
        heure_debut: '',
        heure_fin: ''
    });
    const [message, setMessage] = useState({ texte: '', type: '' });

    useEffect(() => {
        // Vérifier si l'enseignant est connecté
        const data = localStorage.getItem('enseignant');
        if (!data) {
            router.push('/login');
            return;
        }
        const ens = JSON.parse(data);
        setEnseignant(ens);
        chargerInfos();
        chargerSeances(ens.id);
    }, []);

    const chargerInfos = async () => {
        const res = await fetch('http://localhost:3000/infos');
        const data = await res.json();
        setInfos({ matieres: data.matieres, classes: data.classes });
    };

    const chargerSeances = async (id_enseignant) => {
        const res = await fetch(`http://localhost:3000/seances?id_enseignant=${id_enseignant}`);
        const data = await res.json();
        setSeances(data);
    };

    const creerSeance = async () => {
        if (!form.id_matiere || !form.id_classe ||
            !form.date || !form.heure_debut || !form.heure_fin) {
            setMessage({ texte: 'Remplis tous les champs', type: 'erreur' });
            return;
        }

        const res = await fetch('http://localhost:3000/seances/creer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                id_enseignant: enseignant.id,
                id_matiere: form.id_matiere
            })
        });

        const data = await res.json();

        if (data.erreur) {
            setMessage({ texte: 'Erreur: ' + data.erreur, type: 'erreur' });
        } else {
            setMessage({ texte: 'Séance créée avec succès !', type: 'succes' });
            chargerSeances(enseignant.id);
        }
    };

    const deconnexion = () => {
        localStorage.removeItem('enseignant');
        router.push('/login');
    };

    if (!enseignant) return null;

    return (
        <div>
            {/* Header */}
            <div className="header" style={{ justifyContent: 'space-between' }}>
                <h1>Système de Gestion des Présences</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <a
                        href="/etudiants"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.4)',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        👥 Gérer les étudiants
                    </a>
                    <span style={{ fontSize: '14px' }}>
                        👤 {enseignant.prenom} {enseignant.nom}
                    </span>
                    <button
                        onClick={deconnexion}
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.4)',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        Déconnexion
                    </button>
                </div>
            </div>

            <div className="container">

                {/* Formulaire */}
                <div className="card">
                    <h2>Créer une nouvelle séance</h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Matière</label>
                            <select onChange={e => setForm({ ...form, id_matiere: e.target.value })}>
                                <option value="">-- Choisir --</option>
                                {infos.matieres.map(m => (
                                    <option key={m.id} value={m.id}>{m.nom}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Classe</label>
                            <select onChange={e => setForm({ ...form, id_classe: e.target.value })}>
                                <option value="">-- Choisir --</option>
                                {infos.classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nom}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Heure début</label>
                            <input
                                type="time"
                                onChange={e => setForm({ ...form, heure_debut: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Heure fin</label>
                            <input
                                type="time"
                                onChange={e => setForm({ ...form, heure_fin: e.target.value })}
                            />
                        </div>
                    </div>

                    <button className="btn-primary" onClick={creerSeance}>
                        Créer la séance
                    </button>

                    {message.texte && (
                        <div className={message.type === 'succes' ? 'message-success' : 'message-error'}>
                            {message.texte}
                        </div>
                    )}
                </div>

                {/* Tableau séances */}
                <div className="card">
                    <h2>Mes séances</h2>
                    <div className="table-container">
                        {seances.length === 0 ? (
                            <p className="empty-message">Aucune séance pour le moment</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Matière</th>
                                        <th>Classe</th>
                                        <th>Début</th>
                                        <th>Fin</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {seances.map(s => (
                                        <tr key={s.id}>
                                            <td>{new Date(s.date).toLocaleDateString()}</td>
                                            <td>{s.matiere}</td>
                                            <td>{s.classe}</td>
                                            <td>{s.heure_debut}</td>
                                            <td>{s.heure_fin}</td>
                                            <td>
                                                <a href={`/seance/${s.id}`} className="btn-voir">
                                                    Voir
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}