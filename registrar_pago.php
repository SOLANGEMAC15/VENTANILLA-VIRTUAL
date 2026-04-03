<?php
include("conexion.php");

$codigo = $_POST['codigo'];

$sql = "UPDATE reservas SET estado='Pagado' WHERE codigo='$codigo'";

if ($conn->query($sql) === TRUE) {
    echo "ok";
} else {
    echo "error";
}

$conn->close();
?>