<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://dino.mreng.cf");
//header("Access-Control-Allow-Origin: http://172.17.2.16");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");

// Anti-Cache Configuration (Defeats Cloudflare caching the GET requests)
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // If it's just the browser checking permissions, exit immediately with a 200 OK status
    http_response_code(200);
    exit();
}

session_set_cookie_params([
    'secure' => true,      // Tells the browser to only send the cookie over HTTPS
    'httponly' => true,    // Prevents JS from reading the session cookie (extra security)
    'samesite' => 'None'   // Crucial for cross-origin HTTPS cookies
]);

session_start();

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

        // Create a short-lived (1 second) ticket for score submission
        $_SESSION['ticket'] = bin2hex(random_bytes(8));
        $_SESSION['expires'] = time() + 10;

        echo json_encode($_SESSION['ticket']);

    } else if (isset($_GET["scores"])) {
        // Retrun top $limit scores and only the best score for each player
        $limit = (int)$_GET["scores"];
        if ($limit <= 0 || $limit > 15) $limit = 10;

        $sql = "SELECT name, MAX(score) as score
                    FROM leaderboard
                    GROUP BY name
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
        if (!isset($_SESSION['ticket']) || $_SESSION['ticket'] !== $data['ticket']) {
            echo json_encode(["status" => "error", "message" => "Invalid ticket." . $_SESSION['ticket'] . " vs " . $data['ticket']]);
            exit;
        }
        if (time() > $_SESSION['expires']) {
            echo json_encode(["status" => "error", "message" => "Ticket expired."]);
            exit;
        }

        // Verify HMAC signature
        $clientSig = $data['sig'];
        $secret = "f1ce7bdcddb3a098f1684d46db62610c";
        $expectedSig = base64_encode($data['name'] . ":" . $data['score'] . ":" . $data['ticket'] . ":" . $secret);

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
        $stmt = $conn->prepare("INSERT INTO leaderboard (name, score, timestamp) VALUES (?, ?, NOW())");
        $stmt->bind_param("si", $name, $score);

        if ($stmt->execute()) {
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
        http_response_code(400);
    }
}

$conn->close();

// echo json_encode([
//     "version" => "1.0.0",
//     "author" => "mreng",
//     "description" => "API for Dino Game Leaderboard"
// ]);
?>