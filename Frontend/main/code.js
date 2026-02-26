
const token = localStorage.getItem('token_usr');


function cerrarSesion() {
    localStorage.removeItem('token_usr');
    window.location.href = "../login/inicio.html";
}

if (!token) {
    cerrarSesion();
}


async function cargarDatosPerfil() {
    const token = localStorage.getItem('token_usr');

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
            document.getElementById('nombre').innerText = `¡Hola, ${datos.nombre}!`;
        } else if (response.status === 401) {
            cerrarSesion();
        }
    } catch (error) {
        console.error("Error de conexión con el servidor:", error);
        window.alert('no esta prendido el back ')
    }
}


function renderizarMacetas(lista) {
    const contenedor = document.getElementById('contenedor-macetas');
    contenedor.innerHTML = "";

    if (lista.length == 0) {
        contenedor.innerHTML += `
            <div class="centrado">
                <h1>No tienes ninguna Planta :(</h1>
            </div>
        `;
    }

    lista.forEach(maceta => {
        contenedor.innerHTML += `
            <div class="card-maceta">
                <h3>${maceta.nombre}</h3>
                <p>Planta: ${maceta.planta}</p>
                <div class="sensor">Humedad: ${maceta.humedad}%</div>
            </div>
        `;
    });
}

async function cargarMacetas() {
    const token = localStorage.getItem('token_usr');

    const response = await fetch('http://127.0.0.1:5000/Usuarios/mis-macetas', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const macetas = await response.json();
        renderizarMacetas(macetas);
    } else {
        console.error("No se pudieron cargar las macetas");
    }
}



document.addEventListener("DOMContentLoaded", cargarDatosPerfil);
cargarMacetas();

function regar() {
    window.alert("Se esta regando la platita")
}

function luz() {
    console.log("luz: bien")
}

function humedad() {
    console.log("humedad: poquita")
}

function ocultar(id) {
    document.getElementById(id).style.display = "none";
}

function mostrar(id) {
    document.getElementById(id).style.display = "flex";
}