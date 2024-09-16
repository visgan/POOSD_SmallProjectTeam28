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

///////// vvv CONTACT PAGING vvv ///////////

// Paging (lazy loading) parameters
let offset = 0; 
const limit = 15; // Number of contacts to load at a time (do not go under 12)
let isLoading = false;
let allContactsLoaded = false;

// lazy load contacts on page load
function loadContacts() {
    if (isLoading || allContactsLoaded) return;
    isLoading = true;
    fetch('../LAMPAPI/SearchContact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search: "", offset: offset, limit: limit })
    })
    .then(response => response.json())
    .then(data => {
        isLoading = false;
        if (data.error === "") {
            if (data.results.length < limit) {
                // If the number of results is less than the limit, it means we've reached the end
                allContactsLoaded = true;
            }
            displayContacts(data.results);
            offset += limit;  // Update offset for the next load
        } else if (data.error === "No Records Found") {
            allContactsLoaded = true;  // Stop further loading
        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        isLoading = false;
        console.error('Error:', error);
    });
}

// display contacts in the table
function displayContacts(contacts) {
    const contactsBody = document.getElementById('contacts-body');
    contacts.forEach(contact => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${contact.name}</td>
            <td>${contact.phone}</td>
            <td>${contact.email}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editContact('${contact.id}', '${contact.name}', '${contact.phone}', '${contact.email}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteContact('${contact.id}')">Delete</button>
            </td>
        `;
        contactsBody.appendChild(row);
    });
}


// lazy load contacts when the user scrolls to the bottom
// this is a bit jank, but it works unless you visit the webpage with a very large screen size
// (zoom in then back out for the scroll bar to appear)
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !isLoading && !allContactsLoaded) {
        loadContacts();
    }
});


// load contacts on page load
window.onload = function() {
    loadContacts(); 
};

///////// ^^^ CONTACT PAGING ^^^ ///////////

// TODO: These functions
function addContact() {
    print("addContact() function called. It does nothing but print this line.")

    /* Something like this?
    let contactName = document.getElementById("contact-name").value;
    let contactPhone = document.getElementById("contact-phone").value;
    let contactEmail = document.getElementById("contact-email").value;
    */
}

function editContact() {
    print("editContect() function called. It does nothing but print this line.")

    /* Not sure about this one...

    */
}

function deleteContact() {
    print("deleteContact() function called. It does nothing but print this line.")

    /* There should be a popup as such
    const confirmDelete = confirm("Are you sure you want to delete this contact?");
    if (!confirmDelete) return;
    */
}

// show login and hide registration form
const showLoginBtn = document.getElementById('show-login');
if (showLoginBtn) {
    showLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
}



// Show the registration form and hide the login form
const showRegisterBtn = document.getElementById('show-register');
if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });
}





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
