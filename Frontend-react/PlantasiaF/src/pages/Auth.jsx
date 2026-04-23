import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/inicio.css';

const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);
  const navigate = useNavigate();

  const hasheo = async (pass) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pass);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const pass = formData.get("pass");
    const hashedPass = pass ? await hasheo(pass) : "";

    const requestBody = {
      email: formData.get("correo"),
      pass: hashedPass
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/Usuarios/validar', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Login exitoso:", result.usuario);
        localStorage.setItem('token_usr', result.token);
        navigate("/dashboard");
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error logging in", error);
      alert("Error al intentar iniciar sesión. Verifica el backend.");
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const pass = formData.get("pass");
    const hashedPass = pass ? await hasheo(pass) : "";

    const requestBody = {
      nombre: formData.get("nombre"),
      usuario: formData.get("usuario"),
      email: formData.get("correo"),
      cont: hashedPass,
      zona: formData.get("zona"),
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/Usuarios/crear', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const result = await response.json();
      console.log(result);
      if (response.ok) {
        alert("Usuario creado exitosamente. Por favor inicia sesión.");
        setShowLogin(true);
      } else {
        alert("Error al crear usuario: " + (result.error || "Desconocido"));
      }
    } catch (error) {
      console.error("Error creating user", error);
    }
  };

  return (
    <div className="fondo centrado">
      <div className="dos-forms">
        {showLogin ? (
          <div className="cont-forms a" id="login-cont">
            <form id="login" className="row g-3" onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="correo" className="form-label">Direccion de correo electronico</label>
                <input type="email" className="form-control" id="correo" name="correo" aria-describedby="emailHelp" placeholder="tulio_treviño@31mins.mail.com" />
              </div>
              <div className="mb-4">
                <label htmlFor="pass" className="form-label">Contraseña</label>
                <input type="password" className="form-control" id="pass" name="pass" placeholder="Bodoque123" />
              </div>
              <div className="row">
                <div className="col col-lg-8">
                  <button type="button" className="btn btn-warning" onClick={() => setShowLogin(false)}>Crear cuenta</button>
                </div>
                <div className="col col-lg-2">
                  <button type="submit" className="btn btn-success">Iniciar</button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="cont-forms b" id="signin-cont">
            <form id="signin" className="row g-3" onSubmit={handleSignin}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre Completo</label>
                <input type="text" className="form-control" id="nombre" name="nombre" placeholder="Juanín Juan Harry" required />
              </div>

              <div className="mb-3">
                <label htmlFor="usuario" className="form-label">Nombre de usuario</label>
                <input type="text" className="form-control" id="usuario" name="usuario" placeholder="el_productor_01" required />
              </div>

              <div className="mb-3">
                <label htmlFor="correo_signin" className="form-label">Correo Electrónico</label>
                <input type="email" className="form-control" id="correo_signin" name="correo" placeholder="juanin@31mins.mail.com" required />
              </div>

              <div className="mb-3">
                <label htmlFor="pass_signin" className="form-label">Contraseña</label>
                <input type="password" className="form-control" id="pass_signin" name="pass" placeholder="********" required />
              </div>

              <div className="mb-3">
                <label htmlFor="zona" className="form-label">BioZona Geográfica</label>
                <select className="form-select" id="zona" name="zona" defaultValue="" required>
                  <option value="" disabled>Selecciona tu zona...</option>
                  <option value="A">Zona Árida/Semiárida</option>
                  <option value="Te">Zona Templada/Boscosa</option>
                  <option value="TH">Zona Tropical Húmeda</option>
                  <option value="TS">Zona Tropical Seca</option>
                </select>
              </div>

              <div className="col-12">
                <div className="row">
                  <div className="col col-lg-8">
                    <button type="button" className="btn btn-warning" onClick={() => setShowLogin(true)}>Ya tengo cuenta</button>
                  </div>
                  <div className="col col-lg-3">
                    <button type="submit" className="btn btn-success">Crear sesion</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
