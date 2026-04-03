<?php include("conexion.php"); 

// Recibir datos desde JS 
$nombres = $_POST['nombres']; 
$apellidos = $_POST['apellidos']; 
$dni = $_POST['dni']; 
$celular = $_POST['celular']; 
$correo = $_POST['correo']; 
$ubicacion = $_POST['ubicacion']; 
$actividad = $_POST['actividad']; 
$tipo = $_POST['tipo']; 
$fecha = $_POST['fecha']; 
$hora_inicio = $_POST['hora_inicio']; 
$hora_fin = $_POST['hora_fin']; 
$estado = $_POST['estado']; 
$codigo = $_POST['codigo']; 
$local = $conn->real_escape_string($_POST['local']);
$monto = $_POST['monto'];

// VALIDAR SI YA EXISTE RESERVA EN ESE HORARIO 
$verificar = "SELECT * FROM reservas 
WHERE fecha = '$fecha'
AND estado != 'Rechazado'
AND (
('$hora_inicio' < hora_fin) AND ('$hora_fin' > hora_inicio)
)";

$resultado = $conn->query($verificar); 

if ($resultado->num_rows > 0) { 
    echo "ocupado"; 
    exit; 
}
    
// Insertar en BD 
$sql = "INSERT INTO reservas 
(codigo, nombres, apellidos, dni, celular, correo, ubicacion, actividad, tipo, fecha, hora_inicio, hora_fin, estado, local, monto) 
VALUES 
('$codigo','$nombres','$apellidos','$dni','$celular','$correo','$ubicacion','$actividad','$tipo','$fecha','$hora_inicio','$hora_fin','$estado','$local', '$monto')"; 

if ($conn->query($sql) === TRUE) { 
    echo "ok"; 
    } else { 
        echo "error"; 
    } 
    $conn->close(); 
    ?>