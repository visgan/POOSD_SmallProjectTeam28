<?php

    $inData = getRequestInfo();

    $login = $inData["login"];
    $password = $inData["password"];
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];

    if ($login === null || $password === null) {
        returnWithError("Invalid input data");
        return; // Exit after error
    }

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
        exit(); //exit after error returned
    } else {

        // Check if the username already exists
        $checkStmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
        $checkStmt->bind_param("s", $login);  // Use $login instead of $username
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows > 0) {
            // Username already exists
            returnWithError("Username already exists");
            $checkStmt->close();
            exit(); // exit after error return
        } 

        // register if username doesn't already exist
        $stmt = $conn->prepare("INSERT INTO Users (Login, Password, firstName, lastName) VALUES (?, ?, ?, ?)");
        if ($stmt === false) {
            returnWithError("Prepare failed: " . $conn->error);
            $checkStmt->close();
            $conn->close();
            return;
        }

        $stmt->bind_param("ssss", $login, $password, $firstName, $lastName);
        
        try {
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                returnWithInfo($login, $password, $firstName, $lastName);
            } else {
                returnWithError("Failed to register user");
            }
        } catch (mysqli_sql_exception $e) {
            // Handle unique constraint violation (duplicate username)
            if ($e->getCode() === 1062) {
                returnWithError("Username already exists");
            } else {
                returnWithError("An unexpected error occurred: " . $e->getMessage());
            }
        }

        $stmt->close(); 
        $checkStmt->close();
        $conn->close();
    }



    function getRequestInfo() {

        $input = file_get_contents('php://input');
        error_log("Raw input: " . $input);  // Log the raw input for debugging

        $data = json_decode($input, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            returnWithError('Invalid JSON');
            return null;
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
