#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>

#ifdef min
#undef min
#endif
#ifdef max
#undef max
#endif

#include <M5StickCPlus2.h>
#include <WiFi.h>
#include <ArduinoJson.h>

AsyncWebServer server(80);
bool modoAuto = false;
bool bombaActiva = false;
int humedadFalsa = 45; // valor simulado

void setup() {
  auto cfg = M5.config();
  M5.begin(cfg);
  M5.Lcd.setRotation(3);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setTextColor(WHITE);
  M5.Lcd.setTextSize(2);

  M5.Lcd.setCursor(0, 0);
  M5.Lcd.println("Iniciando...");

  // Crear Access Point
  WiFi.mode(WIFI_AP);
  bool apOk = WiFi.softAP("Maceta-IoT", "12345678");

  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(0, 0);
  if (apOk) {
    M5.Lcd.println("WiFi OK!");
    M5.Lcd.println(WiFi.softAPIP());
  } else {
    M5.Lcd.println("WiFi FALLO");
  }

  // CORS
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "Content-Type");

  // GET /status
  server.on("/status", HTTP_GET, [](AsyncWebServerRequest *req) {
    // Simula que la humedad baja con el tiempo
    humedadFalsa = random(30, 80);
    
    StaticJsonDocument<200> doc;
    doc["humedad"] = humedadFalsa;
    doc["bomba"] = bombaActiva;
    doc["modo"] = modoAuto ? "auto" : "manual";
    String json;
    serializeJson(doc, json);
    req->send(200, "application/json", json);
  });

  // POST /pump/on
  server.on("/pump/on", HTTP_POST, [](AsyncWebServerRequest *req) {
    bombaActiva = true;
    M5.Lcd.fillScreen(BLACK);
    M5.Lcd.setCursor(0, 0);
    M5.Lcd.println("Bomba ON!");
    req->send(200, "application/json", "{\"ok\":true}");
  });

  // POST /pump/off
  server.on("/pump/off", HTTP_POST, [](AsyncWebServerRequest *req) {
    bombaActiva = false;
    M5.Lcd.fillScreen(BLACK);
    M5.Lcd.setCursor(0, 0);
    M5.Lcd.println("Bomba OFF");
    req->send(200, "application/json", "{\"ok\":true}");
  });

  // POST /mode
  server.on("/mode", HTTP_POST,
    [](AsyncWebServerRequest *req){},
    NULL,
    [](AsyncWebServerRequest *req, uint8_t *data, size_t len, size_t index, size_t total) {
      StaticJsonDocument<100> doc;
      deserializeJson(doc, data, len);
      String modo = doc["modo"].as<String>();
      modoAuto = (modo == "auto");
      req->send(200, "application/json", "{\"ok\":true}");
    }
  );
  
  // GET /hola
server.on("/hola", HTTP_GET, [](AsyncWebServerRequest *req) {
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(0, 0);
  M5.Lcd.println("Alguien");
  M5.Lcd.println("entro a");
  M5.Lcd.println("/hola !");
  req->send(200, "text/plain", "Mensaje mostrado en pantalla!");
});

server.on("/mensaje", HTTP_GET, [](AsyncWebServerRequest *req) {
  if (req->hasParam("texto")) {
    String texto = req->getParam("texto")->value();
    M5.Lcd.fillScreen(BLACK);
    M5.Lcd.setCursor(0, 0);
    M5.Lcd.println(texto);
    delay(2000);
  }
  req->send(200, "text/plain", "ok");
});

  
  server.begin();

  M5.Lcd.setCursor(0, 40);
  M5.Lcd.println("Servidor OK");
}

void loop() {
  M5.update();

  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(0, 0);
  M5.Lcd.printf("Hum: %d%%", humedadFalsa);
  M5.Lcd.setCursor(0, 20);
  M5.Lcd.printf("Bomba: %s", bombaActiva ? "ON" : "OFF");
  M5.Lcd.setCursor(0, 40);
  M5.Lcd.printf("Modo: %s", modoAuto ? "AUTO" : "MAN");
  M5.Lcd.setCursor(0, 60);
  M5.Lcd.println(WiFi.softAPIP());

  delay(1500);
}
