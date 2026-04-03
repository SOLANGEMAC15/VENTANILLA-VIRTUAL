// LÓGICA DE NAVEGACIÓN ENTRE SECCIONES
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

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'es',

        events: function(fetchInfo, successCallback, failureCallback) {
            const local = document.getElementById('area-admin').value;
            fetch(`obtener_reservas.php?local=${encodeURIComponent(local)}`)
                .then(response => response.json())
                .then(data => successCallback(data))
                .catch(error => failureCallback(error));
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

        // CLICK EN RESERVA
        eventClick: function(info) {
            const datos = info.event.extendedProps;
            let botones = {};
            
            // CONTROL SEGÚN ESTADO
            if (datos.estado === "Pendiente de pago" || datos.estado === "Pagado") {
                botones = {
                    showDenyButton: true,
                    confirmButtonText: 'Aprobar',
                    denyButtonText: 'Rechazar',
                    confirmButtonColor: '#28a745',
                    denyButtonColor: '#dc3545'
                };
            } else {
                // Si ya está aprobado o rechazado
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

                // APROBAR
                if (result.isConfirmed) {
                    
                    // OPCIONAL: SOLO APROBAR SI ESTÁ PAGADO
                    if (datos.estado !== "Pagado") {
                        Swal.fire('Error', 'Primero debe estar PAGADO', 'warning');
                        return;
                    }
                    
                    fetch('actualizar_estado.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            codigo: datos.codigo,
                            estado: 'Aprobado'
                        })
                    })
                    .then(res => res.text())
                    .then(respuesta => {
                        if (respuesta === "ok") {
                            
                            info.event.setProp('classNames', ['reserva-aprobada']);
                            info.event.setExtendedProp('estado', 'Aprobado');
                            
                            Swal.fire('Aprobado', 'La reserva fue aprobada.', 'success');
                        
                        } else {
                            Swal.fire('Error', 'No se pudo actualizar', 'error');
                        }
                    });
                }
                
                // RECHAZAR
                else if (result.isDenied) {
                    
                    Swal.fire({
                        title: 'Motivo de rechazo',
                        input: 'textarea',
                        showCancelButton: true,
                        confirmButtonText: 'Confirmar'
                    }).then((motivoResult) => {
                        
                        if (motivoResult.isConfirmed) {
                            
                            fetch('actualizar_estado.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                },
                                body: new URLSearchParams({
                                    codigo: datos.codigo,
                                    estado: 'Rechazado',
                                    motivo: motivoResult.value
                                })
                            })
                            .then(res => res.text())
                            .then(respuesta => {
                                
                                if (respuesta === "ok") {
                                    info.event.remove();
                                    
                                    Swal.fire('Rechazado', 'Reserva eliminada.', 'success');
                                
                                } else {
                                    Swal.fire('Error', 'No se pudo rechazar', 'error');
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    calendar.render();

    document.getElementById('area-admin').addEventListener('change', function() {
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