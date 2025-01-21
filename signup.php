<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Tracker - Sign Up</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link href="assets/login.css" rel="stylesheet">
    <link href="assets/styles.css" rel="stylesheet">
</head>
<body>
    <nav>
        <ul class="navigation">
            <li><a href="#" target="_blank" class="not-button">Home</a></li>
            <li><a href="#" target="_blank" class="not-button">Details</a></li>
            <li><a href="login.php" target="_blank" class="button-small accent-one-button">Log In</a></li>
            <li><a href="signup.php" target="_blank" class="button-small accent-one-button-inverse">Sign Up</a></li>
        </ul>
    </nav>
    <section id="form-div">
        <form method="post" action="<?= $_SERVER['PHP_SELF'] ?>">
            <span class="display-4">Sign Up</span>
            <div>
                <label for="fname" class="required">First Name</label>
                <input type="text" name="fname" id="fname" placeholder="First Name" required>
            </div>
            <div>
                <label for="lname" class="required">Last Name</label>
                <input type="text" name="lname" id="lname" placeholder="Last Name" required>
            </div>
            <div>
                <label for="username" class="required">Username</label>
                <input type="text" name="username" id="username" placeholder="Username" required>
            </div>
            <div>
                <label for="pass" class="required">Password</label>
                <input type="password" name="pass" id="pass" placeholder="Password" required>
            </div>
            <div>
                <label for="confirmpass" class="required">Confirm Password</label>
                <input type="password" name="confirmpass" id="confirmpass" placeholder="Confirm Password" required>
            </div>
            <div>
                <input class="accent-two-button button-small" type="submit" name="signup" value="Sign Up">
            </div>
            <div class="question">
                <span>Already a Member? <a target="_blank" href="login.php">Login</a></span>
            </div>
            <div class="question">
            <?php

            if(isset($_POST['signup'])) {
                $firstName = $_POST['fname'];
                $lastName = $_POST['lname'];
                $username = $_POST['username'];
                $signupPassword = $_POST['pass'];
                $confirmPassword = $_POST['confirmpass'];

                //trim names
                $firstName = trim($firstName);
                $lastName = trim($lastName);
                $username = trim($username);

                require 'assets/connect_assoc.php';

                //check that username does not already exist in database
                $sql = "SELECT username FROM users WHERE username = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$username]);
                $rowCount = $stmt->rowCount();

                if($rowCount > 0) {
                    echo '<span>Username is already taken</span>';
                }
                elseif($signupPassword !== $confirmPassword) {
                    echo '<span>Passwords must match</span>';
                }
                else {
                    $hashedPass = password_hash($signupPassword, PASSWORD_DEFAULT);

                    $sql = "INSERT INTO users (first_name, last_name, username, password) VALUES(?, ?, ?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$firstName, $lastName, $username, $hashedPass]);

                    header("Location: login.php");
                }
            }

            ?>
            </div>
        </form>
    </section>
</body>
</html>