#include <Adafruit_Fingerprint.h>

#define mySerial Serial1

Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

uint8_t id = 0; // 0 = en attente de l'ID depuis le PC

void setup() {
  Serial.begin(9600);
  while (!Serial);
  delay(100);

  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("CAPTEUR_OK");
    Serial.println("En attente de commande ENROLL:<id>...");
  } else {
    Serial.println("CAPTEUR_ERREUR");
    while (1);
  }
}

void loop() {

  // Attendre la commande ENROLL:<id> depuis Python/PC
  if (id == 0) {
    if (Serial.available()) {
      String cmd = Serial.readStringUntil('\n');
      cmd.trim();

      if (cmd.startsWith("ENROLL:")) {
        id = (uint8_t) cmd.substring(7).toInt();

        if (id == 0) {
          Serial.println("ERREUR:ID invalide (0 non autorisé)");
          return;
        }

        Serial.print("PRET:");
        Serial.println(id);
        Serial.println("Pose ton doigt sur le capteur...");
      }
    }
    return; // rien à faire tant qu'on n'a pas reçu l'ID
  }

  // Lancer l'enrôlement avec l'ID reçu
  if (getFingerprintEnroll()) {
    Serial.print("ENROLLED:");
    Serial.println(id);
    id = 0; // reset — prêt pour le prochain étudiant
    Serial.println("En attente de commande ENROLL:<id>...");
  }
}

uint8_t getFingerprintEnroll() {
  int p = -1;

  // ---- Première capture ----
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_OK)       Serial.println("IMAGE1_OK");
    else if (p == FINGERPRINT_NOFINGER) Serial.print(".");
    else { Serial.println("ERREUR:capture 1"); return false; }
  }

  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) {
    Serial.println("ERREUR:traitement image 1");
    return false;
  }

  Serial.println("RETIRE_DOIGT");
  delay(2000);
  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
  }

  // ---- Deuxième capture ----
  Serial.println("POSE_DOIGT_2");
  p = -1;
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_OK)       Serial.println("IMAGE2_OK");
    else if (p == FINGERPRINT_NOFINGER) Serial.print(".");
  }

  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) {
    Serial.println("ERREUR:traitement image 2");
    return false;
  }

  // ---- Créer et sauvegarder le modèle ----
  p = finger.createModel();
  if (p != FINGERPRINT_OK) {
    Serial.println("ERREUR:empreintes non identiques - recommence");
    id = 0;
    return false;
  }

  p = finger.storeModel(id);
  if (p != FINGERPRINT_OK) {
    Serial.println("ERREUR:sauvegarde échouée");
    return false;
  }

  return true;
}