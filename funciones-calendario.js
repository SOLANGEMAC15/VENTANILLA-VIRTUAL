document.addEventListener('DOMContentLoaded', function() {
    const parametrosURL = new URLSearchParams(window.location.search);
    const nombreArea = parametrosURL.get('area') || "LOCAL MUNICIPAL";
    
    const tituloArea = document.getElementById('area-titulo');
    if (tituloArea) { tituloArea.innerText = nombreArea.toUpperCase(); }

    const calendarEl = document.getElementById('calendar');
    const selectHora = document.getElementById('hora-inicio');
    const inputFecha = document.getElementById('fecha-reserva');
    
    const hoyStr = new Date().toISOString().split('T')[0];
    inputFecha.setAttribute('min', hoyStr);
    inputFecha.value = hoyStr;

    for (let i = 8; i <= 22; i++) {
        let hourLabel = i >= 12 ? (i === 12 ? 12 : i - 12) + ":00 p.m." : i + ":00 a.m.";
        selectHora.add(new Option(hourLabel, i < 10 ? '0'+i : i));
    }

    function generarCodigoUnico() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {
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

        eventContent: function(arg) {
            let info = arg.event.extendedProps;
            return {
                html: `
                <div style="font-size: 0.7rem; padding: 2px; line-height: 1.1; overflow: hidden;">
                    <b>${arg.event.title}</b><br>
                    <span>${arg.timeText}</span><br>
                    <span>${info.tipo}</span><br>
                    <span style="font-weight: bold; color: #ffeb3b;">${info.estado}</span>
                </div>`
            };
        },

        events: [],
        eventOverlap: false,
    });

    calendar.render();

    document.getElementById('btn-reservar').onclick = function() {
        const ahora = new Date();
        if (ahora.getDay() === 0 || ahora.getDay() === 6 || ahora.getHours() < 8 || ahora.getHours() >= 23) {
            Swal.fire({ icon: 'error', title: 'Fuera de Horario', text: 'Atención de Lunes a Viernes de 8 a.m. a 5 p.m.', confirmButtonColor: '#2c5697' });
            return;
        }

        // CAPTURA DE DATOS
        const nombres = document.getElementById('nombres').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();
        const dni = document.getElementById('dni').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const ubicacion = document.getElementById('ubicacion').value.trim();
        const actividad = document.getElementById('actividad').value.trim();
        const fecha = inputFecha.value;
        const horaInicio = parseInt(selectHora.value); 
        const duracionVal = document.getElementById('duracion').value;
        const tipoSolicitud = document.getElementById('tipo-solicitud').value;
        
        // 1. VALIDACIÓN: TODOS LOS CAMPOS OBLIGATORIOS
        if(!nombres || !apellidos || !dni || !celular || !correo || !ubicacion || !actividad || !fecha) {
            Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor, rellene todos los campos del formulario.', confirmButtonColor: '#2c5697' });
            return;
        }

        // 2. VALIDACIÓN ESPECÍFICA: DNI (8 dígitos numéricos)
        const dniRegex = /^\d{8}$/;
        if (!dniRegex.test(dni)) {
            Swal.fire({ icon: 'error', title: 'DNI inválido', text: 'El DNI debe contener exactamente 8 números.', confirmButtonColor: '#2c5697' });
            return;
        }

        // 3. VALIDACIÓN ESPECÍFICA: CELULAR (9 dígitos numéricos)
        const celularRegex = /^\d{9}$/;
        if (!celularRegex.test(celular)) {
            Swal.fire({ icon: 'error', title: 'Celular inválido', text: 'El número de celular debe contener exactamente 9 números.', confirmButtonColor: '#2c5697' });
            return;
        }

        let horaFinNum = (duracionVal === "full") ? 23 : horaInicio + parseInt(duracionVal);

        if (horaFinNum > 23) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Horario excedido', 
                text: 'La reserva no puede terminar después de las 11:00 p.m.', 
                confirmButtonColor: '#2c5697' 
            });
            return;
        }

        const inicioReserva = new Date(`${fecha}T${horaInicio < 10 ? '0'+horaInicio : horaInicio}:00:00`);
        const finReserva = new Date(`${fecha}T${horaFinNum < 10 ? '0'+horaFinNum : horaFinNum}:00:00`);

        const ocupado = calendar.getEvents().some(ev => (inicioReserva < ev.end && finReserva > ev.start));

        if (ocupado) {
            Swal.fire({ icon: 'error', title: 'No disponible', text: 'El horario ya está reservado.' });
        } else {
            const nombreCompleto = `${nombres} ${apellidos}`;

            if (tipoSolicitud === "Concesión") {
                calendar.addEvent({
                    title: nombreCompleto,
                    start: inicioReserva,
                    end: finReserva,
                    className: 'reserva-concesion',
                    extendedProps: { tipo: tipoSolicitud, estado: 'Esperando respuesta', codigo: 'PENDIENTE' }
                });

                Swal.fire({
                    icon: 'info',
                    title: 'Solicitud en revisión',
                    text: 'Su solicitud de Concesión ha sido registrada. Debe esperar la respuesta del administrador.',
                    confirmButtonColor: '#2c5697'
                });

            } else {
                const codigoReserva = generarCodigoUnico();
                calendar.addEvent({
                    title: nombreCompleto,
                    start: inicioReserva,
                    end: finReserva,
                    className: 'reserva-pendiente',
                    extendedProps: { tipo: tipoSolicitud, estado: 'Pendiente de pago', codigo: codigoReserva }
                });
                
                Swal.fire({ 
                    icon: 'success', 
                    title: 'Reserva Registrada', 
                    html: `<p>Tipo: <b>Alquiler</b></p><p>Código: <b>${codigoReserva}</b></p><p>Descargue su ficha PDF para pagar en Caja.</p>`,
                    confirmButtonText: 'Descargar PDF',
                    confirmButtonColor: '#2974b8'
                }).then((result) => {
                    if (result.isConfirmed) {
                        const { jsPDF } = window.jspdf;
                        const doc = new jsPDF();
                        doc.setFontSize(18);
                        doc.text("MUNI VIRTUAL - FICHA DE RESERVA", 20, 20);
                        doc.setFontSize(12);
                        doc.text(`CÓDIGO DE PAGO: ${codigoReserva}`, 20, 35);
                        doc.text(`Solicitante: ${nombreCompleto}`, 20, 45);
                        doc.text(`DNI: ${dni} | Celular: ${celular}`, 20, 55);
                        doc.text(`Correo: ${correo}`, 20, 65);
                        doc.text(`Ubicación: ${ubicacion}`, 20, 75);
                        doc.text(`Local: ${nombreArea}`, 20, 85);
                        doc.text(`Actividad: ${actividad}`, 20, 95);
                        doc.text(`Fecha: ${fecha} | Hora: ${horaInicio}:00`, 20, 105);
                        doc.save(`Reserva_Alquiler_${codigoReserva}.pdf`);
                    }
                });
            }

            // Limpiar campos
            document.getElementById('nombres').value = '';
            document.getElementById('apellidos').value = '';
            document.getElementById('dni').value = '';
            document.getElementById('celular').value = '';
            document.getElementById('correo').value = '';
            document.getElementById('ubicacion').value = '';
            document.getElementById('actividad').value = '';
        }
    };
});