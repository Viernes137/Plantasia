from models.usuarios import Usuarios
from models.macetas import Macetas, RegistrosIrt
from extras import db
import urllib.request
import json

def authenticate_user(correo, password):
    user = Usuarios.query.filter_by(correo=correo).first()
    if user and user.contrasena == password:
        return user
    return None

def create_user(data):
    if not data:
        raise ValueError("No hay nada, absolutamente nada")

    if not data.get('usuario') or not data.get('email'):
        raise ValueError("Faltan datos obligatorios")

    nuevo_usuario = Usuarios(
        nombre=data.get('nombre'),
        usuario=data.get('usuario'),
        correo=data.get('email'),        
        contrasena=data.get('cont'), 
        zona=data.get('zona')
    )

    db.session.add(nuevo_usuario)
    db.session.commit()
    return nuevo_usuario

def get_user_by_id(user_id):
    return Usuarios.query.get(user_id)

def get_macetas_by_user(user_id):
    return Macetas.query.filter_by(id_usr=user_id).all()

def create_maceta(data, user_id):
    if not data.get('id_planta'):
        raise ValueError("El id_planta es obligatorio")
        
    nueva_maceta = Macetas(
        id_planta=data.get('id_planta'),
        id_usr=user_id,
        nombre=data.get('nombre', 'Mi Maceta'),
        ip_maceta=data.get('ip_maceta'),
        cantidad_agua=0,
        promedio_satisfaccion_luz=0,
        promedio_satisfaccion_agua=0,
        promedio_satisfaccion_temp=0
    )
    db.session.add(nueva_maceta)
    db.session.commit()
    return nueva_maceta

def delete_maceta(id_maceta, user_id):
    maceta = Macetas.query.filter_by(id_maceta=id_maceta, id_usr=user_id).first()
    if not maceta:
        raise ValueError("Maceta no encontrada o no pertenece al usuario")
    
    db.session.delete(maceta)
    db.session.commit()
    return True

def get_historial_maceta(id_maceta, user_id):
    maceta = Macetas.query.filter_by(id_maceta=id_maceta, id_usr=user_id).first()
    if not maceta:
        raise ValueError("Maceta no encontrada")
    
    registros = RegistrosIrt.query.filter_by(id_maceta=id_maceta).order_by(RegistrosIrt.fecha_registro.asc()).all()
    
    return [
        {
            "id": r.id_registro,
            "luz": r.cant_luz,
            "humedad": r.cant_agua,
            "temperatura": r.temp,
            "fecha": r.fecha_registro.isoformat()
        }
        for r in registros
    ]

def sincronizar_maceta(id_maceta, user_id):
    maceta = Macetas.query.filter_by(id_maceta=id_maceta, id_usr=user_id).first()
    if not maceta or not maceta.ip_maceta:
        raise ValueError("Maceta no encontrada o no tiene IP configurada")
    
    try:
        url = f"http://{maceta.ip_maceta}/status"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            
            humedad = data.get("humedad", 0)
            temp = data.get("temperatura", 0)
            luz = data.get("luz", 0)
            
            nuevo_registro = RegistrosIrt(
                id_maceta=id_maceta,
                cant_luz=luz,
                cant_agua=humedad,
                temp=temp
            )
            
            maceta.cantidad_agua = humedad
            
            db.session.add(nuevo_registro)
            db.session.commit()
            return True
            
    except Exception as e:
        print(f"Error sincronizando maceta: {e}")
        raise ValueError("No se pudo conectar con la maceta")
