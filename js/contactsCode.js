let offset = 0;
const limit = 15; // Number of contacts to load at a time
let isLoading = false;
let allContactsLoaded = false;

// throttle for lazy loading
function throttle(fn, wait) 
{
    let lastTime = 0;
    return function (...args) 
    {
        const now = new Date().getTime();
        if (now - lastTime >= wait) 
        {
            lastTime = now;
            fn(...args);
        }
    };
}

// check userID cookie
if (!getCookie('userId')) 
{
    // redirect to login if cookie does not exist
    window.location.href = 'index.html';
}

// get cookie function
function getCookie(name) 
{
    const cookieArr = document.cookie.split(';');
    for (let i = 0; i < cookieArr.length; i++) 
        {
        const cookiePair = cookieArr[i].split('=');
        const cookieName = cookiePair[0].trim();

        if (cookieName === name) 
        {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

// working with window.onload now - left the old one commented out above ^^^
window.onload = function () 
{
    loadContacts();
};

// add contacts function
async function addContact() 
{
    // get values from input fields
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const userId = getUserIDCookie('userId');
    // make sure all fields are filled oout
    if (!name || !phone || !email)  
    {
        document.getElementById('contactAddResult').innerHTML = '<div class="alert alert-danger" role="alert">All fields are required!</div>';
        return;
    }
    // format data for backend
    const contactData = {
        name: name,
        phone: phone,
        email: email,
        userId: userId
    };
    try 
    {
        // fetch request to AddContact.php
        const response = await fetch('../LAMPAPI/AddContact.php', 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });
        const data = await response.json();
        // verify contact was added
        if (data.error === "") 
        {
            // clear fields after adding contact
            document.getElementById('contact-name').value = '';
            document.getElementById('contact-phone').value = '';
            document.getElementById('contact-email').value = '';
            // add new contact at the bottom of the table
            addContactToTable(data.id, name, phone, email);
            // display success message and wait 1 second before reloading
            document.getElementById('contactAddResult').innerHTML = '<div class="alert alert-success" role="alert">Contact added successfully</div>';
            setTimeout(() => 
            {
                console.log("successfully added");
                window.location.reload(); // Reload the page after the delay
            }, 1000); // 1 second delay (1000ms)
            
        }
        else 
        {
            document.getElementById('contactAddResult').innerHTML = "Error: " + data.error;
        }
    }
    catch (error) 
    {
        console.error("Error adding contact:", error);
        document.getElementById('contactAddResult').innerHTML = "Failed to add contact";
    }
}

// Helper function to get the userId from cookies
function getUserIDCookie(name) 
{
    const cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) 
    {
        let cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) 
        {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

// Update table with new contact
function addContactToTable(id, name, phone, email) 
{
    const contactsBody = document.getElementById('contacts-body');
    // Create new row
    const row = document.createElement('tr');
    row.setAttribute('id', `contact-row-${id}`);

    // Populate row
    row.innerHTML = `
        <td>${name}</td>
        <td>${phone}</td>
        <td>${email}</td>
        <td>
            <button class="btn btn-warning btn-sm" onclick="editContact('${id}', '${name}', '${phone}', '${email}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteContact(${id})">Delete</button>
        </td>
    `;
    // Append to table
    contactsBody.appendChild(row);
}

// delete contacts function
async function deleteContact(contactId) 
{
    // confirm deletion
    const confirmation = confirm("Are you sure you want to delete this contact?");
    if (!confirmation) 
    {
        return; //exit if no
    }
    try 
    {
        // send request for deletion
        const response = await fetch('../LAMPAPI/DeleteContact.php', 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: contactId })
        });
        const data = await response.json();
        if (data.error === "") 
        {
            document.getElementById('contactAddResult').innerHTML = '<div class="alert alert-danger" role="alert">Contact deleted successfully</div>';

            // delete row
            const contactRow = document.getElementById('contact-row-' + contactId);
            if (contactRow) 
            {
                contactRow.remove();
            }
        }
        else
        {
            document.getElementById('contactAddResult').innerHTML = "Error: " + data.error;
        }
    }
    catch (error)
    {
        console.error("Error deleting contact:", error);
        document.getElementById('contactAddResult').innerHTML = "Failed to delete contact";
    }
}

// lazy load contacts on page load
function loadContacts()
{
    if (isLoading || allContactsLoaded) return;  // Prevent loading if already loading or all loaded
    isLoading = true;
    fetch('../LAMPAPI/SearchContact.php',
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search: "", offset: offset, limit: limit })
    })
        .then(response => response.json())
        .then(data => 
        {
            isLoading = false;
            if (data.error === "")
            {
                if (data.results.length < limit)
                {
                    // If the number of results is less than the limit, it means we've reached the end
                    allContactsLoaded = true;
                }
                displayContacts(data.results);
                offset += limit;  // Update offset for the next load
            }
            else if (data.error === "No Records Found")
            {
                allContactsLoaded = true;  // Stop further loading
            }
            else
            {
                alert(data.error);
            }
        })
        .catch(error =>
        {
            isLoading = false;
            console.error('Error:', error);
        });
    isLoading = false;
}

// display contacts in the table
function displayContacts(contacts)
{
    const contactsBody = document.getElementById('contacts-body');
    contacts.forEach(contact =>
    {
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

// Clear cookie
function clearCookie(name)
{
    // set cookie expiration to the past to clear it
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
}

// Logout function
function logout()
{
    // clear the cookies
    clearCookie("firstName");
    clearCookie("lastName");
    clearCookie("userId");
    // redirect to login page
    window.location.href = "index.html";
}

// Load contacts on page load
window.onload = function ()
{
    loadContacts();
    window.addEventListener('scroll', throttle(() =>
    {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !isLoading && !allContactsLoaded)
        {
            loadContacts();
        }
    }, 50));
};

// Search Function
async function searchContacts()
{
    const searchQuery = document.getElementById('search-input').value.trim(); // Get search input
    if (!searchQuery) // Verify search query entered and warn if none
    {
        document.getElementById('searchResult').innerHTML = '<div class="alert alert-danger" role="alert">Please enter a name to search</div>';
        return;
    }
    const searchData =
    {
        search: searchQuery,
        offset: 0,
        limit: 50   // search return limit
    };
    try
    {
        const response = await fetch('../LAMPAPI/SearchContact.php',
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchData)
        });
        const data = await response.json();
        if (data.error === "") 
        {
            displaySearchResults(data.results);
        } 
        else 
        {
            document.getElementById('searchResult').innerHTML = '<div class="alert alert-danger" role="alert">Contact not found!</div>';
            setTimeout(() => 
                {
                    console.log("Contact not found");
                    window.location.reload(); // Reload the page after the delay
                }, 1000); // 1 second delay (1000ms)
        }
    } 
    catch (error) 
    {
        console.error("Error searching contacts:", error);
        document.getElementById('searchResult').innerHTML = "Search Failed";
    }
}

// Display search results in table
function displaySearchResults(contacts) 
{
    const contactsBody = document.getElementById('contacts-body');
    contactsBody.innerHTML = ''; // Clear previous results
    contacts.forEach(contact => 
    {
        const row = document.createElement('tr'); // Create table row
        row.setAttribute('id', `contact-row-${contact.id}`); // Set row attribute
        // Set row html
        row.innerHTML = `
            <td>${contact.name}</td>
            <td>${contact.phone}</td>
            <td>${contact.email}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editContact('${contact.id}', '${contact.name}', '${contact.phone}', '${contact.email}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteContact(${contact.id})">Delete</button>
            </td>
        `;
        contactsBody.appendChild(row);
    });
}

// Reload page function (search tab)
function reloadPage() 
{
    window.location.reload();
}

// Edit contact function -- handles edit button press
function editContact(contactId, currentName, currentPhone, currentEmail) 
{
    // get row ID
    const row = document.getElementById(`contact-row-${contactId}`);
    // create pre-populated editable text fields
    row.innerHTML = `
        <td><input type="text" id="edit-name-${contactId}" value="${currentName}" class="form-control"></td>
        <td><input type="text" id="edit-phone-${contactId}" value="${currentPhone}" class="form-control"></td>
        <td><input type="email" id="edit-email-${contactId}" value="${currentEmail}" class="form-control"></td>
        <td>
            <button class="btn btn-success btn-sm" onclick="saveContact(${contactId})">Save</button>
            <button class="btn btn-secondary btn-sm" onclick="cancelEdit(${contactId}, '${currentName}', '${currentPhone}', '${currentEmail}')">Cancel</button>
        </td>
    `;
}

// Cancel edit function
function cancelEdit(contactId, name, phone, email) 
{
    // Get row ID and revert to original state
    const row = document.getElementById(`contact-row-${contactId}`);
    row.innerHTML = `
        <td>${name}</td>
        <td>${phone}</td>
        <td>${email}</td>
        <td>
            <button class="btn btn-warning btn-sm" onclick="editContact('${contactId}', '${name}', '${phone}', '${email}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteContact(${contactId})">Delete</button>
        </td>
    `;
}

// Save edited contact function
async function saveContact(contactId) 
{
    // Get updated values
    const updatedName = document.getElementById(`edit-name-${contactId}`).value.trim();
    const updatedPhone = document.getElementById(`edit-phone-${contactId}`).value.trim();
    const updatedEmail = document.getElementById(`edit-email-${contactId}`).value.trim();
    // Verify no empty fields
    if (!updatedName || !updatedPhone || !updatedEmail) 
    {
        alert("All fields are required!");
        return;
    }
    // Format new data
    const updatedContactData = 
    {
        id: contactId,
        name: updatedName,
        phone: updatedPhone,
        email: updatedEmail
    };
    try 
    {
        // send updated contact to DB via POST
        const response = await fetch('../LAMPAPI/EditContact.php', 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedContactData)
        });
        const data = await response.json();
        if (data.error === "") 
        {
            // Show updated info in row
            const row = document.getElementById(`contact-row-${contactId}`);
            row.innerHTML = `
                <td>${updatedName}</td>
                <td>${updatedPhone}</td>
                <td>${updatedEmail}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editContact('${contactId}', '${updatedName}', '${updatedPhone}', '${updatedEmail}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteContact(${contactId})">Delete</button>
                </td>
            `;
        } 
        else 
        {
            alert("Error: " + data.error);
        }
    } 
    catch (error) 
    {
        console.error("Error saving contact:", error);
        alert("Failed to update contact");
    }
}
