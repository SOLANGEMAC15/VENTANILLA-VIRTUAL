<?php
include("conexion.php");

$codigo = $_GET['codigo'];

$sql = "SELECT * FROM reservas WHERE codigo='$codigo' LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    echo json_encode([
        "ok" => true,
        "nombres" => $row['nombres'],
        "apellidos" => $row['apellidos'],
        "monto" => $row['monto'],
        "estado" => $row['estado']
    ]);
} else {
    echo json_encode(["ok" => false]);
}

$conn->close();
?>