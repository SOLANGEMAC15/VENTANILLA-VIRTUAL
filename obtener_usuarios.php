<?php
include("conexion.php");

$sql = "SELECT * FROM usuarios";
$result = $conn->query($sql);

$usuarios = [];

while($row = $result->fetch_assoc()) {
    $usuarios[] = [
        "id" => $row['id'],
        "usuario" => $row['usuario'],
        "contraseña" => $row['contraseña']
    ];
}

echo json_encode($usuarios);

$conn->close();
?>