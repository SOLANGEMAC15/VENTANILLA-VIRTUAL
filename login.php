<?php
include("conexion.php");

$usuario = $_POST['usuario'];
$password = $_POST['password'];

$sql = "SELECT * FROM usuarios WHERE usuario='$usuario' AND contraseña='$password'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    echo json_encode([
        "ok" => true,
        "rol" => $row['rol']
    ]);
} else {
    echo json_encode(["ok" => false]);
}

$conn->close();
?>