<?php
include("conexion.php");

// Obtener el local desde la URL
$local = $conn->real_escape_string($_GET['local'] ?? '');

$tipo = $_GET['tipo'] ?? 'todos';

$sql = "SELECT * FROM reservas 
        WHERE local = '$local'
        AND estado != 'Rechazado'";

if ($tipo !== "todos") {
    $sql .= " AND tipo = '$tipo'";
}

$result = $conn->query($sql);

$reservas = [];

while($row = $result->fetch_assoc()) {

    // DEFINIR COLOR SEGÚN ESTADO
    if ($row['estado'] === "Aprobado") {
    $clase = "reserva-aprobada";
    } elseif ($row['estado'] === "Pagado") {
    $clase = "reserva-pagada";
    } elseif ($row['estado'] === "Rechazado") {
    $clase = "reserva-rechazada";
    } else {
    $clase = "reserva-pendiente";
    }

    // CREAR EVENTO
    $reservas[] = [
        "title" => explode(" ", $row['nombres'])[0],
        "start" => $row['fecha'] . "T" . $row['hora_inicio'],
        "end" => $row['fecha'] . "T" . $row['hora_fin'],
        "extendedProps" => [
            "tipo" => $row['tipo'],
            "estado" => $row['estado'],
            "nombres" => $row['nombres'],
            "apellidos" => $row['apellidos'],
            "dni" => $row['dni'],
            "celular" => $row['celular'],
            "correo" => $row['correo'],
            "ubicacion" => $row['ubicacion'],
            "actividad" => $row['actividad'],
            "codigo" => $row['codigo'],
            "local" => $row['local']
        ],
        "className" => $clase
    ];
}

echo json_encode($reservas);

$conn->close();
?>