#include <Adafruit_Fingerprint.h>

#define mySerial Serial1

Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

void setup() {
  Serial.begin(9600);
  while (!Serial);
  delay(100);

  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("CAPTEUR_OK");
  } else {
    Serial.println("CAPTEUR_ERREUR");
    while (1);
  }
}

void loop() {
  int id = getFingerprintID();

  if (id > 0) {
    // Envoyer l'ID au PC via USB
    Serial.print("EMPREINTE:");
    Serial.println(id);

    // Attendre la réponse du PC max 5 secondes
    unsigned long debut = millis();
    String reponse = "";

    while (millis() - debut < 5000) {
      if (Serial.available()) {
        reponse = Serial.readStringUntil('\n');
        reponse.trim();
        break;
      }
    }

    if (reponse != "") {
      Serial.println("REPONSE:" + reponse);
    } else {
      Serial.println("REPONSE:timeout");
    }

    delay(2000);
  }

  delay(100);
}

int getFingerprintID() {
  int p = finger.getImage();

  if (p == FINGERPRINT_NOFINGER) return -1;
  if (p != FINGERPRINT_OK) return -1;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) return -1;

  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) return finger.fingerID;
  if (p == FINGERPRINT_NOTFOUND) {
    Serial.println("ERREUR:empreinte inconnue");
    return -1;
  }

  return -1;
}