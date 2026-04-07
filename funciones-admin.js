let codigoPendiente = null;
let calendar;

function ver(s) {
    document.getElementById('seccion-calendario').style.display = s === 'calendario' ? 'flex' : 'none';
    document.getElementById('seccion-usuarios').style.display = s === 'usuarios' ? 'flex' : 'none';
    
    document.getElementById('btn-cal').className = s === 'calendario' ? 'active' : '';
    document.getElementById('btn-usu').className = s === 'usuarios' ? 'active' : '';
    
    if(s === 'calendario') {
        window.dispatchEvent(new Event('resize'));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // CONFIGURACIÓN DEL CALENDARIO 
    var calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'es',

        events: function(fetchInfo, successCallback, failureCallback) {
            const local = document.getElementById('area-admin').value;
            const tipo = document.getElementById('filtro-tipo').value;
            fetch(`obtener_reservas.php?local=${encodeURIComponent(local)}&tipo=${tipo}`)
                .then(response => response.json())
                .then(data => successCallback(data))
                .catch(error => failureCallback(error));
        },

        eventDidMount: function(info) {
        const estado = (info.event.extendedProps.estado || "").trim().toLowerCase();
        const tipo = (info.event.extendedProps.tipo || "").trim().toLowerCase();

        if (tipo.includes("concesion")) {
            if (estado.includes("aprobado")) {
                info.el.style.backgroundColor = "#2c5697";
            } else if (estado.includes("rechazado")) {
                info.el.style.backgroundColor = "#dc3545";
            } else {
                info.el.style.backgroundColor = "#6c757d";
            }
            info.el.style.color = "#fff";
            return;
        }

        if (estado.includes("aprobado")) {
            info.el.style.backgroundColor = "#2c5697";
        } 
        else if (estado.includes("rechazado")) {
            info.el.style.backgroundColor = "#dc3545";
        } 
        else if (estado.includes("pendiente")) {
            info.el.style.backgroundColor = "#ffc107";
        } 
        else if (estado.includes("pagado")) {
            info.el.style.backgroundColor = "#28a745";
        }
    },

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

        // HORAS
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

        eventContent: function(arg) {
            let info = arg.event.extendedProps;
            
            return {
                html: `
                <div style="font-size: 0.7rem; padding: 2px; line-height:1.2;">
                <b>${arg.event.title}</b><br>
                <span>${arg.timeText}</span><br>
                <span>${info.tipo}</span><br>
                <span style="font-weight:bold; color:#fff;">${info.estado}</span>
                </div>`
            };
        },

        eventsSet: function(eventos) {
            
            console.log("Eventos cargados:", eventos.map(e => e.extendedProps));
            console.log("Buscando código:", codigoPendiente);
            
            if (!codigoPendiente) return;
            
            const evento = eventos.find(ev => 
                String(ev.extendedProps.codigo) === String(codigoPendiente)
            );
            
            if (evento) {
                console.log("Evento encontrado:", evento);
                
                setTimeout(() => {
                    abrirDetalleEvento(evento);
                }, 300);

                codigoPendiente = null;
            } else {
                console.log("⏳ Aún no se encuentra el evento...");
            }
        },

        // CLICK EN RESERVA
        eventClick: function(info) {
            abrirDetalleEvento(info.event);
        }
    });

    calendar.render();

    cargarNotificaciones();

    setInterval(() => {
        calendar.refetchEvents();
    }, 5000);

    document.getElementById('area-admin').addEventListener('change', function() {
        calendar.refetchEvents();
    });

    document.getElementById('filtro-tipo').addEventListener('change', function() {
        cargarNotificaciones();
        calendar.refetchEvents();
    });

    cargarCajeras();
});

    // MOSTRAR / OCULTAR CONTRASEÑA
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('new-p');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {

            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

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

// FUNCIÓN CAJERA
function cargarCajeras() {
    fetch('obtener_usuarios.php')
    .then(res => res.json())
    .then(data => {

        console.log(data);

        const tbody = document.getElementById('tbody-usuarios');
        tbody.innerHTML = '';

        data.forEach(u => {
            const fila = `
            <tr>
                <td><b>${u.usuario}</b></td>
                <td><span class="badge-rol">Caja</span></td>
                <td><code>${u.contraseña}</code></td>
                <td>
                    <button class="btn-delete" onclick="eliminarCajera(${u.id})">
                        ELIMINAR
                    </button>
                </td>
            </tr>`;
            
            tbody.insertAdjacentHTML('beforeend', fila);
        });

    });
}

function agregarCajera() {

    const u = document.getElementById('new-u').value.trim();
    const p = document.getElementById('new-p').value.trim();

    if (!u || !p) {
        Swal.fire('Atención', 'Completa los campos', 'warning');
        return;
    }

    fetch('crear_usuario.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            usuario: u,
            password: p
        })
    })
    .then(res => res.text())
    .then(resp => {

        if (resp === "ok") {
            Swal.fire('Éxito', 'Cajera creada', 'success');
            cargarCajeras();

            document.getElementById('new-u').value = '';
            document.getElementById('new-p').value = '';
        } else {
            Swal.fire('Error', 'No se pudo crear', 'error');
        }

    });
}

function eliminarCajera(id) {

    Swal.fire({
        title: '¿Eliminar usuario?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        confirmButtonColor: '#dc3545'
    }).then((result) => {

        if (result.isConfirmed) {

            fetch('eliminar_usuario.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    id: id
                })
            })
            .then(res => res.text())
            .then(resp => {

                if (resp === "ok") {
                    Swal.fire('Eliminado', 'Usuario eliminado', 'success');
                    cargarCajeras();
                } else {
                    Swal.fire('Error', 'No se pudo eliminar', 'error');
                }

            });
        }
    });
}

function cargarNotificaciones() {
    
    const tipo = document.getElementById('filtro-tipo').value;
    fetch(`obtener_notificaciones.php?tipo=${tipo}`)
    .then(res => res.json())
    .then(data => {

        const contenedor = document.getElementById('lista-notificaciones');
        contenedor.innerHTML = '';

        data.forEach(n => {
            const hora = n.hora_inicio.substring(0,5);

            const div = document.createElement('div');
            div.classList.add('notificacion-item');
            
            let mensaje = "";            
            if (n.tipo === "Concesión") {
                mensaje = `<b>${n.nombres.split(' ')[0]}</b> solicitó concesión`;
                div.style.backgroundColor = "#f1f3f5";
                div.style.color = "#333";
                div.style.borderLeft = "5px solid #6c757d"; 
            } else {
                mensaje = `<b>${n.nombres.split(' ')[0]}</b> pagó su reserva`;
                div.style.backgroundColor = "#e6f4ea";
                div.style.color = "#155724";
                div.style.borderLeft = "5px solid #28a745";
                }
                div.innerHTML = `
                ${mensaje}<br>
                <small>${n.local} - ${hora} (${n.fecha})</small>
                `;
            
            div.addEventListener('click', () => {
                irAReserva(n.codigo, n.fecha, n.local);
            });
            
            contenedor.appendChild(div);
        });

    });
}

function irAReserva(codigo, fecha, local) {
    
    console.log("Código que llega:", codigo);

    ver('calendario');
    document.getElementById('area-admin').value = local;

    codigoPendiente = codigo;
    calendar.gotoDate(fecha);
    calendar.refetchEvents();

}

function abrirDetalleEvento(evento) {

    const datos = evento.extendedProps;
    let botones = {};

    if (datos.estado === "Pendiente de pago" || datos.estado === "Pagado" || datos.estado === "Pendiente de evaluación") {
        botones = {
            showDenyButton: true,
            confirmButtonText: 'Aprobar',
            denyButtonText: 'Rechazar',
            confirmButtonColor: '#28a745',
            denyButtonColor: '#dc3545'
        };
    } else {
        botones = {
            showConfirmButton: false,
            showDenyButton: false
        };
    }

    Swal.fire({
        title: 'Detalle de Reserva',
        html: `
        <b>Código:</b> ${datos.codigo}<br>        
        <b>Nombre:</b> ${datos.nombres} ${datos.apellidos}<br>
        <b>DNI:</b> ${datos.dni}<br>
        <b>Celular:</b> ${datos.celular}<br>
        <b>Correo:</b> ${datos.correo}<br>
        <b>Ubicación:</b> ${datos.ubicacion}<br>
        <b>Actividad:</b> ${datos.actividad}<br>
        <b>Tipo:</b> ${datos.tipo}<br>
        <b>Estado:</b> <b>${datos.estado}</b>
        `,
        showCloseButton: true,
        ...botones
    }).then((result) => {

        if (result.isConfirmed) {

            if (datos.tipo !== "Concesión" && datos.estado !== "Pagado") {
                Swal.fire('Error', 'Primero debe estar PAGADO', 'warning');
                return;
            }

            fetch('actualizar_estado.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({
                    codigo: datos.codigo,
                    estado: 'Aprobado'
                })
            })
            .then(res => res.text())
            .then(resp => {
                if (resp === "ok") {
                    evento.setExtendedProp('estado', 'Aprobado');
                    eliminarNotificacion(datos.codigo);
                    Swal.fire('Aprobado', 'Reserva aprobada', 'success');
                }
            });
        }

        else if (result.isDenied) {

            Swal.fire({
                title: 'Motivo de rechazo',
                input: 'textarea',
                showCancelButton: true
            }).then(r => {

                if (r.isConfirmed) {

                    fetch('actualizar_estado.php', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        body: new URLSearchParams({
                            codigo: datos.codigo,
                            estado: 'Rechazado',
                            motivo: r.value
                        })
                    })
                    .then(res => res.text())
                    .then(resp => {
                        if (resp === "ok") {
                            evento.remove();

                            eliminarNotificacion(datos.codigo); // 🔥 CLAVE

                            Swal.fire('Rechazado', 'Reserva eliminada', 'success');
                        }
                    });
                }
            });
        }
    });
}

function eliminarNotificacion(codigo) {
    fetch('eliminar_notificacion.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            codigo: codigo
        })
    })
    .then(() => {
        cargarNotificaciones();
    });
}

