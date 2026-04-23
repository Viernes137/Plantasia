from extras import db

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
