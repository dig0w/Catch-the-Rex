<?php
header("Content-Type: application/json");

//error debugging:
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

//Database stuff:
$env = parse_ini_file('.env');

$servername = $env['SERVERNAME'];
$username = $env['USERNAME'];
$password = $env['PASSWORD'];
$dbname = $env['DATABASE'];

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 10";
    $result = $conn->query($sql);
    $scores = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $scores[] = $row;
        }
    }
    $conn->close();
    echo json_encode($scores);

} else if ($_SERVER["REQUEST_METHOD"] == "POST"){
    $json = file_get_contents('php://input');
    
    $data = json_decode($json, true);
    if(isset($data['name']) && isset($data['score'])){
        $name = $data['name'];
        $score = $data['score'];

        // Create connection
        $conn = new mysqli($servername, $username, $password, $dbname);
        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        $sql = "INSERT INTO leaderboard (name, score) VALUES ('$name', '$score')";

        if ($conn->query($sql) === TRUE) {
            echo json_encode([
                "status" => "success",
                "message" => "New record created successfully"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Error: " . $sql . "<br>" . $conn->error
            ]);
        }

        $conn->close();
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Name and score are required"
        ]);
    }
}

// echo json_encode([
//     "version" => "1.0.0",
//     "author" => "mreng",
//     "description" => "API for Dino Game Leaderboard"
// ]);
?>