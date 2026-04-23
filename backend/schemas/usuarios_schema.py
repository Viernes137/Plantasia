def serialize_usuario(user):
    return {
        "nombre": user.nombre,
        "correo": user.correo,
        "usuario": user.usuario,
        "id": user.id_usr
    }
