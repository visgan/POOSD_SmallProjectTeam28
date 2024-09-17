
let offset = 0;
const limit = 15; // Number of contacts to load at a time
let isLoading = false;
let allContactsLoaded = false;




    // check userID cookie
    if (!getCookie('userId')) {
        // redirect to login if cookie does not exist
        window.location.href = 'index.html';
    }


// get cookie function
function getCookie(name) {
    const cookieArr = document.cookie.split(';');
    for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split('=');
        const cookieName = cookiePair[0].trim();

        if (cookieName === name) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}


// Load contacts if the user is logged in
//loadContacts();


// working with window.onload now - left the old one commented out above ^^^
window.onload = function () {
    loadContacts();
};




// add contacts function
async function addContact() {
    // get values from input fields
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const userId = getUserIDCookie('userId');
    // make sure all fields are filled oout
    if (!name || !phone || !email) {
        document.getElementById('contactAddResult').innerHTML = "All fields are required.";
        return;
    }
    // format data for backend
    const contactData = {
        name: name,
        phone: phone,
        email: email,
        userId: userId
    };
    try {
        // fetch request to AddContact.php
        const response = await fetch('../LAMPAPI/AddContact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });
        const data = await response.json();
        // verify contact was added
        if (data.error === "") {
            document.getElementById('contactAddResult').innerHTML = "Contact added successfully";
            // clear fields after adding contact
            document.getElementById('contact-name').value = '';
            document.getElementById('contact-phone').value = '';
            document.getElementById('contact-email').value = '';
            // add new contact at the bottom of the table
            addContactToTable(data.id, name, phone, email);
        } else {
            document.getElementById('contactAddResult').innerHTML = "Error: " + data.error;
        }
    } catch (error) {
        console.error("Error adding contact:", error);
        document.getElementById('contactAddResult').innerHTML = "Failed to add contact";
    }
}

// Helper function to get the userId from cookies
// redundant but works better this way for some reason?
function getUserIDCookie(name) {
    const cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

// update table with new contact
function addContactToTable(id, name, phone, email) {
    const contactsBody = document.getElementById('contacts-body');
    // create new row
    const row = document.createElement('tr');
    row.setAttribute('id', `contact-row-${id}`);

    // populate row
    row.innerHTML = `
        <td>${name}</td>
        <td>${phone}</td>
        <td>${email}</td>
        <td>
            <button class="btn btn-warning btn-sm" onclick="editContact('${id}', '${name}', '${phone}', '${email}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteContact(${id})">Delete</button>
        </td>
    `;
    // append to table
    contactsBody.appendChild(row);
}


// delete contacts function
async function deleteContact(contactId) {
    // Log the contactId to verify it's the correct one
    console.log("Contact ID to delete:", contactId);

    // confirm deletion
    const confirmation = confirm("Are you sure you want to delete this contact?");

    if (!confirmation) {
        return; //exit if no
    }

    try {
        // send request for deletion
        const response = await fetch('../LAMPAPI/DeleteContact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: contactId })
        });

        const data = await response.json();

        if (data.error === "") {
            document.getElementById('contactAddResult').innerHTML = "Contact deleted successfully";

            // Remove the contact row from the DOM (assuming rows have id attributes)
            const contactRow = document.getElementById('contact-row-' + contactId);
            if (contactRow) {
                contactRow.remove();
            }
        } else {
            document.getElementById('contactAddResult').innerHTML = "Error: " + data.error;
        }
    } catch (error) {
        console.error("Error deleting contact:", error);
        document.getElementById('contactAddResult').innerHTML = "Failed to delete contact";
    }
}



// lazy load contacts on page load
function loadContacts() {
    if (isLoading || allContactsLoaded) return;  // Prevent loading if already loading or all loaded

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

    isLoading = false;
}



// display contacts in the table
function displayContacts(contacts) {
    const contactsBody = document.getElementById('contacts-body');
    //contactsBody.innerHTML = ''; // Clear previous table rows

    contacts.forEach(contact => {
        // create rows
        const row = document.createElement('tr');
        row.setAttribute('id', `contact-row-${contact.id}`); // set an ID for each row

        // display row data
        row.innerHTML = `
            <td>${contact.name}</td>
            <td>${contact.phone}</td>
            <td>${contact.email}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editContact('${contact.id}', '${contact.name}', '${contact.phone}', '${contact.email}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteContact(${contact.id})">Delete</button>
            </td>
        `;
        contactsBody.appendChild(row); // append to table
    });
}

function clearCookie(name) {
    // set cookie expiration to the past to clear it
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
}

function logout() {
    // clear the cookies
    clearCookie("firstName");
    clearCookie("lastName");
    clearCookie("userId");

    // redirect to login page
    window.location.href = "index.html";
}


// lazy load contacts when the user scrolls to the bottom
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !isLoading && !allContactsLoaded) {
        loadContacts();
    }
});

