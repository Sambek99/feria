// firebase-auth.js

// Obtener referencias a los elementos del DOM
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const signupButton = document.getElementById('signupButton');
const errorMessage = document.getElementById('error-message');

let auth; // Declaramos auth para que sea accesible globalmente en este script

// Función para inicializar Firebase con la configuración del servidor
async function initializeFirebase() {
    try {
        // Hacer una petición al endpoint que expone la configuración de Firebase desde server.js
        const response = await fetch('/firebase-config');
        const firebaseConfig = await response.json();

        // Verificar si la configuración es válida
        if (!firebaseConfig.apiKey) {
            throw new Error("Firebase configuration not loaded correctly. Check server.js and .env file.");
        }

        // Inicializar Firebase
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth(); // Obtener el servicio de autenticación de Firebase

        console.log("Firebase inicializado correctamente desde firebase-auth.js");
        // Una vez inicializado, podemos añadir los event listeners a los botones
        addEventListeners();

    } catch (error) {
        console.error("Error al obtener la configuración de Firebase o al inicializar:", error);
        errorMessage.textContent = `Error de inicialización: ${error.message}. Asegúrate que el servidor está corriendo y el archivo .env configurado.`;
    }
}

// Función para añadir los listeners de eventos a los botones del formulario
function addEventListeners() {
    // Prevenir el envío por defecto del formulario para manejarlo con JS
    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
    });

    // Listener para el botón de Login
    loginButton.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        errorMessage.textContent = ''; // Limpiar mensajes de error previos

        if (!email || !password) {
            errorMessage.textContent = 'Por favor, introduce tu correo y contraseña.';
            return;
        }

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            console.log("Usuario ha iniciado sesión:", user.email);
            alert(`¡Bienvenido de nuevo, ${user.email}!`);
            window.location.href = "/html/dashboard.html";
        } catch (error) {
            console.error("Error al iniciar sesión:", error.code, error.message);
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage.textContent = 'No existe una cuenta con este correo.';
                    break;
                case 'auth/wrong-password':
                    errorMessage.textContent = 'Contraseña incorrecta.';
                    break;
                case 'auth/invalid-email':
                    errorMessage.textContent = 'El formato del correo electrónico es inválido.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage.textContent = 'Error de red. Por favor, revisa tu conexión a internet.';
                    break;
                default:
                    errorMessage.textContent = `Error al iniciar sesión: ${error.message}`;
            }
        }
    });

    // Listener para el botón de Registro
    signupButton.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        errorMessage.textContent = ''; // Limpiar mensajes de error previos

        if (!email || !password) {
            errorMessage.textContent = 'Por favor, introduce un correo y una contraseña.';
            return;
        }

        if (password.length < 6) {
            errorMessage.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            console.log("Usuario registrado:", user.email);
            alert(`¡Cuenta creada exitosamente para ${user.email}! Ya puedes iniciar sesión.`);
            // Opcionalmente, puedes loguear al usuario automáticamente después del registro
            // await auth.signInWithEmailAndPassword(email, password);
            // window.location.href = "/dashboard.html";
        } catch (error) {
            console.error("Error al registrar usuario:", error.code, error.message);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage.textContent = 'Este correo electrónico ya está en uso.';
                    break;
                case 'auth/invalid-email':
                    errorMessage.textContent = 'El formato del correo electrónico es inválido.';
                    break;
                case 'auth/weak-password':
                    errorMessage.textContent = 'La contraseña es demasiado débil. Necesita al menos 6 caracteres.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage.textContent = 'Error de red. Por favor, revisa tu conexión a internet.';
                    break;
                default:
                    errorMessage.textContent = `Error al registrar: ${error.message}`;
            }
        }
    });

    // Opcional: Escuchar cambios en el estado de autenticación (útil para actualizar la UI)
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("Usuario actualmente logueado:", user.email);
            // Puedes ocultar el formulario de login y mostrar un mensaje de bienvenida
            // document.getElementById('login-container').style.display = 'none';
            // O redirigir si el usuario ya está logueado al acceder a esta página
            // if (window.location.pathname === '/login.html') {
            //     window.location.href = "/dashboard.html";
            // }
        } else {
            console.log("Ningún usuario ha iniciado sesión.");
            // Asegúrate de que el formulario de login esté visible si no hay sesión
            // document.getElementById('login-container').style.display = 'block';
        }
    });
}

// Iniciar la aplicación de Firebase al cargar la página
// Este es el punto de entrada para toda la lógica de autenticación
initializeFirebase();