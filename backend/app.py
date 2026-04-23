import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from extras import db, jwt
from routers.plantas_router import plantas_bp
from routers.usuarios_router import usuarios_bp

def create_app():
    app = Flask(__name__)
    load_dotenv()
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql://{os.environ.get('DB_USER')}:"
        f"{os.environ.get('DB_PASSWORD')}@"
        f"{os.environ.get('DB_HOST')}:5432/"
        f"{os.environ.get('DB_NAME')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = "HaaaaChiMIIIIIINMamAMAmbo1234567" 

    # Inicialización de extensiones
    db.init_app(app)
    jwt.init_app(app)

    # Registro de Blueprints
    app.register_blueprint(plantas_bp, url_prefix='/Plantas')
    app.register_blueprint(usuarios_bp, url_prefix='/Usuarios')

    @app.route('/', methods=['GET'])
    def vida():
        return jsonify({"mensaje": "Si sirve la api"}), 200

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
