// 1. LÓGICA DE NAVEGACIÓN ENTRE SECCIONES
function ver(s) {
    document.getElementById('seccion-calendario').style.display = s === 'calendario' ? 'flex' : 'none';
    document.getElementById('seccion-usuarios').style.display = s === 'usuarios' ? 'flex' : 'none';
    
    document.getElementById('btn-cal').className = s === 'calendario' ? 'active' : '';
    document.getElementById('btn-usu').className = s === 'usuarios' ? 'active' : '';
    
    // Forzar redibujado del calendario para evitar que se vea gris al cambiar de pestaña
    if(s === 'calendario') {
        window.dispatchEvent(new Event('resize'));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // --- CONFIGURACIÓN DEL CALENDARIO ---
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'es',
        slotMinTime: '08:00:00',
        slotMaxTime: '23:00:00',
        allDaySlot: false,
        slotDuration: '01:00:00',
        height: 'auto',
        aspectRatio: 1.8, 
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,dayGridMonth'
        },
        buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana' },

        // Diseño de las etiquetas de hora (Ej: 8:00 a.m. - 9:00 a.m.)
        slotLabelContent: function(arg) {
            const format = (h) => {
                let p = h >= 12 ? 'p.m.' : 'a.m.';
                let d = h > 12 ? h - 12 : h;
                if (h === 0) d = 12;
                return `${d}:00 ${p}`;
            };
            let start = arg.date.getHours();
            let end = start + 1;
            return { 
                html: `<div style="font-size: 0.7rem; font-weight: 600; color: #2c5697; padding: 5px 0;">
                            ${format(start)} - ${format(end)}
                       </div>` 
            };
        },

        // Acción al hacer clic en una reserva
        eventClick: function(info) {
            Swal.fire({
                title: 'Gestión de Reserva',
                text: `Solicitante: ${info.event.title}`,
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Aprobar',
                denyButtonText: 'Eliminar',
                confirmButtonColor: '#28a745',
                denyButtonColor: '#dc3545',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    info.event.setProp('backgroundColor', '#2c5697'); // Cambia a azul oficial al aprobar
                    Swal.fire('Reserva Aprobada', 'El espacio ha sido confirmado.', 'success');
                } else if (result.isDenied) {
                    info.event.remove();
                    Swal.fire('Reserva Eliminada', 'La solicitud ha sido rechazada.', 'info');
                }
            });
        }
    });
    calendar.render();

    // --- NUEVA LÓGICA: MOSTRAR/OCULTAR CONTRASEÑA ---
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('new-p');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            // Cambiar el tipo de input
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Cambiar el icono visual
            const icon = document.getElementById('icon-eye');
            
            if (type === 'password') {
                icon.innerHTML = `
                <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                `;
            } else {
                icon.innerHTML = `
                <path d="M2 2l20 20M12 5c-7 0-10 7-10 7a18.4 18.4 0 0 0 5 5M9.5 9.5A3 3 0 0 0 12 15a3 3 0 0 0 2.5-5.5M17 17c2-1.5 3-5 3-5s-3-7-10-7"/>
                `;
            }
        });
    }
});

// 2. FUNCIÓN PARA AGREGAR NUEVA CAJERA A LA TABLA
function agregarCajera() {
    const u = document.getElementById('new-u').value.trim();
    const p = document.getElementById('new-p').value.trim();
    
    if(u && p) {
        const fila = `
            <tr>
                <td><b>${u}</b></td>
                <td><span class="badge-rol">Caja</span></td>
                <td><code>${p}</code></td>
                <td><button class="btn-delete" onclick="this.closest('tr').remove()">ELIMINAR</button></td>
            </tr>`;
        
        document.getElementById('tbody-usuarios').insertAdjacentHTML('beforeend', fila);
        
        Swal.fire('¡Usuario Creado!', `La cajera <b>${u}</b> ha sido registrada con éxito.`, 'success');
        
        // Limpiar campos y resetear el ojo
        document.getElementById('new-u').value = '';
        document.getElementById('new-p').value = '';
        document.getElementById('new-p').setAttribute('type', 'password');
        document.getElementById('togglePassword').textContent = '👁️';

    } else {
        Swal.fire('Atención', 'Debes ingresar un nombre de usuario y una contraseña.', 'warning');
    }
}