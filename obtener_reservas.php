<?php
include("conexion.php");

// Obtener el local desde la URL
$local = $_GET['local'] ?? '';

$sql = "SELECT * FROM reservas WHERE local = '$local'";
$result = $conn->query($sql);

$reservas = [];

while($row = $result->fetch_assoc()) {
    $reservas[] = [
        "title" => explode(" ", $row['nombres'])[0],
        "start" => $row['fecha'] . "T" . $row['hora_inicio'],
        "end" => $row['fecha'] . "T" . $row['hora_fin'],
        "extendedProps" => [
            "tipo" => $row['tipo'],
            "estado" => $row['estado']
        ],
        "className" => $row['tipo'] === "Alquiler" ? "reserva-pendiente" : "reserva-concesion"
    ];
}

echo json_encode($reservas);

$conn->close();
?>