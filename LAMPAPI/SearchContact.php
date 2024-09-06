<?php
    $inData = getRequestInfo();
    $search = "%" . $inData["search"] . "%";

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
    } else {
        $stmt = $conn->prepare("SELECT Name, Phone, Email FROM Contacts WHERE Name LIKE ?");
        $stmt->bind_param("s", $search);
        $stmt->execute();
        $result = $stmt->get_result();

        $searchResults = "";
        $searchCount = 0;

        while($row = $result->fetch_assoc()) {
            if ($searchCount > 0) {
                $searchResults .= ",";
            }
            $searchCount++;
            $searchResults .= '{"name":"' . $row["Name"] . '", "phone":"' . $row["Phone"] . '", "email":"' . $row["Email"] . '"}';
        }

        if ($searchCount == 0) {
            returnWithError("No Records Found");
        } else {
            returnWithInfo($searchResults);
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    function returnWithError($err) {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo($searchResults) {
        $retValue = '{"results":[' . $searchResults . '],"error":""}';
        sendResultInfoAsJson($retValue);
    }

    function sendResultInfoAsJson($obj) {
        header('Content-type: application/json');
        echo $obj;
    }
?>
