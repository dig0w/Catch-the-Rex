<?php
header("Content-Type: application/json");

// Error debugging
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// Database stuff
$env = parse_ini_file('.env');

$servername = $env['SERVERNAME'];
$username = $env['USERNAME'];
$password = $env['PASSWORD'];
$dbname = $env['DATABASE'];

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $sql = "SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 10";
    $result = $conn->query($sql);
    $scores = [];

    while($row = $result->fetch_assoc()) {
        $scores[] = $row;
    }

    echo json_encode($scores);
} else if ($_SERVER["REQUEST_METHOD"] == "POST"){
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if(isset($data['name']) && isset($data['score'])){
        $name = substr(trim($data['name']), 0, 20);
        if (empty($name)) $name = "Anonymous";

        $score = (int)$data['score'];
        if ($score > 99999) {
            $score = 99999;
        }

        $stmt = $conn->prepare("INSERT INTO leaderboard (name, score, created_at) VALUES (?, ?, NOW())");
        $stmt->bind_param("si", $name, $score);

        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "New record saved successfully"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Database error: " . $stmt->error
            ]);
        }
        $stmt->close();
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Name and score are required"
        ]);
    }
}

$conn->close();

// echo json_encode([
//     "version" => "1.0.0",
//     "author" => "mreng",
//     "description" => "API for Dino Game Leaderboard"
// ]);
?>