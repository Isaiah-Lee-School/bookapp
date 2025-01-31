<?php
/**
 * This file handles the database access for the book tracker app
 * @author Isaiah Lee
 * @version 1.00
 */

/**
 * This function finds the unique book titles between friends, and removes the rest from the array. 
 * @param $array is the original array of data from the database. It is a reference
 * @param $user is the user id of the person currently using the application
 * @param $friend is the user id of the friend
 */
function findUniques(&$array, $user, $friend) {
    $userArray = [];
    $friendArray = [];
    for($i = 0; $i < count($array); $i++) {
        if($array[$i]['user_id'] === $user) {
            array_push($userArray, $array[$i]);
        }
        else if($array[$i]['user_id'] == $friend) {
            array_push($friendArray, $array[$i]);
        }
    }

    $array = [];
    for($i = 0; $i < count($userArray); $i++) {
        $title = $userArray[$i]['book_title'];
        for($j = 0; $j < count($friendArray); $j++) {
            if($title === $friendArray[$j]['book_title']) {
                array_push($array, $userArray[$i]);
            }
        }
    }
}

/**
 * This function queries the database for a requested book id.
 * @param title is the title of the book being queried
 * @param pdo is the pdo object of the database
 * @return book_id is the book id retrieved from the database
 */
function getBookId($title, $pdo) {
    $sql = "SELECT book_id FROM books WHERE book_title = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$title]);
    $idArray = $stmt->fetch();
    $book_id = $idArray["book_id"];
    return $book_id;
}

/**
 * This function queries the database for a requested author id
 * @param first is the first name of the author
 * @param last is the last name of the author
 * @param pdo is the pdo object of the database
 * @return author_id is the author id retrieved from the database
 */
function getAuthorId($first, $last, $pdo) {
    $sql = "SELECT author_id FROM authors WHERE first_name = ? AND last_name = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$first, $last]);
    $idArray = $stmt->fetch();
    $author_id = $idArray["author_id"];
    return $author_id;
}

/**
 * This function validates a date to ensure it is possible and in the correct format
 */
function validateDate($date) {
    $pattern = "/^\d{4}-([0-1][0-9])-([0-2][0-9]||[3][0-1])$/";

    if(preg_match($pattern, $date)){
        return $date;
    }
    return false;
}

session_start();

$method = $_SERVER['REQUEST_METHOD'];
if(isset($_SESSION['validated'])) {
    $user_id = $_SESSION['validated'];
}
else {
    session_destroy();
    header("Location: ../login.php");
    exit();
}

if($method === 'GET') {
    //Get the shared list of books among friends
    if(isset($_GET['friend'])) {
        $friend = filter_input(INPUT_GET, 'friend', FILTER_SANITIZE_NUMBER_INT);
        if(!is_numeric($friend) || $friend < 0){
            exit();
        }

        require 'connect_assoc.php';

        $sql = "";
        $prepArray = [$user_id];
        if($friend === 0) {
            $sql = "SELECT first_name, last_name, book_title, page_count, rating, year_of_reading, genre, br.user_id FROM book_readings br JOIN books b ON b.book_id = br.book_id JOIN book_authors ba ON ba.book_id = b.book_id JOIN authors a ON a.author_id = ba.author_id WHERE br.user_id = ?";
        }
        else {
            $sql = "SELECT first_name, last_name, book_title, page_count, rating, year_of_reading, genre, br.user_id FROM book_readings br JOIN books b ON b.book_id = br.book_id JOIN book_authors ba ON ba.book_id = b.book_id JOIN authors a ON a.author_id = ba.author_id WHERE br.user_id = ? OR br.user_id = ?";
            array_push($prepArray, $friend);
        }

        $stmt = $pdo -> prepare($sql);
        $stmt -> execute($prepArray);
        $data = $stmt -> fetchAll();

        if($friend > 0) {
            findUniques($data, $user_id, $friend);
        }

        echo json_encode($data);
        exit();
    }

    //Get individual user stats based on user_id
    if(isset($_GET['stats'])) {
        require 'connect_assoc.php';

        $responseArray = array(
            "total_pages" => 0, 
            "total_books" => 0, 
            "this_year_books" => 0
        );

        $sql = "SELECT page_count FROM books b JOIN book_readings br ON b.book_id = br.book_id WHERE user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);
        $data = $stmt->fetchAll();

        foreach($data as $page_count) {
            $responseArray["total_pages"] += $page_count["page_count"];
        }

        $sql = "SELECT COUNT(*) FROM book_readings WHERE user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);
        $data = $stmt->fetch();

        $responseArray["total_books"] = $data["COUNT(*)"];

        $sql = "SELECT COUNT(*) FROM book_readings WHERE user_id = ? AND YEAR(year_of_reading) = YEAR(CURDATE())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);
        $data = $stmt->fetch();

        $responseArray["this_year_books"] = $data["COUNT(*)"];

        echo json_encode($responseArray);
        exit();
    }

    //Get the username
    if(isset($_GET['username'])) {
        require 'connect_assoc.php';

        $sql = "SELECT username FROM users WHERE user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);
        $data = $stmt->fetch();
        $response = $data["username"];

        echo json_encode($response);
        exit();
    }

    if(isset($_GET['requests'])) {
        require 'connect_assoc.php';

        $sql = "SELECT username, date_sent FROM friendships JOIN users ON sending_user_id = user_id WHERE receiving_user_id = ? AND request_status = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id, 'PENDING']);
        $data = $stmt->fetchAll();

        echo json_encode($data);
        exit();
    }

    if(isset($_GET['friends'])) {
        require 'connect_assoc.php';

        $sql = "SELECT username, date_accepted, user_id FROM users JOIN friendships ON user_id = sending_user_id OR user_id = receiving_user_id WHERE (sending_user_id = ? OR receiving_user_id = ?) AND user_id != ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id, $user_id, $user_id]);
        $data = $stmt->fetchAll();

        echo json_encode($data);
        exit();
    }
}

if($method === 'POST') {
    $jsonData = file_get_contents("php://input");
    $data = json_decode($jsonData, true);
    $code = $data['code'];

    //Add the provided book data to the database
    if($code === "addBook") {
        $title = filter_var($data['title'], FILTER_SANITIZE_SPECIAL_CHARS);
        $author_fn = filter_var($data['authorFn'], FILTER_SANITIZE_SPECIAL_CHARS);
        $author_ln = filter_var($data['authorLn'], FILTER_SANITIZE_SPECIAL_CHARS);
        $pageCount = (int)filter_var($data['pageCount'], FILTER_SANITIZE_NUMBER_INT);
        $rating = (int)filter_var($data['rating'], FILTER_SANITIZE_NUMBER_INT);
        $genre = filter_var($data['genre'], FILTER_SANITIZE_SPECIAL_CHARS);
        $date = validateDate($data['date']);

        //validate to ensure information is correct and will not cause problems in database
        if(!$date || !is_numeric($pageCount) || !is_numeric($rating)) {
            http_response_code(400);
            echo json_encode("Invalid data, page count, or rating");
            exit();
        }

        require 'connect_assoc.php';

        //check to ensure the book is not already in db
        $sql = "SELECT * from books b JOIN book_authors ba ON b.book_id = ba.book_id JOIN authors a ON a.author_id = ba.author_id WHERE book_title = ? AND first_name = ? AND last_name = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$title, $author_fn, $author_ln]);
        $rowCount = $stmt->rowCount();

        
        if($rowCount < 1) {
            //insert book into books table
            $sql = "INSERT INTO books (book_title, page_count, genre) VALUES (?, ?, ?)";
            $stmt = $pdo -> prepare($sql);
            $stmt -> execute([$title, $pageCount, $genre]);

            //check author doesn't exist
            $sql = "SELECT first_name, last_name FROM authors WHERE first_name = ? AND last_name = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$author_fn, $author_ln]);
            $totalRows = $stmt->rowCount();

            if($totalRows < 1) {
                //insert author into authors table
                $sql = "INSERT INTO authors (first_name, last_name) VALUES (?, ?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$author_fn, $author_ln]);
            }

            //insert into book_authors table
            $book_id = getBookId($title, $pdo);
            $author_id = getAuthorId($author_fn, $author_ln, $pdo);

            $sql = "INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$book_id, $author_id]);
        }

        //add to book_readings
        $book_id = getBookId($title, $pdo);

        $sql = "SELECT * FROM book_readings WHERE book_id = ? AND user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$book_id, $user_id]);
        $rows = $stmt->rowCount();

        if($rows > 0) {
            echo json_encode("$title by $author_fn $author_ln already exists");
            exit();
        }

        $sql = "INSERT INTO book_readings (book_id, user_id, rating, year_of_reading) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$book_id, $user_id, $rating, $date]);

        echo json_encode("$title by $author_fn $author_ln was successfully saved");
        exit();

    }

    if($code === "sendFriendRequest") {
        $username = $data['username'];
        $status = "PENDING";

        require 'connect_assoc.php';

        //verify user exists
        $sql = "SELECT user_id FROM users WHERE username = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username]);
        $rowCount = $stmt->rowCount();
        
        if($rowCount <= 0) {
            echo json_encode("User does not exist");
            exit();
        }

        $data = $stmt->fetch();
        $receivingUserId = $data['user_id'];

        if($receivingUserId === $user_id) {
            echo json_encode("Cannot send friend request to yourself");
            exit();
        }

        //verify that the user has not already been sent a friend request by this user
        $sql = "SELECT * FROM friendships WHERE sending_user_id = ? AND receiving_user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$receivingUserId, $user_id]);
        $rowCount = $stmt->fetch();

        if($rowCount > 0) {
            echo json_encode("User has already sent you a friend request");
            exit();
        }

        //check that user is not already your friend
        $sql = "SELECT * FROM friendships WHERE (sending_user_id = ? AND receiving_user_id = ? OR sending_user_id = ? AND receiving_user_id = ?) AND request_status = 'ACCEPTED'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$receivingUserId, $user_id, $user_id, $receivingUserId]);
        $rowCount = $stmt->fetch();

        if($rowCount > 0) {
            echo json_encode("You are already friends with $username");
            exit();
        }

        //store friend request in database
        $sql = "INSERT INTO friendships (sending_user_id, receiving_user_id, date_sent, request_status) VALUES (?, ?, CURDATE(), ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id, $receivingUserId, $status]);

        echo json_encode("Request sent to " . htmlspecialchars($username));
        exit();
    }
}

if($method === "PUT") {
    $jsonData = file_get_contents("php://input");
    $data = json_decode($jsonData, true);
    $code = $data['code'];

    //update friend request to reflect that it was accepted
    if($code === "Accept") {
        $username = $data["username"];

        require 'connect_assoc.php';
        $sql = "UPDATE friendships SET date_accepted = CURDATE(), request_status = ? WHERE sending_user_id = (SELECT user_id from users WHERE username = ?) AND receiving_user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['ACCEPTED', $username, $user_id]);
        $affected = $stmt->rowCount();

        if($affected > 0 && $affected < 2) {
            echo json_encode("Accepted friend request from $username");
            exit();
        }

        echo json_encode("Unable to accept request");
    }
}

if($method === "DELETE") {
    $jsonData = file_get_contents("php://input");
    $data = json_decode($jsonData, true);
    $code = $data["code"];

    //delete a friend request if it was declined
    if($code === "Decline") {
        $username = $data["username"];

        require 'connect_assoc.php';
        $sql = "DELETE from friendships WHERE sending_user_id = (SELECT user_id from users WHERE username = ?) AND receiving_user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username, $user_id]);
        $affected = $stmt->rowCount();

        if($affected > 0 && $affected < 2) {
            echo json_encode("Friend request from $username declined");
            exit();
        }

        echo json_encode("Unable to decline request");
        exit();

    }
}

?>