document.addEventListener('DOMContentLoaded', function() {
    const parametrosURL = new URLSearchParams(window.location.search);
    const nombreArea = parametrosURL.get('area') || "LOCAL MUNICIPAL";
    
    const tituloArea = document.getElementById('area-titulo');
    if (tituloArea) { tituloArea.innerText = nombreArea.toUpperCase(); }

    const calendarEl = document.getElementById('calendar');
    const selectHora = document.getElementById('hora-inicio');
    const inputFecha = document.getElementById('fecha-reserva');

    const checkboxTodoDia = document.getElementById('todo-dia');
    const inputDuracion = document.getElementById('duracion');

    checkboxTodoDia.addEventListener('change', () => {
        if (checkboxTodoDia.checked) {
            inputDuracion.disabled = true;
            inputDuracion.value = '';

            selectHora.disabled = true;
            selectHora.value = "08"; 
        } else {
            inputDuracion.disabled = false;
            selectHora.disabled = false;
        }
    });
    
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

    const precios = {
        "Coliseo Lolo Fernández": 50,
        "Losa Deportiva Beto D'Laura": 20,    
        "Auditorio": 40
    };

    const nombreNormalizado = nombreArea.trim();

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

        eventDidMount: function(info) {
            const estado = info.event.extendedProps.estado;
            
            if (estado === "Aprobado") {
                info.el.style.backgroundColor = "#2c5697";
                } 
                else if (estado === "Rechazado") {
                    info.el.style.backgroundColor = "#dc3545"; 
                    } 
                    else if (estado === "Pendiente de pago") {
                        info.el.style.backgroundColor = "#ffc107"; 
                        } 
                        else if (estado === "Pagado") {
                            info.el.style.backgroundColor = "#28a745"; 
                            }
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

        events: `obtener_reservas.php?local=${encodeURIComponent(nombreArea)}`,
        eventOverlap: false,
    });

    calendar.render();

    document.getElementById('btn-reservar').onclick = function() {

        const ahora = new Date();
        const fechaSeleccionada = inputFecha.value;

        const duracionInputVal = inputDuracion.value;
        const esTodoDia = checkboxTodoDia.checked;

        let horaInicio = esTodoDia ? 8 : parseInt(selectHora.value);

        // VALIDACIÓN: HORARIO DE ATENCIÓN GENERAL
        if (ahora.getDay() === 0 || ahora.getDay() === 6 || ahora.getHours() < 8 || ahora.getHours() >= 17) {
            Swal.fire({ icon: 'error', title: 'Fuera de Horario', text: 'Atención de Lunes a Viernes de 8 a.m. a 5 p.m.', confirmButtonColor: '#2c5697' });
            return;
        }

        // NUEVA VALIDACIÓN: BLOQUEAR HORAS PASADAS DE HOY
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        
        const fechaSel = new Date(fechaSeleccionada);
        
        if (fechaSel < hoy) {
            Swal.fire({
                icon: 'error',
                title: 'Fecha inválida',
                text: 'No puedes reservar fechas pasadas.',
                confirmButtonColor: '#2c5697'
            });
            return;
        }
        
        // VALIDAR HORA SOLO SI ES HOY
        if (
            fechaSel.getTime() === hoy.getTime() &&
            horaInicio <= ahora.getHours()
        ) {
            Swal.fire({
                icon: 'error',
                title: 'Hora inválida',
                text: 'No puedes reservar una hora pasada.',
                confirmButtonColor: '#2c5697'
            });
            return;
        }

        if (!esTodoDia && (!duracionInputVal || parseInt(duracionInputVal) <= 0)) {
            Swal.fire({
                icon: 'error',
                title: 'Duración inválida',
                text: 'Ingrese una cantidad de horas válida o seleccione "Día completo".',
                confirmButtonColor: '#2c5697'
            });
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
        const tipoSolicitud = document.getElementById('tipo-solicitud').value;
        
        // VALIDACIÓN: CAMPOS OBLIGATORIOS
        if(!nombres || !apellidos || !dni || !celular || !correo || !ubicacion || !actividad || !fechaSeleccionada) {
            Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor, rellene todos los campos del formulario.', confirmButtonColor: '#2c5697' });
            return;
        }

        // VALIDACIÓN DNI Y CELULAR
        if (!/^\d{8}$/.test(dni)) {
            Swal.fire({ icon: 'error', title: 'DNI inválido', text: 'El DNI debe tener 8 números.', confirmButtonColor: '#2c5697' });
            return;
        }
        if (!/^\d{9}$/.test(celular)) {
            Swal.fire({ icon: 'error', title: 'Celular inválido', text: 'El celular debe tener 9 números.', confirmButtonColor: '#2c5697' });
            return;
        }

        let horaFinNum = esTodoDia ? 23 : horaInicio + parseInt(duracionInputVal);

        if (horaFinNum > 23) {
            Swal.fire({ icon: 'error', title: 'Horario excedido', text: 'La reserva no puede terminar después de las 11:00 p.m.', confirmButtonColor: '#2c5697' });
            return;
        }

        const precioHora = precios[nombreNormalizado] || 0;

        let horasTotales = esTodoDia ? (horaFinNum - horaInicio) : parseInt(duracionInputVal);

        let totalPagar = precioHora * horasTotales;

        let totalFormateado = totalPagar.toFixed(2);

        const inicioReserva = new Date(`${fechaSeleccionada}T${horaInicio < 10 ? '0'+horaInicio : horaInicio}:00:00`);
        const finReserva = new Date(`${fechaSeleccionada}T${horaFinNum < 10 ? '0'+horaFinNum : horaFinNum}:00:00`);

        const ocupado = calendar.getEvents().some(ev => 
            (inicioReserva < ev.end && finReserva > ev.start)
        );

        if (ocupado) {
            Swal.fire({ icon: 'error', title: 'No disponible', text: 'El horario ya está reservado.' });
        } else {
            const primerNombre = nombres.split(' ')[0];
            const nombreCompleto = `${nombres} ${apellidos}`;

            if (tipoSolicitud === "Concesión") {
                calendar.addEvent({
                    title: nombreCompleto,
                    start: inicioReserva,
                    end: finReserva,
                    className: 'reserva-concesion',
                    extendedProps: { tipo: tipoSolicitud, estado: 'Esperando respuesta', codigo: 'PENDIENTE' }
                });
                Swal.fire({ icon: 'info', title: 'Solicitud en revisión', text: 'Su solicitud de Concesión ha sido registrada.', confirmButtonColor: '#2c5697' });
            } else {
                const codigoReserva = generarCodigoUnico();

                // Enviar a la BD
                fetch('guardar_reserva.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },

                    body: new URLSearchParams({
                        nombres,
                        apellidos,
                        dni,
                        celular,
                        correo,
                        ubicacion,
                        actividad,
                        tipo: tipoSolicitud,
                        fecha: fechaSeleccionada,
                        hora_inicio: horaInicio + ":00:00",
                        hora_fin: horaFinNum + ":00:00",
                        estado: 'Pendiente de pago',
                        codigo: codigoReserva,
                        local: nombreArea,
                        monto: totalFormateado
                    })
                })

                .then(res => res.text())
                .then(data => {
                    console.log("Respuesta BD:", data);

                    if (data === "ocupado") {
                        Swal.fire({
                            icon: 'error',
                            title: 'Horario ocupado',
                            text: 'Ese horario ya está reservado en el sistema'
                        });
                        return;
                    }

                    if (data === "ok") {
                        calendar.addEvent({
                            title: primerNombre,
                            start: inicioReserva,
                            end: finReserva,
                            className: 'reserva-pendiente',
                            extendedProps: { tipo: tipoSolicitud, estado: 'Pendiente de pago', codigo: codigoReserva, local: nombreArea }
                        });

                        // Limpiar campos
                        document.getElementById('nombres').value = '';
                        document.getElementById('apellidos').value = '';
                        document.getElementById('dni').value = '';
                        document.getElementById('celular').value = '';
                        document.getElementById('correo').value = '';
                        document.getElementById('ubicacion').value = '';
                        document.getElementById('actividad').value = '';

                        Swal.fire({ 
                            icon: 'success', 
                            title: 'Reserva Registrada', 
                            html: `
                            <p>Código: <b>${codigoReserva}</b></p>
                            <p>Total a pagar: <b>S/ ${totalFormateado}</b></p>
                            <p>Descargue su ficha PDF para pagar en Caja.</p>
                            `,
                            confirmButtonText: 'Descargar PDF',                 
                            confirmButtonColor: '#2974b8'
                        
                        }).then((result) => {
                            if (result.isConfirmed) {
                                const { jsPDF } = window.jspdf;
                                const doc = new jsPDF();

                                // COLORES
                                const azul = [44, 86, 151];
                                const amarillo = [253, 216, 8];
                        
                                // ENCABEZADO                    
                                doc.setFillColor(azul[0], azul[1], azul[2]);
                                doc.rect(0, 0, 210, 30, 'F');
                        
                                doc.setFont("helvetica", "bold");
                                doc.setFontSize(16);
                                doc.setTextColor(255, 255, 255);
                                doc.text("MUNICIPALIDAD PROVINCIAL DE CAÑETE", 105, 12, { align: "center" });

                                doc.setFontSize(12);                        
                                doc.text("FICHA DE RESERVA - ALQUILER", 105, 20, { align: "center" });
                        
                                // SUBTÍTULO
                                doc.setTextColor(0, 0, 0);
                                doc.setFontSize(11);
                                doc.text(`Código de Reserva: ${codigoReserva}`, 20, 40);
                        
                                // LÍNEA DIVISORIA
                                doc.setDrawColor(200);
                                doc.line(20, 45, 190, 45);
                        
                                // DATOS DEL USUARIO
                                doc.setFont("helvetica", "bold");
                                doc.text("DATOS DEL SOLICITANTE", 20, 55);
                                doc.setFont("helvetica", "normal");
                                doc.setTextColor(80);
                        
                                doc.text(`Nombre completo: ${nombreCompleto}`, 20, 65);
                                doc.text(`DNI: ${dni}`, 20, 73);
                                doc.text(`Celular: ${celular}`, 20, 81);
                                doc.text(`Correo: ${correo}`, 20, 89);
                                doc.text(`Dirección: ${ubicacion}`, 20, 97);

                                // DATOS DE LA RESERVA                        
                                doc.setFont("helvetica", "bold");
                                doc.setTextColor(0);
                                doc.text("DETALLE DE LA RESERVA", 20, 110);
                        
                                doc.setFont("helvetica", "normal");
                                doc.setTextColor(80);
                        
                                doc.text(`Local: ${nombreArea}`, 20, 120);
                                doc.text(`Actividad: ${actividad}`, 20, 128);
                                doc.text(`Fecha: ${fechaSeleccionada}`, 20, 136);
                                doc.text(`Hora inicio: ${horaInicio}:00`, 20, 144);
                                doc.text(`Duración: ${esTodoDia ? "Día completo" : duracionInputVal + " hora(s)"}`, 20, 152);
                                doc.text(`Precio por hora: S/ ${precioHora}`, 20, 160);
                                doc.text(`Total a pagar: S/ ${totalFormateado}`, 20, 168);
                        
                                // CAJA DESTACADA (PAGO)
                                doc.setFillColor(amarillo[0], amarillo[1], amarillo[2]);
                                doc.rect(20, 180, 170, 25, 'F');
                                doc.setFont("helvetica", "bold");
                                doc.setTextColor(0);
                                doc.setFontSize(10);
                                doc.text("PRESENTAR ESTE DOCUMENTO EN CAJA PARA REALIZAR EL PAGO", 105, 190, { align: "center" });
                        
                                doc.setFont("helvetica", "normal");
                                doc.setFontSize(9);
                                doc.text("Este documento es válido únicamente para el trámite solicitado.", 105, 198, { align: "center" });
                        
                                // PIE DE PÁGINA (Fuera de la caja)
                                doc.setFontSize(10);
                                doc.setTextColor(120);
                                doc.text("Municipalidad Provincial de Cañete", 105, 215, { align: "center" });
                        
                                // GUARDAR
                                doc.save(`Reserva_Alquiler_${codigoReserva}.pdf`);
                    
                            }
                
                        });

                        calendar.refetchEvents();
                    }
                });
                
            }

        }

    };

});