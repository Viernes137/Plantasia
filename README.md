# 🌱 Plantasia

Plantasia es una plataforma IoT orientada al cuidado de plantas. Permite conectar macetas inteligentes (hardware) con una aplicación web, para monitorear en tiempo real variables como la temperatura, luz y humedad, y gestionar tus plantas de manera interactiva.

## 🚀 Tecnologías Principales

- **Frontend:** React + Vite, Bootstrap.
- **Backend:** Python + Flask, Flask-SQLAlchemy, Flask-JWT-Extended.
- **Base de Datos:** PostgreSQL.
- **Hardware (Macetas):** ESP32 / Arduino (C++).
- **Despliegue:** Docker y Docker Compose.

---

## 📁 Estructura del Proyecto

- `/Frontend-react/PlantasiaF`: Contiene la aplicación web (React/Vite).
- `/backend`: Contiene la API REST desarrollada en Flask.
- `/DB`: Archivos relacionados con la base de datos, incluyendo el script de inicialización (`Plantasia.sql`).
- `/Macetas`: Código fuente (C++) para los microcontroladores de las macetas inteligentes.

---

## 🛠️ Instalación y Uso (con Docker)

La forma más rápida de ejecutar todo el ecosistema (Frontend, Backend y Base de Datos) es utilizando Docker Compose.

### Requisitos Previos
- Tener instalado [Docker](https://www.docker.com/) 
### Levantar el Proyecto

1. Clona el repositorio y ubícate en la raíz del proyecto.
2. Ejecuta el siguiente comando:

```bash
docker-compose up 
```

Esto iniciará tres contenedores:
- **Base de datos:** Expuesta en el puerto `5432`.
- **Backend:** Expuesto en `http://localhost:5000`.
- **Frontend:** Expuesto en `http://localhost:5173`.

### Comandos Útiles de Docker

- Detener los contenedores:
  ```bash
  docker-compose down
  ```
- Detener los contenedores y **borrar los datos** de la base de datos (volúmenes):
  ```bash
  docker-compose down -v
  ```
- Acceder a la consola de la base de datos (psql) mientras el contenedor corre:
  ```bash
  docker exec -it plantasia_db psql -U plantasia_user -d plantasia
  ```

---

## 💻 Desarrollo Local (Sin Docker)

Si prefieres levantar los servicios individualmente para desarrollo:

### 1. Base de Datos
Puedes levantar solo la base de datos con:
```bash
docker-compose up -d db
```

### 2. Backend (Flask)
Se utiliza `uv` o `pip` para manejar el entorno:
```bash
cd backend
# Si usas uv
uv run app.py
# Si usas pip
pip install -r pyproject.toml # (Opcional según tu gestor)
flask run --port=5000
```

### 3. Frontend (React)
```bash
cd Frontend-react/PlantasiaF
npm install
npm run dev
```

---

## 🔧 Scripts y Tareas Adicionales
- Para insertar datos por defecto simplemete replica lo que esta dentro del backend (`insert_default_plant.py`).
