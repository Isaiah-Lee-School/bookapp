<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Tracker - Tracker</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link href="assets/styles.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/login.css">
    <script src="assets/app.js" defer></script>
</head>
<body>
    <nav>
        <ul class="navigation">
            <li id="requests"><span class="accent-two-button button-small">Requests</span></li>
            <li id="messages"><span class="accent-two-button button-small">Messages</span></li>
            <li>Settings</li>
            <li id="uname">Username: </li>
        </ul>
    </nav>
    <main class="container-fluid app-main">
        <section class="row">
            <div class="sidebar col-1 text-center">
                <div class="sidebar-option" id="my-books">
                    <p>My Books</p>
                </div>
                <div class="sidebar-option" id="my-groups">
                    <p>My Groups</p>
                </div>
                <div class="sidebar-option" id="my-friends">
                    <p>My Friends</p>
                </div>
                <div class="sidebar-option" id="my-stats">
                    <p>My Stats</p>
                </div>
            </div>
            <div class="col-11 main-application">
                <h1 class="display-4 col-11 text-center pt-5">Welcome. Select an option to the left. Messages, settings, and logout are on top</h1>
            </div>
        </section>
    </main>
</body>
</html>

<?php

session_start();

if(isset($_SESSION['validated'])) {
    $user_id = $_SESSION['validated'];
}
else {
    session_destroy();
    header("Location: login.php");
    exit();
}

if(isset($_POST['logout'])) {
    session_unset();
    session_destroy();
    header("Location: login.php");
    exit();
}
?>