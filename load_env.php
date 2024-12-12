<?php

function loadEnv($filePath)
{
    if (!file_exists($filePath)) {
        throw new Exception("Environment file not found: $filePath");
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue; // Skip comments
        }

        $keyValue = explode('=', $line, 2);
        if (count($keyValue) !== 2) {
            continue; // Skip invalid lines
        }

        $key = trim($keyValue[0]);
        $value = trim($keyValue[1]);

        // Remove quotes if present
        $value = trim($value, "'\"");
        
        // Set to $_ENV
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

// Usage:
loadEnv(__DIR__ . '/.env');

// Access variables:
$dbHost = $_ENV['DB_HOST'];
$dbUser = $_ENV['DB_USER'];
$dbPass = $_ENV['DB_PASS'];

?>