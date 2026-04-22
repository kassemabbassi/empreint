import serial
import requests
import time

# ============================================
# CONFIGURATION
PORT = 'COM10'         # ton port COM
ID_SEANCE = 1          # l'ID de la séance en cours
# ============================================

API_URL = 'http://localhost:3000/pointage'

print("Démarrage du script d'écoute...")
print(f"Port: {PORT}")
print(f"Séance ID: {ID_SEANCE}")

# Connexion au port Serial
try:
    ser = serial.Serial(PORT, 9600, timeout=1)
    time.sleep(2)
    print(f"Connecté sur {PORT}")
except Exception as e:
    print(f"Erreur connexion port Serial: {e}")
    print("Vérifie que le bon port COM est configuré")
    exit()

print("En attente des empreintes...\n")

while True:
    try:
        ligne = ser.readline().decode('utf-8').strip()

        if not ligne:
            continue

        print(f"Arduino dit: {ligne}")

        if ligne.startswith("EMPREINTE:"):
            empreinte_id = ligne.split(":")[1].strip()
            print(f"ID reçu: {empreinte_id} - envoi à l'API...")

            try:
                response = requests.post(API_URL, json={
                    "empreinte_id": empreinte_id,
                    "id_seance": ID_SEANCE
                }, timeout=5)

                data = response.json()

                if "erreur" in data:
                    reponse_arduino = f"inconnu - {data['erreur']}"
                else:
                    reponse_arduino = f"{data['statut']} - {data['prenom']} {data['nom']}"

                print(f"Réponse API: {reponse_arduino}")
                ser.write((reponse_arduino + '\n').encode('utf-8'))

            except requests.exceptions.ConnectionError:
                print("Erreur: API Node.js non démarrée")
                ser.write(b"erreur - API non disponible\n")

            except Exception as e:
                print(f"Erreur API: {e}")
                ser.write(b"erreur - probleme serveur\n")

    except Exception as e:
        print(f"Erreur lecture Serial: {e}")
        time.sleep(1)