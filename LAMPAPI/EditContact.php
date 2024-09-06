<?php
    $inData = getRequestInfo();

    $contactID = $inData["id"];
    $name = $inData["name"];
    $phone = $inData["phone"];
    $email = $inData["email"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
    } else {
        $stmt = $conn->prepare("UPDATE Contacts SET Name=?, Phone=?, Email=? WHERE ID=?");
        if ($stmt === false) {
            returnWithError("Prepare failed: " . $conn->error);
        } else {
            $stmt->bind_param("sssi", $name, $phone, $email, $contactID);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                returnWithSuccess("Contact updated successfully");
            } else {
                returnWithError("No contact found with the given ID or no changes made");
            }

            $stmt->close();
        }
        $conn->close();
    }

    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    function returnWithError($err) {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithSuccess($message) {
        $retValue = '{"message":"' . $message . '","error":""}';
        sendResultInfoAsJson($retValue);
    }

    function sendResultInfoAsJson($obj) {
        header('Content-type: application/json');
        echo $obj;
    }
?>
