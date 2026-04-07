<?php
include("conexion.php");

$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : "todos";

// Traer últimas reservas pagadas (últimas 10)
$sql = "SELECT codigo, nombres, local, hora_inicio, fecha, tipo, estado 
        FROM reservas 
        WHERE (estado = 'Pagado' OR estado = 'Pendiente de evaluación')";
        
if ($tipo !== "todos") {
    $tipo = $_GET['tipo'];
    $sql .= " AND tipo = '$tipo'";
}

$sql .= " ORDER BY id DESC LIMIT 10";

$result = $conn->query($sql);

$datos = [];

if ($result && $result->num_rows > 0) {

    while($row = $result->fetch_assoc()) {
        $datos[] = [
            "codigo" => $row['codigo'],
            "nombres" => $row['nombres'],
            "local" => $row['local'],
            "hora_inicio" => $row['hora_inicio'],
            "fecha" => $row['fecha'],
            "tipo" => $row['tipo'],
            "estado" => $row['estado']
        ];
    }

}

header('Content-Type: application/json');
echo json_encode($datos);

$conn->close();
?>