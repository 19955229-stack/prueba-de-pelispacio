document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");
  const message = document.getElementById("message");

  let intentos = 0; // Contador de intentos

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = loginEmail.value;
    const password = loginPassword.value;

    // Validación de las dos únicas cuentas permitidas
    const esAdmin67 = email === "administrador67@gmail.com" && password === "chock000";
    const esAdmin68 = email === "administrador68@gmail.com" && password === "chock123";

    if (esAdmin67 || esAdmin68) {
      // Credenciales correctas: Redirige a la página hogar.html
      window.location.href = "hogar.html";
    } else {
      // Credenciales incorrectas
      intentos++;

      if (intentos >= 3) {
        // Bloqueo tras 3 intentos fallidos
        message.style.color = "red";
        message.textContent = "Has superado el límite de 3 intentos. Acceso bloqueado.";
        
        alert("¡Has alcanzado el máximo de 3 intentos fallidos!");

        // Deshabilitar el formulario
        loginEmail.disabled = true;
        loginPassword.disabled = true;
        document.getElementById("btn-entrar-link").disabled = true;
      } else {
        // Mostrar alerta y mensaje de error en rojo con los intentos restantes
        message.style.color = "red";
        message.textContent = `Correo o contraseña incorrectos. Llevas ${intentos} de 3 intentos.`;
        
        alert(`Correo o contraseña incorrectos. Te quedan ${3 - intentos} intento(s).`);
      }
    }
  });
});