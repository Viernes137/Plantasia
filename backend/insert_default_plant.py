import sys
sys.path.append('.')

from app import create_app
from extras import db
from models.plantas import DatosPlantas

app = create_app()

with app.app_context():
    planta = DatosPlantas.query.get(1)
    if not planta:
        planta = DatosPlantas(
            id_planta=1,
            nombre_planta="Planta por Defecto",
            cantidad_sol=50,
            frecuencia_riego=50,
            temperatura_ideal=25,
            region_endemica="Desconocida",
            tipo_planta="General",
            vida_promedio=365
        )
        db.session.add(planta)
        db.session.commit()
        print("Planta default insertada.")
    else:
        print("La planta con id=1 ya existe.")
