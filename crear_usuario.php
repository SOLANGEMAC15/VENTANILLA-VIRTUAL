<?php
include("conexion.php");

$usuario = $_POST['usuario'];
$password = $_POST['password'];

$sql = "INSERT INTO usuarios (usuario, contraseña, rol)
VALUES ('$usuario', '$password', 'cajera')";

if ($conn->query($sql) === TRUE) {
    echo "ok";
} else {
    echo "error";
}

$conn->close();
?>