def serialize_maceta(maceta):
    from models.plantas import DatosPlantas
    planta = DatosPlantas.query.get(maceta.id_planta)
    nombre_planta = planta.nombre_planta if planta else 'Desconocida'
    region_endemica = planta.region_endemica if planta else 'Desconocida'
    
    return {
        "id": maceta.id_maceta,
        "nombre": maceta.nombre,
        "planta": nombre_planta,
        "region": region_endemica,
        "ip_maceta": maceta.ip_maceta,
        "humedad": maceta.cantidad_agua or 0,
        "luz": maceta.promedio_satisfaccion_luz or 0,
        "temperatura": maceta.promedio_satisfaccion_temp or 0
    }

def serialize_macetas(macetas):
    return [serialize_maceta(m) for m in macetas]
