#include <Adafruit_Fingerprint.h>

#define mySerial Serial1

Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

void setup() {
  Serial.begin(9600);
  while (!Serial);
  delay(100);

  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("Capteur trouvé - début du reset...");
  } else {
    Serial.println("Capteur NON trouvé");
    while (1);
  }

  // Effacer toutes les empreintes
  int p = finger.emptyDatabase();
  
  if (p == FINGERPRINT_OK) {
    Serial.println("Toutes les empreintes effacées !");
    Serial.println("Tu peux maintenant uploader le code d'enrôlement");
  } else {
    Serial.println("Erreur lors du reset");
  }
}

void loop() {}