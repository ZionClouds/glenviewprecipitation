<?php
require_once 'curls.php';
// require_once 'load_env.php';
// loadEnv(__DIR__ . '/.env');

// $hostserver = $_ENV['DB_HOST'];
// $username = $_ENV['DB_USER'];
// $password = $_ENV['DB_PASS'];
// $dbName = "glenview_weather";

// $conn = new mysqli($hostserver, $username, $password, $dbName);
// if($conn->connect_error) {
//     die("Connection failed: " . $conn->connect_error);
// }

// $sql = "SELECT * from preciptation";
// $result = $conn->query($sql);

// if($result->num_rows > 0) {
//     while($row = $result->fetch_assoc()) {
//         print_r($row);
//     }
// } else {
//     echo "No Data";
// }

// $conn->close();

// $json = file_get_contents('data.json');
// if($json === false) {
//     die('Error reading the JSON file');
// }

define("API_URL", 'https://glenview-precipitation-backend-187517077947.us-central1.run.app');
$getResponse = makeCurlRequest(
    API_URL.'/retrieve_data',
    'GET'
);

if (!$getResponse['success']) {
    die("API Error: " . ($getResponse['error'] ?? 'Unknown error'));
}

// The data is already decoded in $getResponse['data']
$json_data = $getResponse['data'];

header('Content-Type: application/json');
echo json_encode($json_data);

// $json_data = json_decode($getResponse, true);
// if($json_data === null) {
//     die("Error decoding the JSON file");
// }

// // echo "<pre>";
// // print_r($json_data);
// // echo "</pre>";

// header('Content-Type: application/json');
// echo json_encode($json_data);

?>