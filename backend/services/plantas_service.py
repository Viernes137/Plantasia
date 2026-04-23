from models.plantas import DatosPlantas
from extras import db

def get_all_plantas():
    return DatosPlantas.query.all()

def create_planta(data):
    if not data or not data.get('nombre_planta'):
        raise ValueError("El nombre de la planta es obligatorio")
        
    nueva_planta = DatosPlantas(
        nombre_planta=data.get('nombre_planta'),
        cantidad_sol=data.get('cantidad_sol', 0),
        frecuencia_riego=data.get('frecuencia_riego', 0),
        temperatura_ideal=data.get('temperatura_ideal', 0),
        region_endemica=data.get('region_endemica', 'Desconocida'),
        tipo_planta=data.get('tipo_planta', 'General'),
        vida_promedio=data.get('vida_promedio', 0),
        cosechable=data.get('cosechable', False),
        tiempo_cosecha=data.get('tiempo_cosecha', 0)
    )
    db.session.add(nueva_planta)
    db.session.commit()
    return nueva_planta
