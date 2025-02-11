<?php
function makeCurlRequest($endpoint, $method = 'GET', $data = null, $headers = []) {
    // Initialize cURL session
    $curl = curl_init();
    
    // Default headers
    $defaultHeaders = [
        'Accept: application/json',
        'Content-Type: application/json'
    ];
    
    // Merge default headers with custom headers
    $finalHeaders = array_merge($defaultHeaders, $headers);
    
    // Basic cURL options
    $options = [
        CURLOPT_URL => $endpoint,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_HTTPHEADER => $finalHeaders,
        CURLOPT_CUSTOMREQUEST => strtoupper($method)
    ];
    
    // Handle data for POST, PUT, PATCH methods
    if (in_array(strtoupper($method), ['POST', 'PUT', 'PATCH']) && !is_null($data)) {
        $options[CURLOPT_POSTFIELDS] = is_array($data) ? json_encode($data) : $data;
    }
    
    // Set all cURL options
    curl_setopt_array($curl, $options);
    
    // Execute cURL request
    $response = curl_exec($curl);
    $err = curl_error($curl);
    
    // Get HTTP status code
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    // Close cURL session
    curl_close($curl);
    
    // Handle errors
    if ($err) {
        return [
            'success' => false,
            'error' => $err,
            'status_code' => $httpCode
        ];
    }
    
    // Return successful response
    return [
        'success' => true,
        'data' => json_decode($response, true),
        'status_code' => $httpCode
    ];
}

// Usage examples:

// GET Request
// $getResponse = makeCurlRequest(
//     'https://api.example.com/users',
//     'GET'
// );

// POST Request with data
// $postData = [
//     'name' => 'John Doe',
//     'email' => 'john@example.com'
// ];
// $postResponse = makeCurlRequest(
//     'https://api.example.com/users',
//     'POST',
//     $postData
// );

// PUT Request with data and custom headers
// $putData = [
//     'name' => 'John Updated'
// ];
// $customHeaders = [
//     'Authorization: Bearer your-token-here'
// ];
// $putResponse = makeCurlRequest(
//     'https://api.example.com/users/123',
//     'PUT',
//     $putData,
//     $customHeaders
// );

// DELETE Request
// $deleteResponse = makeCurlRequest(
//     'https://api.example.com/users/123',
//     'DELETE'
// );