function ver(s) {
    // Usamos 'flex' en lugar de 'block' para que respete el diseño estirado
    document.getElementById('seccion-calendario').style.display = s === 'calendario' ? 'flex' : 'none';
    document.getElementById('seccion-usuarios').style.display = s === 'usuarios' ? 'flex' : 'none';
    
    document.getElementById('btn-cal').className = s === 'calendario' ? 'active' : '';
    document.getElementById('btn-usu').className = s === 'usuarios' ? 'active' : '';
    
    if(s === 'calendario') {
        window.dispatchEvent(new Event('resize'));
    }
}

document.addEventListener('DOMContentLoaded', function() {
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

        eventClick: function(info) {
            Swal.fire({
                title: 'Gestión de Reserva',
                text: `Solicitante: ${info.event.title}`,
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Aprobar',
                denyButtonText: 'Eliminar',
                confirmButtonColor: '#28a745',
                denyButtonColor: '#dc3545'
            }).then((result) => {
                if (result.isConfirmed) {
                    info.event.setProp('backgroundColor', '#2c5697');
                    Swal.fire('Reserva Aprobada', '', 'success');
                } else if (result.isDenied) {
                    info.event.remove();
                    Swal.fire('Reserva Eliminada', '', 'info');
                }
            });
        }
    });
    calendar.render();
});

function agregarCajera() {
    const u = document.getElementById('new-u').value;
    const p = document.getElementById('new-p').value;
    
    if(u && p) {
        const fila = `
            <tr>
                <td><b>${u}</b></td>
                <td><span class="badge-rol">Caja</span></td>
                <td><code>${p}</code></td>
                <td><button class="btn-delete" onclick="this.closest('tr').remove()">ELIMINAR</button></td>
            </tr>`;
        document.getElementById('tbody-usuarios').innerHTML += fila;
        Swal.fire('¡Listo!', `Cajera ${u} creada.`, 'success');
        document.getElementById('new-u').value = '';
        document.getElementById('new-p').value = '';
    } else {
        Swal.fire('Atención', 'Ingresa usuario y contraseña', 'warning');
    }
}