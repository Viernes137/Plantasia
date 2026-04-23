import datetime
from extras import db

class Macetas(db.Model):
    __tablename__ = 'macetas'
    id_maceta = db.Column(db.Integer, primary_key=True)
    id_planta = db.Column(db.Integer, db.ForeignKey('datos_plantas.id_planta'), nullable=False)
    id_usr = db.Column(db.Integer, db.ForeignKey('usuarios.id_usr'), nullable=False)
    
    nombre = db.Column(db.String(100), nullable=False, default="Mi Maceta")
    ip_maceta = db.Column(db.String(50), nullable=True)
    
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
