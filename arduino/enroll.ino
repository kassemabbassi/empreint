#include <Adafruit_Fingerprint.h>

#define mySerial Serial1

Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

uint8_t id = 1; // commence à 1, s'incrémente automatiquement

void setup() {
  Serial.begin(9600);
  while (!Serial);
  delay(100);

  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("Capteur trouvé !");
  } else {
    Serial.println("Capteur NON trouvé - vérifier les connexions");
    while (1);
  }
}

void loop() {
  Serial.print("\n--- Enrôlement étudiant ID #");
  Serial.println(id);
  Serial.println("Pose ton doigt sur le capteur...");

  if (getFingerprintEnroll()) {
    Serial.print("Étudiant ID #");
    Serial.print(id);
    Serial.println(" enregistré avec succès !");
    id++; // passer au prochain étudiant
    Serial.println("Attente 3 secondes avant le prochain...");
    delay(3000);
  }
}

uint8_t getFingerprintEnroll() {
  int p = -1;

  // Première capture
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_OK) Serial.println("Image 1 capturée");
    else if (p == FINGERPRINT_NOFINGER) Serial.print(".");
    else Serial.println("Erreur capture");
  }

  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) {
    Serial.println("Erreur traitement image 1");
    return false;
  }

  Serial.println("Retire le doigt...");
  delay(2000);
  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
  }

  // Deuxième capture
  Serial.println("Pose le même doigt à nouveau...");
  p = -1;
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_OK) Serial.println("Image 2 capturée");
    else if (p == FINGERPRINT_NOFINGER) Serial.print(".");
  }

  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) {
    Serial.println("Erreur traitement image 2");
    return false;
  }

  // Créer et sauvegarder le modèle
  p = finger.createModel();
  if (p != FINGERPRINT_OK) {
    Serial.println("Les empreintes ne correspondent pas - recommence");
    return false;
  }

  p = finger.storeModel(id);
  if (p != FINGERPRINT_OK) {
    Serial.println("Erreur sauvegarde");
    return false;
  }

  return true;
}