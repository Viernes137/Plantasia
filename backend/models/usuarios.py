from extras import db

class Usuarios(db.Model):
    __tablename__ = 'usuarios' 
    id_usr = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255))
    usuario = db.Column(db.String(255), unique=True, index=True)
    correo = db.Column(db.String(255), unique=True, index=True)
    contrasena = db.Column(db.String(255)) 
    zona = db.Column(db.String(255))
    macetas = db.relationship('Macetas', backref='propietario', lazy=True)
