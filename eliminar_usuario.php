<?php
include("conexion.php");

$id = $_POST['id'];

$sql = "DELETE FROM usuarios WHERE id='$id'";

if ($conn->query($sql) === TRUE) {
    echo "ok";
} else {
    echo "error";
}

$conn->close();
?>