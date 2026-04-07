<?php
include("conexion.php");

$codigo = $_POST['codigo'];

$sql = "DELETE FROM notificaciones WHERE codigo='$codigo'";

if ($conn->query($sql) === TRUE) {
    echo "ok";
} else {
    echo "error";
}

$conn->close();
?>