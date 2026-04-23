'use client';

import { useState, useEffect, use } from 'react';
import '../../dashboard.css';

export default function Dashboard({ params }) {
    const { id: id_seance } = use(params);
    const [presences, setPresences] = useState([]);
    const [seance, setSeance] = useState(null);

    useEffect(() => {
        chargerPresences();
        chargerSeance();

        const interval = setInterval(() => {
            chargerPresences();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const chargerPresences = async () => {
        const res = await fetch(`http://localhost:3000/presences/${id_seance}`);
        const data = await res.json();
        setPresences(data);
    };

    const chargerSeance = async () => {
        const res = await fetch(`http://localhost:3000/seances/${id_seance}`);
        const data = await res.json();
        setSeance(data);
    };

    const presents = presences.filter(p => p.statut === 'present').length;
    const absents = presences.filter(p => p.statut === 'absent').length;
    const retards = presences.filter(p => p.statut === 'retard').length;

    const couleurStatut = (statut) => {
        if (statut === 'present') return '#166534';
        if (statut === 'retard') return '#92400e';
        return '#991b1b';
    };

    const bgStatut = (statut) => {
        if (statut === 'present') return '#f0fdf4';
        if (statut === 'retard') return '#fffbeb';
        return '#fef2f2';
    };

    return (
        <div>
            <div className="header">
                <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px' }}>←</a>
                <h1>Dashboard Présences</h1>
            </div>

            <div className="container">

                {seance && (
                    <div className="card">
                        <h2>Informations de la séance</h2>
                        <div className="form-grid">
                            <div>
                                <span style={{ fontSize: '13px', color: '#4a5568', fontWeight: '600' }}>ENSEIGNANT</span>
                                <p style={{ marginTop: '4px' }}>{seance.enseignant_prenom} {seance.enseignant_nom}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '13px', color: '#4a5568', fontWeight: '600' }}>MATIÈRE</span>
                                <p style={{ marginTop: '4px' }}>{seance.matiere}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '13px', color: '#4a5568', fontWeight: '600' }}>CLASSE</span>
                                <p style={{ marginTop: '4px' }}>{seance.classe}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '13px', color: '#4a5568', fontWeight: '600' }}>DATE</span>
                                <p style={{ marginTop: '4px' }}>{new Date(seance.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '13px', color: '#4a5568', fontWeight: '600' }}>HEURE DÉBUT</span>
                                <p style={{ marginTop: '4px' }}>{seance.heure_debut}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '13px', color: '#4a5568', fontWeight: '600' }}>HEURE FIN</span>
                                <p style={{ marginTop: '4px' }}>{seance.heure_fin}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                    <div className="card" style={{ textAlign: 'center', marginBottom: '0' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#166534', textTransform: 'uppercase' }}>Présents</p>
                        <p style={{ fontSize: '42px', fontWeight: '700', color: '#166534' }}>{presents}</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', marginBottom: '0' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#991b1b', textTransform: 'uppercase' }}>Absents</p>
                        <p style={{ fontSize: '42px', fontWeight: '700', color: '#991b1b' }}>{absents}</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', marginBottom: '0' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', textTransform: 'uppercase' }}>Retards</p>
                        <p style={{ fontSize: '42px', fontWeight: '700', color: '#92400e' }}>{retards}</p>
                    </div>
                </div>

                <div className="card">
                    <h2>Liste des étudiants</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Prénom</th>
                                    <th>Statut</th>
                                    <th>Heure pointage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {presences.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.nom}</td>
                                        <td>{p.prenom}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: couleurStatut(p.statut),
                                                backgroundColor: bgStatut(p.statut)
                                            }}>
                                                {p.statut}
                                            </span>
                                        </td>
                                        <td>{p.heure_pointage || '--'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}