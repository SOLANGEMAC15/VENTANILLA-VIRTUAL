<?php
include("conexion.php");

// Recibir datos
$codigo = $conn->real_escape_string($_POST['codigo']);
$estado = $conn->real_escape_string($_POST['estado']);
$motivo = isset($_POST['motivo']) ? $conn->real_escape_string($_POST['motivo']) : null;

// Si es rechazo
if ($estado === "Rechazado") {

    $sql = "UPDATE reservas 
            SET estado='$estado', motivo_rechazo='$motivo' 
            WHERE codigo='$codigo'";

} else {

    $sql = "UPDATE reservas 
            SET estado='$estado', motivo_rechazo=NULL 
            WHERE codigo='$codigo'";
}

if ($conn->query($sql) === TRUE) {
    echo "ok";
} else {
    echo "error";
}

$conn->close();
?>