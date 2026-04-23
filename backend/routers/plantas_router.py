from flask import Blueprint, jsonify, request
from services.plantas_service import get_all_plantas, create_planta
from schemas.plantas_schema import serialize_plantas

plantas_bp = Blueprint('plantas_bp', __name__)

@plantas_bp.route('/', methods=['GET'])
def get_plantas():
    plantas = get_all_plantas()
    resultado = serialize_plantas(plantas)
    return jsonify(resultado)

@plantas_bp.route('/', methods=['POST'])
def post_planta():
    data = request.get_json()
    try:
        nueva_planta = create_planta(data)
        return jsonify({"mensaje": "Planta creada", "id_planta": nueva_planta.id_planta}), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        from extras import db
        db.session.rollback()
        from sqlalchemy.exc import IntegrityError
        if isinstance(e, IntegrityError):
            return jsonify({"error": "Error de base de datos (posiblemente la planta ya existe)."}), 400
        return jsonify({"error": "Error interno del servidor"}), 500
