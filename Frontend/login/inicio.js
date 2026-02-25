function ocultarYmostrar(ido, idm) {
    document.getElementById(ido).style.display = "none";
    document.getElementById(idm).style.display = "flex";
}


function p1(a, b) {
    console.log(a, b)
}

async function hasheo(pass) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pass);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    return hashHex;
}

const signin = document.getElementById("signin");
const login = document.getElementById("login");

login.addEventListener("submit", async function (event) {
    event.preventDefault();
    const datos = new FormData(login);

    const requestBody = {
        email: datos.get("correo"),
        pass: await hasheo(datos.get("pass"))
    };
    console.log(requestBody);

    const response = await fetch('http://127.0.0.1:5000/Usuarios/validar', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (response.ok) {
        console.log("Login exitoso:", result);
        localStorage.setItem('token_plantas', result.token);
        window.location.href = "../main/index.html"; // O tu ruta
    } else {
        alert("Error: " + result.error);
    }
});

signin.addEventListener("submit", async function (event) {
    event.preventDefault();
    const datos = new FormData(signin);

    const requestBody = {
        nombre: datos.get("nombre"),
        usuario: datos.get("usuario"),
        email: datos.get("correo"),
        cont: await hasheo(datos.get("pass")),
        zona: datos.get("zona"),
    };
    console.log(requestBody);

    const response = await fetch('http://127.0.0.1:5000/Usuarios/crear', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
    const result = await response.json();
    console.log(result);

});