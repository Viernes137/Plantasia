#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <Preferences.h>

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
Preferences prefs;

bool modoAuto = false;
bool bombaActiva = false;
int humedadFalsa = 45;
bool wifiConectado = false;

// Página HTML del portal captivo
const char* portalHTML = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Maceta IoT - Setup</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: sans-serif;
      background: #1a1a2e;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    h1 { color: #2d6a4f; margin-bottom: 8px; font-size: 24px; }
    p { color: #666; margin-bottom: 24px; font-size: 14px; }
    label { display: block; font-size: 13px; color: #333; margin-bottom: 6px; font-weight: 600; }
    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 15px;
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }
    input:focus { outline: none; border-color: #2d6a4f; }
    button {
      width: 100%;
      padding: 14px;
      background: #2d6a4f;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover { background: #1b4332; }
    .emoji { font-size: 48px; text-align: center; margin-bottom: 16px; }
    #status { margin-top: 16px; text-align: center; font-size: 14px; color: #2d6a4f; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">🌱</div>
    <h1>Maceta Inteligente</h1>
    <p>Conecta tu maceta a tu red WiFi para empezar</p>
    <label>Nombre de tu WiFi (SSID)</label>
    <input type="text" id="ssid" placeholder="Mi WiFi">
    <label>Contraseña</label>
    <input type="password" id="pass" placeholder="••••••••">
    <button onclick="conectar()">Conectar</button>
    <div id="status"></div>
  </div>
  <script>
    async function conectar() {
      const ssid = document.getElementById('ssid').value;
      const pass = document.getElementById('pass').value;
      if (!ssid) { document.getElementById('status').innerText = 'Escribe el nombre del WiFi'; return; }
      document.getElementById('status').innerText = 'Conectando...';
      try {
        const res = await fetch('/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ssid, pass })
        });
        const data = await res.json();
        if (data.ok) {
          document.getElementById('status').innerText = '✅ Conectado! IP: ' + data.ip + ' — Conéctate a tu WiFi normal y entra a esa IP';
        } else {
          document.getElementById('status').innerText = '❌ No se pudo conectar, revisa la contraseña';
        }
      } catch(e) {
        document.getElementById('status').innerText = 'Error: ' + e.message;
      }
    }
  </script>
</body>
</html>
)rawliteral";

void iniciarAPPortal() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP("Maceta-IoT", "12345678");

  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setTextColor(WHITE);
  M5.Lcd.setTextSize(2);
  M5.Lcd.setCursor(0, 0);
  M5.Lcd.println("Modo Setup");
  M5.Lcd.println("WiFi:");
  M5.Lcd.println("Maceta-IoT");
  M5.Lcd.println("Pass:");
  M5.Lcd.println("12345678");
  M5.Lcd.println("192.168.4.1");

  // Sirve el portal
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *req) {
    req->send(200, "text/html", portalHTML);
  });

  // Recibe credenciales y se conecta
  server.on("/connect", HTTP_POST,
    [](AsyncWebServerRequest *req){},
    NULL,
    [](AsyncWebServerRequest *req, uint8_t *data, size_t len, size_t index, size_t total) {
      StaticJsonDocument<200> doc;
      deserializeJson(doc, data, len);
      String ssid = doc["ssid"].as<String>();
      String pass = doc["pass"].as<String>();

      M5.Lcd.fillScreen(BLACK);
      M5.Lcd.setCursor(0, 0);
      M5.Lcd.println("Conectando...");
      M5.Lcd.println(ssid);

      WiFi.mode(WIFI_STA);
      WiFi.begin(ssid.c_str(), pass.c_str());

      int intentos = 0;
      while (WiFi.status() != WL_CONNECTED && intentos < 20) {
        delay(500);
        intentos++;
      }

      if (WiFi.status() == WL_CONNECTED) {
        // Guarda credenciales para próximo arranque
        prefs.begin("wifi", false);
        prefs.putString("ssid", ssid);
        prefs.putString("pass", pass);
        prefs.end();

        String ip = WiFi.localIP().toString();
        String json = "{\"ok\":true,\"ip\":\"" + ip + "\"}";
        req->send(200, "application/json", json);

        M5.Lcd.fillScreen(BLACK);
        M5.Lcd.setCursor(0, 0);
        M5.Lcd.println("Conectado!");
        M5.Lcd.println(ip);
        wifiConectado = true;
      } else {
        req->send(200, "application/json", "{\"ok\":false}");
        M5.Lcd.println("Fallo WiFi");
        // Vuelve a AP
        WiFi.mode(WIFI_AP);
        WiFi.softAP("Maceta-IoT", "12345678");
      }
    }
  );
}

void iniciarAPIRiego() {
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "Content-Type");

  server.on("/status", HTTP_GET, [](AsyncWebServerRequest *req) {
    humedadFalsa = random(30, 80);
    StaticJsonDocument<200> doc;
    doc["humedad"] = humedadFalsa;
    doc["bomba"] = bombaActiva;
    doc["modo"] = modoAuto ? "auto" : "manual";
    String json;
    serializeJson(doc, json);
    req->send(200, "application/json", json);
  });

  server.on("/pump/on", HTTP_POST, [](AsyncWebServerRequest *req) {
    bombaActiva = true;
    req->send(200, "application/json", "{\"ok\":true}");
  });

  server.on("/pump/off", HTTP_POST, [](AsyncWebServerRequest *req) {
    bombaActiva = false;
    req->send(200, "application/json", "{\"ok\":true}");
  });

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
}

void setup() {
  auto cfg = M5.config();
  M5.begin(cfg);
  M5.Lcd.setRotation(3);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setTextColor(WHITE);
  M5.Lcd.setTextSize(2);

  // Revisa si ya tiene credenciales guardadas
  prefs.begin("wifi", true);
  String savedSSID = prefs.getString("ssid", "");
  String savedPass = prefs.getString("pass", "");
  prefs.end();

  if (savedSSID != "") {
    // Intenta conectarse con credenciales guardadas
    M5.Lcd.println("Conectando a:");
    M5.Lcd.println(savedSSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(savedSSID.c_str(), savedPass.c_str());

    int intentos = 0;
    while (WiFi.status() != WL_CONNECTED && intentos < 20) {
      delay(500);
      intentos++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      wifiConectado = true;
      M5.Lcd.fillScreen(BLACK);
      M5.Lcd.setCursor(0, 0);
      M5.Lcd.println("Conectado!");
      M5.Lcd.println(WiFi.localIP());
      iniciarAPIRiego();
    } else {
      // Si falla, arranca el portal
      iniciarAPPortal();
    }
  } else {
    // Sin credenciales, arranca portal
    iniciarAPPortal();
  }

  server.begin();
}

void loop() {
  M5.update();

  if (wifiConectado) {
    M5.Lcd.fillScreen(BLACK);
    M5.Lcd.setCursor(0, 0);
    M5.Lcd.printf("Hum: %d%%", humedadFalsa);
    M5.Lcd.setCursor(0, 20);
    M5.Lcd.printf("Bomba: %s", bombaActiva ? "ON" : "OFF");
    M5.Lcd.setCursor(0, 40);
    M5.Lcd.printf("Modo: %s", modoAuto ? "AUTO" : "MAN");
    M5.Lcd.setCursor(0, 60);
    M5.Lcd.println(WiFi.localIP());
  }

  delay(1000);
}