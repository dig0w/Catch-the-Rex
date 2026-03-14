<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://dino.mreng.cf");
header("Access-Control-Allow-Methods: POST, GET");

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
    if (isset($_GET["ticket"])) {
        // Clean up old tickets
        $conn->query("DELETE FROM game_tickets WHERE expires_at < NOW()");

        // Generate ticket
        $ticket = bin2hex(random_bytes(16));
        $expires = date("Y-m-d H:i:s", strtotime("+10 seconds"));

        $stmt = $conn->prepare("INSERT INTO game_tickets (ticket, expires_at) VALUES (?, ?)");
        $stmt->bind_param("ss", $ticket, $expires);

        if ($stmt->execute()) {
            echo json_encode(["ticket" => $ticket]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Could not generate ticket"]);
        }
        $stmt->close();
    } else if (isset($_GET["scores"])) {
        // Retrun top $limit scores
        $limit = (int)$_GET["scores"];
        if ($limit <= 0 || $limit > 15) $limit = 10;

        $sql = "SELECT name, score
                    FROM leaderboard
                    ORDER BY score DESC
                    LIMIT ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $limit);
        $stmt->execute();
        $result = $stmt->get_result();

        $scores = [];
        while($row = $result->fetch_assoc()) {
            $scores[] = $row;
        }

        echo json_encode($scores);
        $stmt->close();
    } else {
        echo json_encode(["message" => "Missing type"]);
    }
} else if ($_SERVER["REQUEST_METHOD"] == "POST"){
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if(isset($data['name'], $data['score'], $data['ticket'], $data['sig'])){
        // Ticket validation
        $ticket = $data['ticket'];
        $tStmt = $conn->prepare("SELECT id FROM game_tickets WHERE ticket = ? AND expires_at > NOW()");
        $tStmt->bind_param("s", $ticket);
        $tStmt->execute();
        $tResult = $tStmt->get_result();

        if ($tResult->num_rows === 0) {
            echo json_encode(["status" => "error", "message" => "Invalid or expired ticket."]);
            exit;
        }
        $tStmt->close();

        // Verify HMAC signature
        $clientSig = $data['sig'];
        $secret = "f1ce7bdcddb3a098f1684d46db62610c";
        $expectedSig = base64_encode($data['name'] . ":" . $data['score'] . ":" . $ticket . ":" . $secret);

        if ($clientSig !== $expectedSig) {
            echo json_encode(["status" => "error", "message" => "Integrity check failed."]);
            exit;
        }

        // Clean up values
        $name = substr(trim($data['name']), 0, 20);
        if (empty($name)) $name = "Anonymous";

        $score = (int)$data['score'];
        if ($score > 99999) {
            $score = 99999;
        }

        // Store entry
        $stmt = $conn->prepare("INSERT INTO leaderboard (name, score, created_at) VALUES (?, ?, NOW())");
        $stmt->bind_param("si", $name, $score);

        if ($stmt->execute()) {
            $delStmt = $conn->prepare("DELETE FROM game_tickets WHERE ticket = ?");
            $delStmt->bind_param("s", $ticket);
            $delStmt->execute();
            $delStmt->close();

            echo json_encode([
                "status" => "success",
                "message" => "Score saved successfully"
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
            "message" => "Missing required fields"
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