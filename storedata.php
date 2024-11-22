<?php
// Database configuration
$host = "localhost"; // Change this to your database host
$dbname = "water_quality"; // Your database name
$username = "root"; // Your database username
$password = ""; // Your database password

// Connect to the database
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Read POST data
$pH = isset($_POST['pH']) ? $_POST['pH'] : null;
$turbidity = isset($_POST['turbidity']) ? $_POST['turbidity'] : null;
$conductivity = isset($_POST['conductivity']) ? $_POST['conductivity'] : null;

// Validate data
if ($pH !== null && $turbidity !== null && $conductivity !== null) {
    // Prepare and execute the SQL statement
    $stmt = $conn->prepare("INSERT INTO sensor_data (pH, turbidity, conductivity, timestamp) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("ddd", $pH, $turbidity, $conductivity);

    if ($stmt->execute()) {
        echo "Data saved successfully";
    } else {
        echo "Error: " . $stmt->error;
    }
    $stmt->close();
} else {
    echo "Invalid data";
}

// Close the connection
$conn->close();
?>
