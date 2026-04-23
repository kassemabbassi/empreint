'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../dashboard.css';

export default function Login() {
    const router = useRouter();
    const [form, setForm] = useState({ cin: '', mot_de_passe: '' });
    const [erreur, setErreur] = useState('');

    const connexion = async () => {
        if (!form.cin || !form.mot_de_passe) {
            setErreur('Remplis tous les champs');
            return;
        }

        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });

        const data = await res.json();

        if (data.erreur) {
            setErreur(data.erreur);
        } else {
            // Sauvegarder les infos de l'enseignant
            localStorage.setItem('enseignant', JSON.stringify(data.enseignant));
            // Rediriger vers la page principale
            router.push('/');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f0f4f8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{ width: '100%', maxWidth: '420px', padding: '0 20px' }}>

                {/* Logo / Titre */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        backgroundColor: '#1a56db',
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ color: 'white', fontSize: '28px' }}>🎓</span>
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c' }}>
                        Gestion des Présences
                    </h1>
                    <p style={{ color: '#718096', marginTop: '8px', fontSize: '14px' }}>
                        Connectez-vous pour accéder à votre espace
                    </p>
                </div>

                {/* Formulaire */}
                <div className="card">
                    <h2 style={{ marginBottom: '20px' }}>Connexion</h2>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>CIN</label>
                        <input
                            type="text"
                            placeholder="Entrez votre CIN"
                            onChange={e => setForm({ ...form, cin: e.target.value })}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            placeholder="Entrez votre mot de passe"
                            onChange={e => setForm({ ...form, mot_de_passe: e.target.value })}
                        />
                    </div>

                    <button
                        className="btn-primary"
                        onClick={connexion}
                        style={{ width: '100%' }}
                    >
                        Se connecter
                    </button>

                    {erreur && (
                        <div className="message-error" style={{ marginTop: '16px' }}>
                            {erreur}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}