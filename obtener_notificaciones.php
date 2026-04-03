<?php
include("conexion.php");

// Traer últimas reservas pagadas (últimas 10)
$sql = "SELECT nombres, local, hora_inicio, fecha 
        FROM reservas 
        WHERE estado = 'Pagado' 
        ORDER BY id DESC 
        LIMIT 10";

$result = $conn->query($sql);

$datos = [];

while($row = $result->fetch_assoc()) {
    $datos[] = $row;
}

echo json_encode($datos);
$conn->close();
?>