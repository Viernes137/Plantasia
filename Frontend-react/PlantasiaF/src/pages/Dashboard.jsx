import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/estilos.css';

const Dashboard = () => {
  const [nombre, setNombre] = useState('');
  const [macetas, setMacetas] = useState([]);
  const [showIntro, setShowIntro] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevaMaceta, setNuevaMaceta] = useState({ nombre: '', ip_maceta: '', id_planta: 1 });
  const [macetaActiva, setMacetaActiva] = useState(null);
  const [datosEnVivo, setDatosEnVivo] = useState(null);
  const [mostrarOffcanvas, setMostrarOffcanvas] = useState(false);
  const [listaPlantas, setListaPlantas] = useState([]);
  const [nuevaPlanta, setNuevaPlanta] = useState({
    nombre_planta: '',
    cantidad_sol: '',
    frecuencia_riego: '',
    temperatura_ideal: '',
    region_endemica: '',
    tipo_planta: ''
  });
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('token_usr');
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token_usr');
    if (!token) {
      cerrarSesion();
      return;
    }

    const cargarDatosPerfil = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/Usuarios/perfil', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const datos = await response.json();
          setNombre(`¡Hola, ${datos.nombre}!`);
        } else if (response.status === 401 || response.status === 422) {
          cerrarSesion();
        }
      } catch (error) {
        console.error("Error de conexión con el servidor:", error);
        window.alert('no esta prendido el back');
      }
    };

    const cargarMacetas = async () => {
      const response = await fetch('http://127.0.0.1:5000/Usuarios/mis-macetas', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const macetasData = await response.json();
        setMacetas(macetasData);
      } else {
        console.error("No se pudieron cargar las macetas");
      }
    };

    const cargarPlantas = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/Plantas/', { method: 'GET' });
        if (response.ok) {
          const plantasData = await response.json();
          setListaPlantas(plantasData);
          if (plantasData.length > 0) {
            setNuevaMaceta(prev => ({ ...prev, id_planta: plantasData[0].id }));
          }
        }
      } catch (e) {
        console.error("No se pudieron cargar las plantas", e);
      }
    };

    cargarDatosPerfil();
    cargarMacetas();
    cargarPlantas();
  }, [navigate]);

  useEffect(() => {
    let intervalo;
    if (macetaActiva && macetaActiva.ip_maceta) {
      const fetchVivo = async () => {
        try {
          const res = await fetch(`http://${macetaActiva.ip_maceta}/status`);
          const data = await res.json();
          setDatosEnVivo(data);
        } catch (e) {
          console.error("Error conectando a la maceta", e);
        }
      };
      fetchVivo();
      intervalo = setInterval(fetchVivo, 3000);
    } else {
      setDatosEnVivo(null);
    }
    return () => clearInterval(intervalo);
  }, [macetaActiva]);

  const handleAgregarMaceta = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token_usr');
    try {
      const res = await fetch('http://127.0.0.1:5000/Usuarios/macetas', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaMaceta)
      });
      if (res.ok) {
        setMostrarForm(false);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const regarMaceta = async () => {
    if (!macetaActiva || !macetaActiva.ip_maceta) return;
    try {
      await fetch(`http://${macetaActiva.ip_maceta}/pump/on`, { method: 'POST', mode: 'no-cors' });
      setTimeout(() => {
        fetch(`http://${macetaActiva.ip_maceta}/pump/off`, { method: 'POST', mode: 'no-cors' });
      }, 3000);
    } catch (e) {
      console.error("Error al regar", e);
    }
  };

  const handleAgregarPlanta = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/Plantas/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaPlanta)
      });
      if (res.ok) {
        alert("Planta agregada exitosamente");
        setMostrarOffcanvas(false);
        setNuevaPlanta({ nombre_planta: '', cantidad_sol: '', frecuencia_riego: '', temperatura_ideal: '', region_endemica: '', tipo_planta: '' });

        // Recargar lista de plantas
        try {
          const response = await fetch('http://127.0.0.1:5000/Plantas/', { method: 'GET' });
          if (response.ok) {
            const plantasData = await response.json();
            setListaPlantas(plantasData);
          }
        } catch (e) { }

      } else {
        alert("Error al agregar planta");
      }
    } catch (e) {
      console.error(e);
      alert("Error al conectar con el servidor");
    }
  };

  const resetWifiMaceta = async () => {
    if (!macetaActiva || !macetaActiva.ip_maceta) return;
    const confirmar = window.confirm("¿Estás seguro de que quieres restablecer el WiFi de esta maceta? Se desconectará de la red actual y entrará en modo configuración.");
    if (!confirmar) return;
    try {
      await fetch(`http://${macetaActiva.ip_maceta}/reset-wifi`, { method: 'POST', mode: 'no-cors' });
      alert("Comando de reinicio enviado. La maceta ahora creará su propia red WiFi 'Maceta-IoT' para configurarse.");
      setMacetaActiva(null);
    } catch (e) {
      console.error("Error al reiniciar WiFi", e);
      alert("No se pudo conectar a la maceta para reiniciarla.");
    }
  };

  const contarPlantasPorRegion = (regionStr) => {
    const cantidad = macetas.filter(m => m.region === regionStr).length;
    alert(`Tienes ${cantidad} maceta(s) asociadas a la ${regionStr}`);
  };

  return (
    <div>
      <header className="centrado">
        <h1 id="nombre">{nombre}</h1>
        <button onClick={cerrarSesion} className="btn-cafe" style={{ position: 'absolute', top: 20, right: 20 }}>
          Cerrar Sesión
        </button>
      </header>

      {showIntro && (
        <div className="centrado intrusivo">
          <div className="a">
            <h1>hola cara de bola </h1>
            <button className="op Bomba" onClick={() => setShowIntro(false)}>adios</button>
          </div>
        </div>
      )}

      <div className="contenedor">
        <div id="contenedor-macetas">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Mis Macetas</h2>
            <div>
              <button className="op Bomba" onClick={() => setMostrarForm(!mostrarForm)} style={{ marginRight: '10px' }}>
                {mostrarForm ? 'Cancelar' : '+ Añadir Maceta'}
              </button>
              <button className="op" onClick={() => setMostrarOffcanvas(true)} style={{ backgroundColor: '#E6B35C', color: 'black' }}>
                🌱 Nueva Planta
              </button>
            </div>
          </div>

          {macetaActiva ? (
            <div className="card-maceta" style={{ border: '2px solid #2d6a4f' }}>
              <h3>{macetaActiva.nombre} 🔴 EN VIVO</h3>
              <p>IP: {macetaActiva.ip_maceta}</p>
              {datosEnVivo ? (
                <>
                  <div className="sensor">Humedad: {datosEnVivo.humedad}%</div>
                  <div className="sensor">Temperatura: {datosEnVivo.temperatura}°C</div>
                  <div className="sensor">Luz: {datosEnVivo.luz}</div>
                  <p>Bomba: {datosEnVivo.bomba ? 'ENCENDIDA' : 'APAGADA'}</p>
                  <button className="op Bomba" onClick={regarMaceta} style={{ marginTop: '10px' }}>💦 Regar (3s)</button>
                  <button className="btn-cafe" onClick={resetWifiMaceta} style={{ marginTop: '10px', marginLeft: '10px' }}>🔄 Restablecer WiFi</button>
                </>
              ) : (
                <>
                  <p>Conectando a maceta...</p>
                  <button className="btn-cafe" onClick={resetWifiMaceta} style={{ marginTop: '10px' }}>🔄 Restablecer WiFi</button>
                </>
              )}
              <button className="op" onClick={() => setMacetaActiva(null)} style={{ marginTop: '15px', display: 'block' }}>Volver</button>
            </div>
          ) : (
            macetas.length === 0 ? (
              <div className="centrado">
                <h1>No tienes ninguna Planta :(</h1>
              </div>
            ) : (
              macetas.map((maceta, idx) => (
                <div className="card-maceta" key={idx} onClick={() => setMacetaActiva(maceta)} style={{ cursor: 'pointer' }}>
                  <h3>{maceta.nombre}</h3>
                  <p>Planta: {maceta.planta}</p>
                  <div className="sensor">Humedad BD: {maceta.humedad}%</div>
                </div>
              ))
            )
          )}
        </div>
        <div id="mapa">
          <h1>mapa</h1>
          <div id="map-container">
            <svg viewBox="0 0 60 40" width="100%" height="auto" style={{ maxHeight: '600px' }} xmlns="http://www.w3.org/2000/svg">
              <g stroke="#ffffff" strokeWidth="0.5" style={{ cursor: 'pointer' }}>
                <polygon
                  className="zona-a"
                  onClick={() => contarPlantasPorRegion('Zona Árida/Semiárida (A)')}
                  points="7,2 13,2 13,3 15,3 15,4 21,4 21,3 24,3 24,4 25,4 25,5 27,5 27,8 29,8 29,7 33,7 33,9 34,9 34,10 35,10 35,12 36,12 36,13 39,13 39,15 38,15 38,21 35,22 30,17 25,16 19,12 18,12 14,8 14,6 13,6 13,4 11,4 11,7 12,7 12,8 13,8 13,9 14,9 14,11 15,11 15,12 16,12 16,15 17,15 17,16 18,16 18,17 19,17 19,18 18,18 18,19 17,19 17,17 15,17 15,16 14,16 14,13 13,13 13,12 11,12 11,11 9,11 9,10 11,10 11,9 9,9 9,6 8,6 8,3 7,3"
                />
                <polygon
                  className="zona-te"
                  onClick={() => contarPlantasPorRegion('Zona Templada/Boscosa (Te)')}
                  points="38,21 39,21 39,23 40,23 40,25 41,25 41,26 43,26 43,27 45,27 45,26 49,26 49,25 50,25 50,24 51,24 51,22 52,22 52,21 48,26 44,31 40,25 35,22"
                />
                <polygon
                  className="zona-ts"
                  onClick={() => contarPlantasPorRegion('Zona Tropical Seca (TS)')}
                  points="44,31 44,30 42,30 42,31 37,31 37,30 34,30 34,29 32,29 32,28 29,28 29,27 28,27 28,26 25,26 25,25 24,25 24,22 25,22 25,19 24,19 19,14 19,12 25,16 30,17 35,22 40,25"
                />
                <polygon
                  className="zona-th"
                  onClick={() => contarPlantasPorRegion('Zona Tropical Húmeda (TH)')}
                  points="52,21 57,21 57,23 56,23 56,27 53,27 53,28 51,28 51,31 48,31 48,33 46,33 46,31 44,31 48,26"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Offcanvas para nueva planta */}
      <div className={`panel-lateral ${mostrarOffcanvas ? 'open' : ''}`}>
        <div className="panel-lateral-header">
          <h2>Registrar Tipo de Planta</h2>
          <button className="btn-close" onClick={() => setMostrarOffcanvas(false)}>X</button>
        </div>
        <div className="panel-lateral-body">
          <form onSubmit={handleAgregarPlanta}>
            <label>Nombre de la Planta</label>
            <input type="text" required value={nuevaPlanta.nombre_planta} onChange={e => setNuevaPlanta({ ...nuevaPlanta, nombre_planta: e.target.value })} />

            <label>Cantidad de Sol (%)</label>
            <input type="number" value={nuevaPlanta.cantidad_sol} onChange={e => setNuevaPlanta({ ...nuevaPlanta, cantidad_sol: parseInt(e.target.value) })} />

            <label>Frecuencia de Riego (cada cuántos días)</label>
            <input type="number" value={nuevaPlanta.frecuencia_riego} onChange={e => setNuevaPlanta({ ...nuevaPlanta, frecuencia_riego: parseInt(e.target.value) })} />

            <label>Temperatura Ideal (°C)</label>
            <input type="number" value={nuevaPlanta.temperatura_ideal} onChange={e => setNuevaPlanta({ ...nuevaPlanta, temperatura_ideal: parseInt(e.target.value) })} />

            <label>Región Endémica</label>
            <select required value={nuevaPlanta.region_endemica} onChange={e => setNuevaPlanta({ ...nuevaPlanta, region_endemica: e.target.value })}>
              <option value="" disabled>Selecciona una zona...</option>
              <option value="Zona Árida/Semiárida (A)">Zona Árida/Semiárida (A)</option>
              <option value="Zona Templada/Boscosa (Te)">Zona Templada/Boscosa (Te)</option>
              <option value="Zona Tropical Seca (TS)">Zona Tropical Seca (TS)</option>
              <option value="Zona Tropical Húmeda (TH)">Zona Tropical Húmeda (TH)</option>
            </select>

            <label>Tipo de Planta</label>
            <select required value={nuevaPlanta.tipo_planta} onChange={e => setNuevaPlanta({ ...nuevaPlanta, tipo_planta: e.target.value })}>
              <option value="" disabled>Selecciona un tipo...</option>
              <option value="Verduras/Hortalizas">Verduras / Hortalizas</option>
              <option value="Frutas">Frutas</option>
              <option value="Cactus">Cactus</option>
              <option value="Suculentas">Suculentas</option>
              <option value="Árboles">Árboles</option>
              <option value="Flores">Flores</option>
              <option value="Hierbas/Aromáticas">Hierbas / Aromáticas</option>
              <option value="Helechos">Helechos</option>
              <option value="Trepadoras/Enredaderas">Trepadoras / Enredaderas</option>
              <option value="Otros">Otros</option>
            </select>

            <button type="submit" className="op" style={{ width: '100%', marginTop: '15px' }}>Registrar Planta</button>
          </form>
        </div>
      </div>
      {mostrarOffcanvas && <div className="panel-lateral-backdrop" onClick={() => setMostrarOffcanvas(false)}></div>}

      {/* Modal Centrado para Nueva Maceta */}
      {mostrarForm && (
        <div className="modal-centrado-container">
          <div className="modal-centrado-backdrop" onClick={() => setMostrarForm(false)}></div>
          <div className="modal-centrado-content">
            <div className="modal-centrado-header">
              <h2>Registrar Maceta</h2>
              <button className="btn-close" onClick={() => setMostrarForm(false)}>X</button>
            </div>
            <form onSubmit={handleAgregarMaceta} className="modal-centrado-body">
              <label>Nombre de tu maceta</label>
              <input type="text" required value={nuevaMaceta.nombre} onChange={e => setNuevaMaceta({ ...nuevaMaceta, nombre: e.target.value })} />

              <label>IP M5Stick (ej: 192.168.1.100)</label>
              <input type="text" value={nuevaMaceta.ip_maceta} onChange={e => setNuevaMaceta({ ...nuevaMaceta, ip_maceta: e.target.value })} />

              <label>Asignar Planta</label>
              <select required value={nuevaMaceta.id_planta} onChange={e => setNuevaMaceta({ ...nuevaMaceta, id_planta: parseInt(e.target.value) })}>
                {listaPlantas.map(planta => (
                  <option key={planta.id} value={planta.id}>{planta.nombre} ({planta.tipo})</option>
                ))}
              </select>

              <button type="submit" className="op" style={{ marginTop: '20px', width: '100%' }}>Guardar Maceta</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
