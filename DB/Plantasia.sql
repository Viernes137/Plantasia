
CREATE TABLE usuarios (
    id_usr SERIAL PRIMARY KEY, 
    nombre VARCHAR(255),
    usuario VARCHAR(255),
    correo VARCHAR(255),
    contrasena VARCHAR(255), 
    zona VARCHAR(255)
);

CREATE TABLE datos_plantas (
    id_planta SERIAL PRIMARY KEY,
    nombre_planta VARCHAR(255),
    cantidad_sol INT,
    frecuencia_riego INT,
    temperatura_ideal INT,
    region_endemica VARCHAR(255),
    tipo_planta VARCHAR(255),
    vida_promedio INT, 
    cosechable BOOLEAN,
    tiempo_cosecha INT NULL
);

CREATE TABLE macetas (
    id_maceta SERIAL PRIMARY KEY,
    id_planta INT NOT NULL, 
    id_usr INT NOT NULL,    
    promedio_satisfaccion_luz INT,
    promedio_satisfaccion_agua INT,
    promedio_satisfaccion_temp INT,
    cantidad_agua INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_planta FOREIGN KEY (id_planta) REFERENCES datos_plantas(id_planta) ON DELETE CASCADE,
    CONSTRAINT fk_usuario FOREIGN KEY (id_usr) REFERENCES usuarios(id_usr) ON DELETE CASCADE
);

CREATE TABLE registros_irt (
    id_registro SERIAL PRIMARY KEY, 
    id_maceta INT NOT NULL,
    cant_luz INT,
    cant_agua INT,
    temp INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_maceta FOREIGN KEY (id_maceta) REFERENCES macetas(id_maceta) ON DELETE CASCADE
);


-- Índices para Usuarios 
CREATE UNIQUE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_login ON usuarios(usuario);

-- Índices para Macetas
CREATE INDEX idx_macetas_id_usr ON macetas(id_usr);

-- Este es un índice compuesto: busca por maceta y ordena por fecha al mismo tiempo.
CREATE INDEX idx_registros_maceta_fecha ON registros_irt(id_maceta, fecha_registro);
