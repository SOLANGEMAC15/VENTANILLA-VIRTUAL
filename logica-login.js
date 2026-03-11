document.getElementById('form-login').onsubmit = function(e) {
    e.preventDefault();
    const user = document.getElementById('usuario').value;
    const pass = document.getElementById('password').value;

    // Validación temporal (Esto se conectará a la base de datos después)
    if (user === "admin" && pass === "admin123") {
        Swal.fire('Bienvenido', 'Acceso como Administrador', 'success')
            .then(() => window.location.href = 'admin.html');
    } 
    else if (user.startsWith("cajera") && pass === "caja123") {
        Swal.fire('Bienvenido', 'Acceso al Módulo de Caja', 'success')
            .then(() => window.location.href = 'caja.html');
    } 
    else {
        Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
    }
};