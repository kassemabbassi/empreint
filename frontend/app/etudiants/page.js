'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../dashboard.css';

export default function Etudiants() {
    const router = useRouter();
    const [etudiants, setEtudiants] = useState([]);
    const [classes, setClasses] = useState([]);
    const [form, setForm] = useState({ nom: '', prenom: '', id_classe: '' });
    const [message, setMessage] = useState(null); // { texte, type, empreinte_id }
    const [loading, setLoading] = useState(false);
    const [enseignant, setEnseignant] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem('enseignant');
        if (!data) {
            router.push('/login');
            return;
        }
        setEnseignant(JSON.parse(data));
        chargerEtudiants();
        chargerClasses();
    }, []);

    const chargerEtudiants = async () => {
        try {
            const res = await fetch('http://localhost:3000/etudiants');
            const data = await res.json();
            if (!data.erreur) setEtudiants(data);
        } catch {
            console.log('Erreur chargement étudiants');
        }
    };

    const chargerClasses = async () => {
        try {
            const res = await fetch('http://localhost:3000/infos');
            const data = await res.json();
            setClasses(data.classes || []);
        } catch {
            console.log('Erreur chargement classes');
        }
    };

    const ajouterEtudiant = async () => {
        if (!form.nom.trim() || !form.prenom.trim() || !form.id_classe) {
            setMessage({ texte: 'Veuillez remplir tous les champs.', type: 'erreur' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/etudiants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();

            if (data.erreur) {
                setMessage({ texte: 'Erreur : ' + data.erreur, type: 'erreur' });
            } else {
                setMessage({
                    texte: `${form.prenom} ${form.nom} ajouté avec succès !`,
                    type: 'succes',
                    empreinte_id: data.empreinte_id
                });
                setForm({ nom: '', prenom: '', id_classe: '' });
                chargerEtudiants();
            }
        } catch {
            setMessage({ texte: 'Erreur : serveur non disponible.', type: 'erreur' });
        } finally {
            setLoading(false);
        }
    };

    const supprimerEtudiant = async (id, nom, prenom) => {
        if (!confirm(`Supprimer ${prenom} ${nom} ?`)) return;

        try {
            const res = await fetch(`http://localhost:3000/etudiants/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                chargerEtudiants();
            } else {
                alert('Erreur suppression : ' + data.erreur);
            }
        } catch {
            alert('Erreur réseau');
        }
    };

    if (!enseignant) return null;

    return (
        <div>
            {/* Header */}
            <div className="header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px' }}>←</a>
                    <h1>Gestion des Étudiants</h1>
                </div>
                <span style={{ fontSize: '14px' }}>👤 {enseignant.prenom} {enseignant.nom}</span>
            </div>

            <div className="container">

                {/* Bannière Arduino — s'affiche après un ajout réussi */}
                {message?.type === 'succes' && message?.empreinte_id && (
                    <div style={{
                        backgroundColor: '#1a56db',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '20px 28px',
                        marginBottom: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 4px 16px rgba(26,86,219,0.3)'
                    }}>
                        <span style={{ fontSize: '36px' }}>🖐</span>
                        <div>
                            <p style={{ fontWeight: '700', fontSize: '17px', marginBottom: '4px' }}>
                                {message.texte}
                            </p>
                            <p style={{ fontSize: '15px', opacity: '0.9' }}>
                                ⚠️ Action requise : téléversez <strong>enroll.ino</strong> sur l'Arduino,
                                puis entrez l'ID <strong style={{
                                    backgroundColor: 'rgba(255,255,255,0.25)',
                                    padding: '2px 10px',
                                    borderRadius: '6px',
                                    fontSize: '18px'
                                }}>#{message.empreinte_id}</strong> et demandez à l'étudiant de poser son doigt.
                            </p>
                        </div>
                        <button
                            onClick={() => setMessage(null)}
                            style={{
                                marginLeft: 'auto',
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            ✕ Fermer
                        </button>
                    </div>
                )}

                {/* Formulaire d'ajout */}
                <div className="card">
                    <h2>Ajouter un étudiant</h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nom</label>
                            <input
                                type="text"
                                placeholder="Ex: Bounenni"
                                value={form.nom}
                                onChange={e => setForm({ ...form, nom: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Prénom</label>
                            <input
                                type="text"
                                placeholder="Ex: Rayhane"
                                value={form.prenom}
                                onChange={e => setForm({ ...form, prenom: e.target.value })}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Classe</label>
                            <select
                                value={form.id_classe}
                                onChange={e => setForm({ ...form, id_classe: e.target.value })}
                            >
                                <option value="">-- Choisir une classe --</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nom}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={ajouterEtudiant}
                        disabled={loading}
                        style={{ opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Enregistrement...' : '+ Ajouter l\'étudiant'}
                    </button>

                    {/* Message erreur */}
                    {message?.type === 'erreur' && (
                        <div className="message-error">{message.texte}</div>
                    )}
                </div>

                {/* Tableau des étudiants */}
                <div className="card">
                    <h2>
                        Liste des étudiants
                        <span style={{
                            marginLeft: '12px',
                            backgroundColor: '#e8f0fe',
                            color: '#1a56db',
                            fontSize: '13px',
                            fontWeight: '600',
                            padding: '2px 10px',
                            borderRadius: '20px'
                        }}>
                            {etudiants.length} étudiant{etudiants.length !== 1 ? 's' : ''}
                        </span>
                    </h2>

                    <div className="table-container">
                        {etudiants.length === 0 ? (
                            <p className="empty-message">Aucun étudiant enregistré.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID Capteur</th>
                                        <th>Nom</th>
                                        <th>Prénom</th>
                                        <th>Classe</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {etudiants.map(e => (
                                        <tr key={e.id}>
                                            <td>
                                                <span style={{
                                                    backgroundColor: '#e8f0fe',
                                                    color: '#1a56db',
                                                    fontWeight: '700',
                                                    padding: '3px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '13px'
                                                }}>
                                                    #{e.empreinte_id}
                                                </span>
                                            </td>
                                            <td>{e.nom}</td>
                                            <td>{e.prenom}</td>
                                            <td>{e.classe_nom}</td>
                                            <td>
                                                <button
                                                    onClick={() => supprimerEtudiant(e.id, e.nom, e.prenom)}
                                                    style={{
                                                        backgroundColor: '#fef2f2',
                                                        color: '#991b1b',
                                                        border: '1px solid #fca5a5',
                                                        padding: '5px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    🗑 Supprimer
                                                </button>
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
