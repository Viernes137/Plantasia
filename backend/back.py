import os
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

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

app.config["JWT_SECRET_KEY"] = "GaRiBalDi" 

# --- INICIALIZACIÓN DE EXTENSIONES ---
db = SQLAlchemy(app)
jwt = JWTManager(app)


# --- modelos, basicamente pasar de postgres a alchmey  ----
class Usuarios(db.Model):
    __tablename__ = 'usuarios' 
    id_usr = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255))
    usuario = db.Column(db.String(255), unique=True, index=True)
    correo = db.Column(db.String(255), unique=True, index=True)
    contrasena = db.Column(db.String(255)) 
    zona = db.Column(db.String(255))
    macetas = db.relationship('Macetas', backref='propietario', lazy=True)

class DatosPlantas(db.Model):
    __tablename__ = 'datos_plantas'
    id_planta = db.Column(db.Integer, primary_key=True)
    nombre_planta = db.Column(db.String(255), index=True)
    cantidad_sol = db.Column(db.Integer)
    frecuencia_riego = db.Column(db.Integer)
    temperatura_ideal = db.Column(db.Integer)
    region_endemica = db.Column(db.String(255))
    tipo_planta = db.Column(db.String(255))
    vida_promedio = db.Column(db.Integer)
    cosechable = db.Column(db.Boolean, default=False)
    tiempo_cosecha = db.Column(db.Integer, nullable=True)

class Macetas(db.Model):
    __tablename__ = 'macetas'
    id_maceta = db.Column(db.Integer, primary_key=True)
    id_planta = db.Column(db.Integer, db.ForeignKey('datos_plantas.id_planta'), nullable=False)
    id_usr = db.Column(db.Integer, db.ForeignKey('usuarios.id_usr'), nullable=False)
    
    promedio_satisfaccion_luz = db.Column(db.Integer)
    promedio_satisfaccion_agua = db.Column(db.Integer)
    promedio_satisfaccion_temp = db.Column(db.Integer)
    cantidad_agua = db.Column(db.Integer)
    fecha_creacion = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class RegistrosIrt(db.Model):
    __tablename__ = 'registros_irt'
    id_registro = db.Column(db.Integer, primary_key=True)
    id_maceta = db.Column(db.Integer, db.ForeignKey('macetas.id_maceta'), nullable=False)
    cant_luz = db.Column(db.Integer)
    cant_agua = db.Column(db.Integer)
    temp = db.Column(db.Integer)
    fecha_registro = db.Column(db.DateTime, default=datetime.datetime.utcnow, index=True)


# --- rutinñas ---
@app.route('/', methods=['GET'])
def vida():
    return jsonify({"mensaje": "Si sirve la api"}), 200

@app.route('/Plantas', methods=['GET'])
def get_plantas():
    todas_las_plantas = DatosPlantas.query.all()
    
    resultado = []
    for planta in todas_las_plantas:
        resultado.append({
            "id": planta.id_planta,
            "nombre": planta.nombre_planta,
            "tipo": planta.tipo_planta,
            "temp_ideal": planta.temperatura_ideal
        })
    
    return jsonify(resultado)


@app.route('/Usuarios/validar', methods=['POST'])
def validar_usrs():
    data = request.get_json()
    correo_ingresado = data.get('email')
    pass_ingresada = data.get('pass') 

    user = Usuarios.query.filter_by(correo=correo_ingresado).first()

    if user and user.contrasena == pass_ingresada:

        access_token = create_access_token(identity=str(user.id_usr))
        return jsonify({
            "mensaje": "Login exitoso",
            "token": access_token,
            "usuario": user.usuario
        }), 200
    
    return jsonify({"error": "Credenciales inválidas"}), 401



@app.route('/Usuarios/crear', methods=['POST'])
def post_usrs():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No hay nada, absolutamente nada"}), 400

    if not data.get('usuario') or not data.get('email'):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    try:
        nuevo_usuario = Usuarios(
            nombre=data.get('nombre'),
            usuario=data.get('usuario'),
            correo=data.get('email'),        
            contrasena=data.get('cont'), 
            zona=data.get('zona')
        )

        db.session.add(nuevo_usuario)
        db.session.commit()

        return jsonify({
            "mensaje": "Usuario creado con éxito",
            "id": nuevo_usuario.id_usr
        }), 201

    except Exception as e:
        db.session.rollback() 
        return jsonify({"error": str(e)}), 500


@app.route('/Usuarios/perfil', methods=['GET'])
@jwt_required() 
def perfil():
    user_id = get_jwt_identity() 
    
    user = Usuarios.query.get(user_id)
    return jsonify({
        "nombre": user.nombre,
        "correo": user.correo,
        "usuario": user.usuario,
        "id":user.id_usr
    }), 200

@app.route('/Usuarios/mis-macetas', methods=['GET'])
@jwt_required()
def get_macetas_usuario():

    id_usr_act = get_jwt_identity()

    mis_macetas = Macetas.query.filter_by(id_usr=id_usr_act).all()
    
    resultado = []
    for m in mis_macetas:
        resultado.append({
            "id": m.id_maceta,
            "nombre": m.nombre_maceta,
            "planta": m.tipo_planta,
            "humedad": m.humedad_actual 
        })
    
    return jsonify(resultado), 200


if __name__ == "__main__":
    app.run(debug=True)
