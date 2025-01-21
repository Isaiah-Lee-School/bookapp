<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Tracker - Login</title>
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
            <span class="display-4">Login</span>
            <div>
                <label for="username" class="required">Username</label>
                <input type="text" name="username" id="username" placeholder="Username" required>
            </div>
            <div>
                <label for="pass" class="required">Password</label>
                <input type="password" name="pass" id="pass" placeholder="Password" required>
            </div>
            <div>
                <input class="accent-two-button button-small" type="submit" name="login" value="Login">
            </div>
            <div class="question">
                <span>No Account? <a href="signup.php" target="_blank">Sign Up</a></span>
            </div>
            <div class="question">
                <?php
                session_start();
                if(isset($_SESSION['validated'])) {
                    header("Location: app.php");
                }
                else if(isset($_POST['login'])) {
                    $username = $_POST["username"];
                    $loginPassword = $_POST['pass'];

                    //trim username to get rid of whitespace
                    $username = trim($username);

                    //check that username exists
                    require 'assets/connect_assoc.php';

                    $sql = "SELECT username FROM users WHERE username = ?";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$username]);
                    $rowCount = $stmt->rowCount();

                    if($rowCount !== 1) {
                        echo "<span>Username or password not correct</span>";
                    }
                    else {
                        //check password
                        $sql = "SELECT password FROM users WHERE username = ?";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([$username]);
                        $data = $stmt->fetch();

                        $hashedPass = $data['password'];

                        if(password_verify($loginPassword, $hashedPass)) {

                            $sql = "SELECT user_id FROM users WHERE username = ?";
                            $stmt = $pdo->prepare($sql);
                            $stmt->execute([$username]);
                            $data = $stmt->fetch();

                            $_SESSION['validated'] = $data['user_id'];
                            header("Location: app.php");
                        }

                        else {
                            echo "<span>Username or password not correct</span>";
                        }
                    }
                }

                ?>
            </div>
        </form>
    </section>
</body>
</html>