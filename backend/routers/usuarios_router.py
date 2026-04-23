from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from services.usuarios_service import authenticate_user, create_user, get_user_by_id, get_macetas_by_user, create_maceta, delete_maceta, get_historial_maceta, sincronizar_maceta
from schemas.usuarios_schema import serialize_usuario
from schemas.macetas_schema import serialize_macetas

usuarios_bp = Blueprint('usuarios_bp', __name__)

@usuarios_bp.route('/validar', methods=['POST'])
def validar_usrs():
    data = request.get_json()
    correo_ingresado = data.get('email')
    pass_ingresada = data.get('pass') 

    user = authenticate_user(correo_ingresado, pass_ingresada)

    if user:
        access_token = create_access_token(identity=str(user.id_usr))
        return jsonify({
            "mensaje": "Login exitoso",
            "token": access_token,
            "usuario": user.usuario
        }), 200
    
    return jsonify({"error": "Credenciales inválidas"}), 401

@usuarios_bp.route('/crear', methods=['POST'])
def post_usrs():
    data = request.get_json()

    try:
        nuevo_usuario = create_user(data)
        return jsonify({
            "mensaje": "Usuario creado con éxito",
            "id": nuevo_usuario.id_usr
        }), 201

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        from extras import db
        db.session.rollback() 
        return jsonify({"error": str(e)}), 500

@usuarios_bp.route('/perfil', methods=['GET'])
@jwt_required() 
def perfil():
    user_id = get_jwt_identity() 
    user = get_user_by_id(user_id)
    return jsonify(serialize_usuario(user)), 200

@usuarios_bp.route('/mis-macetas', methods=['GET'])
@jwt_required()
def macetas_usuario():
    id_usr_act = get_jwt_identity()
    mis_macetas = get_macetas_by_user(id_usr_act)
    resultado = serialize_macetas(mis_macetas)
    return jsonify(resultado), 200

@usuarios_bp.route('/macetas', methods=['POST'])
@jwt_required()
def post_maceta():
    data = request.get_json()
    id_usr_act = get_jwt_identity()
    try:
        nueva_maceta = create_maceta(data, id_usr_act)
        return jsonify({"mensaje": "Maceta creada con éxito", "id_maceta": nueva_maceta.id_maceta}), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        from extras import db
        db.session.rollback()
        from sqlalchemy.exc import IntegrityError
        if isinstance(e, IntegrityError):
            return jsonify({"error": "Error de base de datos: Asegúrate de que la planta especificada exista."}), 400
        return jsonify({"error": str(e)}), 500

@usuarios_bp.route('/macetas/<int:id_maceta>', methods=['DELETE'])
@jwt_required()
def delete_maceta_route(id_maceta):
    id_usr_act = get_jwt_identity()
    try:
        delete_maceta(id_maceta, id_usr_act)
        return jsonify({"mensaje": "Maceta eliminada con éxito"}), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        from extras import db
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@usuarios_bp.route('/macetas/<int:id_maceta>/historial', methods=['GET'])
@jwt_required()
def historial_maceta_route(id_maceta):
    id_usr_act = get_jwt_identity()
    try:
        historial = get_historial_maceta(id_maceta, id_usr_act)
        return jsonify(historial), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404

@usuarios_bp.route('/macetas/<int:id_maceta>/sincronizar', methods=['POST'])
@jwt_required()
def sincronizar_maceta_route(id_maceta):
    id_usr_act = get_jwt_identity()
    try:
        sincronizar_maceta(id_maceta, id_usr_act)
        return jsonify({"mensaje": "Sincronización exitosa"}), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
