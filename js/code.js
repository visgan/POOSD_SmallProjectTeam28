const urlBase = 'http://poosd.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";



function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}


// event listener for logout button
document.getElementById("logoutBtn").addEventListener("click", function() {
    // Redirect back to the login page
    window.location.href = "index.html";
});



// show registration form - hide login
document.getElementById('show-register').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
});

// show login form - hide registration

document.getElementById('show-login').addEventListener('click', function(e) {
	e.preventDefault();
	document.getElementById('register-form').style.display = 'none';
	document.getElementById('login-form').style.display = 'block';
});

// login function
function login() {
    const loginData = {
        login: document.getElementById("login-username").value,
        password: document.getElementById("login-password").value
    };

    // Send JSON to LAMPAPI/Login.php
    fetch('../LAMPAPI/Login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error === "") {
			window.location.href = "contacts.html";
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

// registration function
function register() {
    const registerData = {
        login: document.getElementById("register-username").value,
        password: document.getElementById("register-password").value,
        firstName: document.getElementById("first-name").value,
        lastName: document.getElementById("last-name").value
    };

    // Send JSON to LAMPAPI/Register.php
    fetch('../LAMPAPI/Register.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error === "") {
            alert("Registration Successful!");
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}
