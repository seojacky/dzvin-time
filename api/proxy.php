<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обробка preflight запитів
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Конфігурація API
$API_BASE = 'https://sheduleapi.kntu.pp.ua/api';

// Білий список дозволених endpoints
$ALLOWED_ENDPOINTS = [
    'faculties' => '/faculties/get-all',
    'groups' => '/groups/get-all-by-id-faculty',
    'cafedras' => '/cafedras/get-all-by-id-faculty',
    'instructors' => '/instructors/get-all-by-cafedra',
    'scheduleGroup' => '/schedule/group/get-all-by-day',
    'scheduleInstructor' => '/schedule/instructor/get-all-by-day'
];

// Отримання параметрів з запиту
$endpoint = $_GET['endpoint'] ?? '';
$params = $_GET;
unset($params['endpoint']); // Видаляємо endpoint з параметрів

// Валідація endpoint
if (empty($endpoint)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Missing endpoint parameter',
        'message' => 'Endpoint parameter is required'
    ]);
    exit;
}

if (!isset($ALLOWED_ENDPOINTS[$endpoint])) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Invalid endpoint',
        'message' => 'Endpoint not allowed',
        'endpoint' => $endpoint
    ]);
    exit;
}

// Формування URL для API запиту
$apiPath = $ALLOWED_ENDPOINTS[$endpoint];
$fullUrl = $API_BASE . $apiPath;

// Додавання параметрів до URL якщо є
if (!empty($params)) {
    $fullUrl .= '?' . http_build_query($params);
}

// Налаштування контексту для file_get_contents
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            'Accept: application/json',
            'Content-Type: application/json',
            'User-Agent: KNTU-Schedule-App/1.0'
        ],
        'timeout' => 10
    ]
]);

// Виконання запиту до справжнього API
$response = @file_get_contents($fullUrl, false, $context);

// Обробка помилок запиту
if ($response === false) {
    $error = error_get_last();
    http_response_code(500);
    echo json_encode([
        'error' => 'API request failed',
        'message' => 'Failed to fetch data from external API',
        'details' => $error['message'] ?? 'Unknown error'
    ]);
    exit;
}

// Перевірка чи отримали валідний JSON
$decoded = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Invalid JSON response',
        'message' => 'API returned invalid JSON',
        'json_error' => json_last_error_msg()
    ]);
    exit;
}

// Повертаємо успішний результат
echo $response;
?>