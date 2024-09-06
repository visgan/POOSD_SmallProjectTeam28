<?php
    $inData = getRequestInfo();

    $login = $inData["login"];
    $password = $inData["password"];
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];

    if ($login === null || $password === null) {
        returnWithError("Invalid input data");
    }

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
    } else {
        $stmt = $conn->prepare("INSERT INTO Users (Login, Password, firstName, lastName) VALUES (?, ?, ?, ?)");
        if ($stmt === false) {
            returnWithError("Prepare failed: " . $conn->error);
        }
        $stmt->bind_param("ssss", $login, $password, $firstName, $lastName);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            returnWithInfo($login, $password, $firstName, $lastName);
        } else {
            returnWithError("Failed to register user");
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            returnWithError('Invalid JSON');
        }
        return $data;
    }

    function returnWithError($err) {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo($login, $password, $firstName, $lastName) {
        $retValue = '{"login":"' . $login . '","password":"' . $password . '","firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
        sendResultInfoAsJson($retValue);

    }

    function sendResultInfoAsJson($obj) {
        header('Content-type: application/json');
        echo $obj;
    }
?>
