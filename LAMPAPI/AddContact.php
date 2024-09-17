<?php
    $inData = getRequestInfo();

    if (!isset($inData["name"]) || !isset($inData["phone"]) || !isset($inData["email"]) || !isset($inData["userId"])) {
        returnWithError("Missing required data");
    }

    $name = $inData["name"];
    $phone = $inData["phone"];
    $email = $inData["email"];
    $userId = $inData["userId"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

    if ($conn->connect_error) {
        error_log("Connection failed: " . $conn->connect_error);
        returnWithError($conn->connect_error);
    }

    $stmt = $conn->prepare("INSERT INTO Contacts (Name, Phone, Email, UserID) VALUES (?, ?, ?, ?)");
    if ($stmt === false) {
        error_log("Prepare failed: " . $conn->error);
        returnWithError("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("sssi", $name, $phone, $email, $userId);

    if (!$stmt->execute()) {
        error_log("Execute failed: " . $stmt->error);
        returnWithError("Execute failed: " . $stmt->error);
    }

    if ($stmt->affected_rows > 0) {
        $newContactId = $conn->insert_id;  // get newly added contacts ID
        returnWithInfo($name, $phone, $email, $userId, $newContactId);
    } else {
        returnWithError("Failed to add contact");
    }

    $stmt->close();
    $conn->close();

    function getRequestInfo() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Invalid JSON: ' . json_last_error_msg());
            returnWithError('Invalid JSON');
        }
        return $data;
    }

    function returnWithError($err) {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo($name, $phone, $email, $userId, $id) {
        $retValue = '{"id":"' . $id . '","name":"' . $name . '","phone":"' . $phone . '","email":"' . $email . '","error":""}'; //Added ID for frontend update purposes
        sendResultInfoAsJson($retValue);
    }

    function sendResultInfoAsJson($obj) {
        header('Content-type: application/json');
        echo $obj;
    }
?>
