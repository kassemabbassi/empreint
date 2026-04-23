import serial
import requests
import time
import sys

# ============================================
# CONFIGURATION
PORT    = 'COM10'               # ton port COM (même que ecoute.py)
API_URL = 'http://localhost:3000'
# ============================================

def connecter_serial():
    """Connecte au port Serial de l'Arduino."""
    try:
        ser = serial.Serial(PORT, 9600, timeout=5)
        time.sleep(2)
        print(f"[OK] Connecté sur {PORT}")
        return ser
    except Exception as e:
        print(f"[ERREUR] Impossible de se connecter sur {PORT}: {e}")
        print("  → Vérifie que Arduino est branché et que le bon port COM est configuré.")
        sys.exit(1)


def attendre_ligne(ser, prefixe=None, timeout=30):
    """
    Lit les lignes du Serial jusqu'à trouver une ligne commençant par `prefixe`.
    Affiche toutes les lignes reçues. Retourne la ligne trouvée ou None si timeout.
    """
    debut = time.time()
    while time.time() - debut < timeout:
        try:
            ligne = ser.readline().decode('utf-8', errors='ignore').strip()
            if ligne:
                print(f"  Arduino: {ligne}")
                if prefixe is None or ligne.startswith(prefixe):
                    return ligne
        except Exception as e:
            print(f"  [ERREUR lecture] {e}")
            time.sleep(0.1)
    return None


def ajouter_etudiant_api(nom, prenom, id_classe):
    """Envoie POST /etudiants à l'API Node.js et retourne l'empreinte_id."""
    try:
        response = requests.post(
            f"{API_URL}/etudiants",
            json={"nom": nom, "prenom": prenom, "id_classe": id_classe},
            timeout=5
        )
        data = response.json()
        if "erreur" in data:
            print(f"[ERREUR API] {data['erreur']}")
            return None
        return data['empreinte_id']
    except requests.exceptions.ConnectionError:
        print("[ERREUR] API Node.js non disponible. Lance d'abord : node index.js")
        return None
    except Exception as e:
        print(f"[ERREUR API] {e}")
        return None


def lister_classes():
    """Récupère la liste des classes depuis l'API."""
    try:
        res = requests.get(f"{API_URL}/infos", timeout=5)
        data = res.json()
        return data.get('classes', [])
    except:
        return []


def main():
    print("=" * 50)
    print("  SCRIPT D'ENRÔLEMENT DES ÉTUDIANTS")
    print("=" * 50)
    print()

    # Vérifier que l'API est disponible
    try:
        requests.get(f"{API_URL}/infos", timeout=3)
        print("[OK] API Node.js connectée")
    except:
        print("[ERREUR] API Node.js non disponible.")
        print("  → Lance d'abord : node index.js dans le dossier /node")
        sys.exit(1)

    # Charger les classes disponibles
    classes = lister_classes()
    if not classes:
        print("[ERREUR] Aucune classe trouvée dans la base de données.")
        sys.exit(1)

    print("\nClasses disponibles :")
    for c in classes:
        print(f"  {c['id']} → {c['nom']}")

    print()
    print("─" * 50)

    # Saisie des infos étudiant
    nom      = input("Nom de l'étudiant    : ").strip()
    prenom   = input("Prénom de l'étudiant : ").strip()

    print()
    id_classe_str = input("ID de la classe      : ").strip()

    try:
        id_classe = int(id_classe_str)
    except ValueError:
        print("[ERREUR] ID classe invalide.")
        sys.exit(1)

    if not nom or not prenom:
        print("[ERREUR] Nom et prénom obligatoires.")
        sys.exit(1)

    print()
    print(f"[INFO] Enregistrement de {prenom} {nom} en base de données...")

    # Ajouter l'étudiant dans MySQL via l'API
    empreinte_id = ajouter_etudiant_api(nom, prenom, id_classe)
    if empreinte_id is None:
        print("[ERREUR] Impossible d'ajouter l'étudiant.")
        sys.exit(1)

    print(f"[OK] Étudiant ajouté — ID capteur attribué : #{empreinte_id}")
    print()
    print("─" * 50)
    print(f"INSTRUCTIONS :")
    print(f"  1. Assurez-vous que enroll.ino est téléversé sur l'Arduino")
    print(f"  2. Ce script va envoyer la commande ENROLL:{empreinte_id} à l'Arduino")
    print(f"  3. L'étudiant devra poser son doigt DEUX fois sur le capteur")
    print("─" * 50)
    input("\nAppuie sur ENTRÉE quand l'Arduino est prêt...")

    # Connecter au port Serial
    ser = connecter_serial()

    # Attendre que l'Arduino soit prêt (CAPTEUR_OK)
    print("\n[INFO] Attente de l'Arduino...")
    ligne = attendre_ligne(ser, prefixe="CAPTEUR_OK", timeout=10)
    if ligne is None:
        # Peut-être déjà prêt, on continue quand même
        print("[INFO] Arduino déjà initialisé, envoi de la commande...")

    # Envoyer la commande ENROLL:<id>
    commande = f"ENROLL:{empreinte_id}\n"
    ser.write(commande.encode('utf-8'))
    print(f"\n[INFO] Commande envoyée : ENROLL:{empreinte_id}")

    # Attendre confirmation de l'Arduino
    ligne = attendre_ligne(ser, prefixe="PRET:", timeout=5)
    if ligne is None:
        print("[ERREUR] Arduino n'a pas confirmé la réception.")
        ser.close()
        sys.exit(1)

    print(f"\n[ACTION] Demandez à {prenom} {nom} de POSER son doigt sur le capteur...")

    # Attendre l'enrôlement complet (ENROLLED:<id>)
    ligne = attendre_ligne(ser, prefixe="ENROLLED:", timeout=60)

    if ligne and ligne.startswith("ENROLLED:"):
        id_confirme = ligne.split(":")[1].strip()
        print()
        print("=" * 50)
        print(f"  ✅ ENRÔLEMENT RÉUSSI !")
        print(f"  Étudiant : {prenom} {nom}")
        print(f"  ID capteur : #{id_confirme}")
        print(f"  Maintenant, lancez ecoute.py pour les pointages.")
        print("=" * 50)
    else:
        print()
        print("[ERREUR] Enrôlement échoué ou timeout. Relancez le script.")

    ser.close()


if __name__ == "__main__":
    main()
