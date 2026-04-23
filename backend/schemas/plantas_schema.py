def serialize_planta(planta):
    return {
        "id": planta.id_planta,
        "nombre": planta.nombre_planta,
        "tipo": planta.tipo_planta,
        "temp_ideal": planta.temperatura_ideal
    }

def serialize_plantas(plantas):
    return [serialize_planta(planta) for planta in plantas]
