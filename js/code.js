document.addEventListener('DOMContentLoaded', function () // wait for page load to execute JS
{
    const urlBase = 'http://poosd.xyz/LAMPAPI';
    const extension = 'php';

    let userId = 0;
    let firstName = "";
    let lastName = "";

    // Save cookie function
    function saveCookie() 
    {
        let minutes = 20;
        let date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        const expires = ";expires=" + date.toGMTString() + ";path=/";

        // Store cookies
        document.cookie = "firstName=" + firstName + expires;
        document.cookie = "lastName=" + lastName + expires;
        document.cookie = "userId=" + userId + expires;
    }

    // Read cookie function
    function readCookie() 
    {
        userId = -1;
        let data = document.cookie;
        let splits = data.split(",");
        for (var i = 0; i < splits.length; i++) 
        {
            let thisOne = splits[i].trim();
            let tokens = thisOne.split("=");
            if (tokens[0] == "firstName") 
            {
                firstName = tokens[1];
            }
            else if (tokens[0] == "lastName") 
            {
                lastName = tokens[1];
            }
            else if (tokens[0] == "userId") 
            {
                userId = parseInt(tokens[1].trim());
            }
        }

        if (userId < 0) 
        {
            window.location.href = "index.html";
        }
        else 
        {
            window.location.href = "contacts.html";
        }
    }

    // Function to verify that username and password are entered
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) 
    {
        loginBtn.addEventListener('click', function (e) 
        {
            const userName = document.getElementById('login-username').value.trim();
            const pass = document.getElementById('login-password').value.trim();
            let loginError = "";
            if (!userName) 
            {
                loginError += "Username is required to login <br>";
            }
            if (!pass) 
            {
                loginError += "Password is required to login <br>";
            }
            // Error box
            const loginErrorBox = document.getElementById('error-box');
            if (loginError) 
            {
                e.preventDefault(); // Prevent login submission
                loginErrorBox.innerHTML = loginError;
                loginErrorBox.style.display = 'block';
            }
            else 
            {
                loginErrorBox.style.display = 'none';
                // Call login function
                login();
            }
        });
    }
    else
    {
        console.warn('Login button not on this page');
    }

    // Function to make sure all registration fields are filled out before submitting
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) // Make sure element exists before running rest of code
    {
        registerBtn.addEventListener('click', function (e) 
        {
            const firstName = document.getElementById('first-name').value.trim();
            const lastName = document.getElementById('last-name').value.trim();
            const login = document.getElementById('register-username').value.trim();
            const password = document.getElementById('register-password').value.trim();
            let errorMessage = "";
            if (!firstName) 
            {
                errorMessage += "First name is required. <br>";
            }
            if (!lastName) 
            {
                errorMessage += "Last name is required. <br>";
            }
            if (!login) 
            {
                errorMessage += "Username is required. <br>";
            }
            if (!password) 
            {
                errorMessage += "Password is required. <br>";
            }
            // Error box
            const errorBox = document.getElementById('error-box');
            if (errorMessage) 
            {
                e.preventDefault();  // Prevent form submission
                errorBox.innerHTML = errorMessage;
                errorBox.style.display = 'block';
            }
            else 
            {
                errorBox.style.display = 'none';
                // Call registration function to submit data
                register(firstName, lastName, login, password);
            }
        });
    }
    else
    {
        console.warn('Register button not found on this page.');
    }

    // Show login and hide registration form
    const showLoginBtn = document.getElementById('show-login');
    if (showLoginBtn)
    {
        showLoginBtn.addEventListener('click', function (e)
        {
            e.preventDefault();
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            clearErrorBox(); // clear error message
        });
    }

    // Show the registration form and hide the login form
    const showRegisterBtn = document.getElementById('show-register');
    if (showRegisterBtn)
    {
        showRegisterBtn.addEventListener('click', function (e)
        {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
            clearErrorBox();
        });
    }

    // clear error box funciton
    function clearErrorBox() 
    {
        const errorBox = document.getElementById('error-box');
        errorBox.innerHTML = '';
        errorBox.style.display = 'none';
    }

    // Login function
    function login()
    {
        const loginData = 
        {
            login: document.getElementById("login-username").value.trim(),
            password: document.getElementById("login-password").value.trim()
        };

        // Validate input fields
        if (!loginData.login || !loginData.password)
        {
            return;
        }

        // send to Login.php
        fetch('../LAMPAPI/Login.php',
        {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
            .then(response => response.json())
            .then(data =>
            {
                if (data.error === "")
                {
                    // Store user info in cookie on login
                    document.cookie = `userId=${data.id}; path=/;`;
                    document.cookie = `firstName=${data.firstName}; path=/;`;
                    document.cookie = `lastName=${data.lastName}; path=/;`;

                    window.location.href = "contacts.html";
                }
                else
                {
                    const loginErrorBox = document.getElementById('error-box');
                    loginErrorBox.innerHTML = "Error: " + data.error;
                    loginErrorBox.style.display = 'block';
                }
            })
            .catch(error =>
            {
                console.error("Error:", error);
            });
    }

    // Registration function
    function register(firstName, lastName, login, password)
    {
        const registerData =
        {
            login: login,
            password: password,
            firstName: firstName,
            lastName: lastName
        };

        // send to Register.php
        fetch('../LAMPAPI/Register.php',
            {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        })
            .then(response => response.json())
            .then(data => 
                {
                if (data.error === "")
                {
                    alert("Registration Successful!");
                    document.getElementById('register-form').style.display = 'none';
                    document.getElementById('login-form').style.display = 'block';
                }
                else
                {
                    const errorBox = document.getElementById('error-box');
                    errorBox.innerHTML = "Error: " + data.error;
                    errorBox.style.display = 'block';
                }
            })
            .catch(error =>
            {
                console.error("Error:", error);
            });
    }
});

