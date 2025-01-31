/**
 * This file handles the front end logic of the book tracker. It will dynamically change the display based on the user selection, and information received from the database.
 * @author Isaiah Lee
 * @version 1.00
 */

const myBooksButton = document.getElementById('my-books');
const myGroupsButton = document.getElementById('my-groups');
const myFriendsButton = document.getElementById('my-friends');
const myStatsButton = document.getElementById('my-stats');
const mainApplication = document.querySelector('.main-application');
const requestButton = document.getElementById('requests');
const theCurrentUser = document.getElementById('uname');
const root = getComputedStyle(document.querySelector(':root'));
const colorsArray = [root.getPropertyValue('--bg-color'), root.getPropertyValue('--text-color'), root.getPropertyValue('--accent-one')];

let wait = 0;

/**
 * This function creates an input element with a corresponding label element. It appends them to a div and returns the div
 * @param {string} id the id of the input element, and the value of the label's "for" attribute
 * @param {string} type the type of the input element
 * @param {string} placeholder the placeholder of the input element
 * @param {string} textContent the text inside the label element
 * @param {string} name the name of the input element
 * @returns the div containing the label and input 
 */
function createFormInput(id, type, placeholder = "", textContent, name) {

    const inputDiv = document.createElement('div');

    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = textContent;
    label.classList.add('required');

    const input = document.createElement('input');
    input.setAttribute('type', type);
    input.setAttribute('id', id);
    input.setAttribute('placeholder', placeholder);
    input.setAttribute('name', name);
    input.required = true;

    inputDiv.appendChild(label);
    inputDiv.appendChild(input);

    return inputDiv;
}

/**
 * This function dynamically alters the HTML to display a form for the user to enter information about a new book reading they wish to add.
 * @param {event} event: The triggering event for this function
 */
function addBookMenu(event) {
    mainApplication.innerHTML = "";

    const formDiv = document.createElement('div');
    formDiv.setAttribute('id', 'form-div');
    formDiv.style.margin = "2rem 0";

    const form = document.createElement('div');
    form.setAttribute('id', 'add');
    
    const formTitle = document.createElement('span');
    formTitle.classList.add('display-4');
    formTitle.textContent = "Add Book";

    let inputArray = [];
    inputArray.push(createFormInput("title", "text", "Title", "Title", "title"));
    inputArray.push(createFormInput("author-fn", "text", "Author First Name", "Author First Name", "author-fn"));
    inputArray.push(createFormInput("author-ln", "text", "Author Middle and Last Name", "Author Middle and Last Name", "author-ln"));
    inputArray.push(createFormInput("page-count", "number", "", "Page Count", "page-count"));
    inputArray.push(createFormInput("rating", "number", "", "Rating (Out of 10)", "rating"));
    inputArray.push(createFormInput("genre", "text", "Genre", "Genre", "genre"));
    inputArray.push(createFormInput("date-of-reading", "date", "", "Date of Reading", "date-of-reading"));

    const addBookSubmitButtonDiv = document.createElement('div');
    
    const addBookSubmitButton = document.createElement('input');
    addBookSubmitButton.classList.add('accent-two-button');
    addBookSubmitButton.classList.add('button-small');
    addBookSubmitButton.setAttribute('type', 'submit');
    addBookSubmitButton.setAttribute('name', 'add-book');
    addBookSubmitButton.setAttribute('value', 'Add Book');

    addBookSubmitButtonDiv.appendChild(addBookSubmitButton);
    form.appendChild(formTitle);

    for(let i = 0; i < inputArray.length; i++) {
        form.appendChild(inputArray[i]);
    }
    form.appendChild(addBookSubmitButtonDiv);
    formDiv.appendChild(form);
    mainApplication.appendChild(formDiv);
    mainApplication.appendChild(formDiv);

    addBookSubmitButton.addEventListener('click', async function() {
        wait = 1;
        const url = "assets/book.php";
        bodyParams = [];
        bodyParams.push(document.getElementById('title').value);
        bodyParams.push(document.getElementById('author-fn').value);
        bodyParams.push(document.getElementById('author-ln').value);
        bodyParams.push(document.getElementById('page-count').value);
        bodyParams.push(document.getElementById('rating').value);
        bodyParams.push(document.getElementById('genre').value);
        bodyParams.push(document.getElementById('date-of-reading').value);

        const response = await fetch(url, {
            method: 'post', 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code: "addBook",
                title: bodyParams[0], 
                authorFn: bodyParams[1],
                authorLn: bodyParams[2], 
                pageCount: bodyParams[3], 
                rating: bodyParams[4], 
                genre: bodyParams[5], 
                date: bodyParams[6]
            })
        });
        if(!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const message = await response.json();
        console.log(message);

        mainApplication.innerHTML = "";

        const displayedMessage = document.createElement('p');
        displayedMessage.classList.add('display-4');
        displayedMessage.textContent = message;

        mainApplication.appendChild(displayedMessage);
        
        wait = 0;
    });

}

/**
 * This method fetches books from a php script called book.php. a friendId is passed in to decide which books to view.
 * @param {integer} friendId decides which books to get from php script. 0 is requesting all. Any other number is the shared readings with a particular friend
 * @returns a json array of the requested books.
 */
async function fetchBooks(friendId) {
    wait = 1;
    let books = [];
    try {
        const response = await fetch(`assets/book.php?friend=${friendId}`);

        if(!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        books = await response.json();
    }
    catch (error) {
        console.error("Error fetching data: ", error);
    }
    wait = 0;
    return books;
}

/**
 * This function gets all specified readings from the database
 * @param {integer} friendId is the id of the friend that will be 
 */
async function myBooksHandler(event, friendId) {
    mainApplication.innerHTML = "";

    const addButtonDiv = document.createElement('div');
    addButtonDiv.style.setProperty('text-align', 'center');
    addButtonDiv.style.setProperty('padding', '2rem');

    const addButton = document.createElement('p');
    addButton.textContent = "Add New Book";
    addButton.classList.add('button');
    addButton.classList.add('accent-two-button');
    addButton.addEventListener('click', (event) => addBookMenu(event));

    addButtonDiv.appendChild(addButton);
    mainApplication.appendChild(addButtonDiv);
    
    let bookList = [];
    if (wait === 0) {
        bookList = await fetchBooks(friendId);
    }
    const flexDiv = document.createElement('div');
    flexDiv.style.setProperty('display', 'flex');
    flexDiv.style.setProperty('height', '100vh');
    mainApplication.appendChild(flexDiv);
    flexDiv.style.setProperty('flex-wrap', 'wrap');
    flexDiv.style.setProperty('justify-content', 'center');
    
    //create all cards
    for(let i = 0; i < bookList.length; i++) {
        const bookCardPaddingDiv = document.createElement('div');
        bookCardPaddingDiv.classList.add('p-5');

        const bookCard = document.createElement('div');
        bookCard.classList.add('card');
        bookCard.style.setProperty('width', '18rem');

        const bookCardBody = document.createElement('div');
        bookCardBody.classList.add('card-body');

        const bookCardTitle = document.createElement('h5');
        bookCardTitle.innerHTML = `${bookList[i]["book_title"]} - ${bookList[i]["first_name"]} ${bookList[i]["last_name"]}`;
        bookCardTitle.classList.add('card-title');
        bookCardTitle.classList.add('text-center');

        const bookCardText = document.createElement('div');
        bookCardText.classList.add('card-text');
        bookCardText.classList.add('text-center');

        const pagesPara = document.createElement('p');
        pagesPara.textContent = `${bookList[i]["page_count"]} pages`;

        const ratingPara = document.createElement('p');
        ratingPara.textContent = `Rating: ${bookList[i]["rating"]}/10`;

        const genrePara = document.createElement('p');
        genrePara.textContent = `Genre - ${bookList[i]["genre"]}`;

        const readingYearPara = document.createElement('p');
        readingYearPara.textContent = `Date of Reading: ${bookList[i]["year_of_reading"]}`;

        bookCardText.appendChild(pagesPara);
        bookCardText.appendChild(ratingPara);
        bookCardText.appendChild(genrePara);
        bookCardText.appendChild(readingYearPara);
        bookCardBody.appendChild(bookCardTitle);
        bookCardBody.appendChild(bookCardText);
        bookCard.appendChild(bookCardBody);
        bookCardPaddingDiv.appendChild(bookCard);

        flexDiv.appendChild(bookCardPaddingDiv);
    }
    
    myBooksButton.style.setProperty('--sidebar-text', colorsArray[0]);
    myBooksButton.style.setProperty('--sidebar-bg', colorsArray[2]);

    myGroupsButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myGroupsButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    myFriendsButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myFriendsButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    myStatsButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myStatsButton.style.setProperty('--sidebar-bg', colorsArray[0]);
}

/**
 * This function creates a friend request in the database for the specified user
 * @param {event} event the triggering event for this function
 * @param {*} messagePara the paragraph element where the response message will be displayed
 */
async function sendFriendRequest(event, messagePara) {

    const url = "assets/book.php";
    bodyParams = [];
    bodyParams.push(document.getElementById('friendRequest').value);

    const response = await fetch(url, {
        method: 'post', 
        headers: {
            "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
            code: "sendFriendRequest",
            username: bodyParams[0]
        })
    });

    if(!response.ok) {
        throw new error(`HTTP Error ${response.status}`);
    }

    const message = await response.json();
    messagePara.textContent = message;
}

async function getFriendsList() {
    wait = 1;
    let friendsList = [];
    try {
        const response = await fetch(`assets/book.php?friends=friends`);

        if(!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        friendsList = await response.json();
    }
    catch (error) {
        console.error("Error fetching data: ", error);
    }
    wait = 0;
    return friendsList;
}

/**
 * This function handles the DOM manipulation to dynamically render the friends tab of the app.
 */
async function friendHandler() {
    mainApplication.innerHTML = "";

    //Create add friend content
    const sendFriendRequestButtonDiv = document.createElement('div');
    sendFriendRequestButtonDiv.classList.add('text-center');
    sendFriendRequestButtonDiv.classList.add('p-5');

    const sendFriendRequestButton = document.createElement('p');
    sendFriendRequestButton.classList.add('button');
    sendFriendRequestButton.classList.add('accent-two-button');
    sendFriendRequestButton.textContent = "Add Friend";

    const friendRequestInput = document.createElement('input');
    friendRequestInput.type = "text";
    friendRequestInput.name = "friendRequest";
    friendRequestInput.id = "friendRequest";
    friendRequestInput.placeholder = "Enter Username";

    const messageParagraph = document.createElement('p');

    sendFriendRequestButtonDiv.appendChild(sendFriendRequestButton);
    sendFriendRequestButtonDiv.appendChild(friendRequestInput);
    sendFriendRequestButtonDiv.appendChild(messageParagraph);
    mainApplication.appendChild(sendFriendRequestButtonDiv);

    const friendCardDiv = document.createElement('div');
    friendCardDiv.classList.add('p-5');
    friendCardDiv.style.setProperty('display', 'flex');
    friendCardDiv.style.setProperty('justify-content', 'center');

    const friends = await getFriendsList();

    //Create friend list cards
    for(let i = 0; i < friends.length; i++) {
    
        const friendCard = document.createElement('div');
        friendCard.classList.add('card');
        friendCard.style.setProperty('width', '18rem');
    
        const friendCardBody = document.createElement('div');
        friendCardBody.classList.add('card-body');
        
        const cardHeading = document.createElement('h5');
        cardHeading.textContent = `${friends[i]['username']}`;
    
        const cardTextDiv = document.createElement('div');
        cardTextDiv.classList.add('card-text');
        cardTextDiv.classList.add('text-center');

        const dateAcceptedPara = document.createElement('p');
        dateAcceptedPara.classList.add('text-center');
        dateAcceptedPara.textContent = `Since: ${friends[i]['date_accepted']}`;
    
        const sharedReadingButton = document.createElement('p');
        sharedReadingButton.classList.add('button-small');
        sharedReadingButton.classList.add('accent-two-button');
        sharedReadingButton.textContent = "Shared Readings";

        cardTextDiv.appendChild(sharedReadingButton);
        friendCardBody.appendChild(cardHeading);
        friendCardBody.appendChild(dateAcceptedPara);
        friendCardBody.appendChild(cardTextDiv);
        friendCard.appendChild(friendCardBody);
        friendCardDiv.appendChild(friendCard);

        sharedReadingButton.addEventListener('click', (event) => myBooksHandler(event, friends[i]['user_id']));
    }
    
    mainApplication.appendChild(friendCardDiv);

    myBooksButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myBooksButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    myGroupsButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myGroupsButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    myFriendsButton.style.setProperty('--sidebar-text', colorsArray[0]);
    myFriendsButton.style.setProperty('--sidebar-bg', colorsArray[2]);

    myStatsButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myStatsButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    sendFriendRequestButton.addEventListener('click', (event)  => sendFriendRequest(event, messageParagraph));
}

/**
 *  This function fetches all current pending friend requests from book.php
 * @returns: array of pending requests
 */
async function getRequests() {
    const url = "assets/book.php?requests=requests";
    let requests = [];
    try {
        const response = await fetch(url);

        if(!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        requests = await response.json();
    }
    catch (error) {
        console.error("Error fetching data: ", error);
    }

    return requests
}

async function handleRequestChoice(event, username) {
    const code = event.target.textContent;
    const url = "assets/book.php";
    let message = "";
    try {
        let response = "";
        if(code === "Decline") {
            response = await fetch(url, {
                method: "DELETE", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code, 
                    username: username
                })
            });
        }
        else {
            response = await fetch(url, {
                method: "PUT", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code, 
                    username: username
                })
            });
        }

        if(!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        message = await response.json();

    } catch(error) {
        console.error("Error fetching data: ", error);
    }

    displayRequests(message);

}

async function displayRequests(message) {
    mainApplication.innerHTML = "";

    const headingDiv = document.createElement('div');
    headingDiv.classList.add('text-center');
    headingDiv.classList.add('p-5');
    headingDiv.id = "headingDiv";

    const heading = document.createElement('h5');
    heading.classList.add('display-4');
    heading.textContent = "Friend Requests";

    const messagePara = document.createElement('p');
    messagePara.textContent = message;

    const requestsDiv = document.createElement('div');
    requestsDiv.classList.add('p-5');
    requestsDiv.style.setProperty('display', 'flex');
    requestsDiv.style.setProperty('justify-content', 'center');
    requestsDiv.style.setProperty('flex-wrap', 'wrap');

    const friendRequests = await getRequests();
    for(let i = 0; i < friendRequests.length; i++) {
        const friendRequestDiv = document.createElement('div');
        friendRequestDiv.classList.add('card');
        friendRequestDiv.style.setProperty('width', '18rem');
        friendRequestDiv.classList.add('m-5');

        const friendRequestBody = document.createElement('div');
        friendRequestBody.classList.add('card-body');
        friendRequestBody.classList.add('text-center');

        const friendRequestUser = document.createElement('h5');
        friendRequestUser.classList.add('card-title');
        friendRequestUser.textContent = friendRequests[i]['username'];

        const dateSent = document.createElement('p');
        dateSent.textContent = friendRequests[i]['date_sent'];

        const buttonDiv = document.createElement('div');
        buttonDiv.classList.add('card-text');
        
        const acceptButton = document.createElement('span');
        acceptButton.classList.add('button-small');
        acceptButton.classList.add('accent-two-button');
        acceptButton.classList.add('m-2');
        acceptButton.textContent = "Accept";

        const declineButton = document.createElement('span');
        declineButton.classList.add('button-small');
        declineButton.classList.add('accent-two-button-inverse');
        declineButton.classList.add('m-2');
        declineButton.textContent = "Decline";

        acceptButton.addEventListener('click', (event) => handleRequestChoice(event, friendRequestUser.textContent));
        declineButton.addEventListener('click', (event => handleRequestChoice(event, friendRequestUser.textContent)));

        buttonDiv.appendChild(acceptButton);
        buttonDiv.appendChild(declineButton);
        friendRequestBody.appendChild(friendRequestUser);
        friendRequestBody.appendChild(dateSent);
        friendRequestBody.appendChild(buttonDiv);
        friendRequestDiv.appendChild(friendRequestBody);
        requestsDiv.appendChild(friendRequestDiv);
    }

    mainApplication.appendChild(headingDiv);
    headingDiv.appendChild(heading);
    headingDiv.appendChild(messagePara);
    mainApplication.appendChild(requestsDiv);

    

    myBooksButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myBooksButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    myGroupsButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myGroupsButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    myFriendsButton.style.setProperty('--sidebar-text', colorsArray[0]);
    myFriendsButton.style.setProperty('--sidebar-bg', colorsArray[2]);

    myStatsButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myStatsButton.style.setProperty('--sidebar-bg', colorsArray[0]);

}

/**
 * This function retrives the stats of the current user via fetch
 * @returns: The stats for the user that is currently logged in, stored in an array
 */
async function getStats() {
    wait = 1;
    let stats = [];
    const url = `assets/book.php?stats=stats`;
    try {
        const response = await fetch(url); 
        
        if(!response.ok) {
            throw new error(`HTTP Error ${response.status}`);
        }

        stats = await response.json();

    } catch(error) {
        console.log("Error fetching data: " + error);
    }
    wait = 0;
    return stats;
}

/**
 * This function retrieves the user's stats from the php script
 * @param {event} event: The triggering event for this function
 */
async function myStatsHandler(event) {
    myBooksButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myBooksButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    myGroupsButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myGroupsButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    myFriendsButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myFriendsButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    myStatsButton.style.setProperty('--sidebar-text', colorsArray[0]);
    myStatsButton.style.setProperty('--sidebar-bg', colorsArray[2]);

    mainApplication.innerHTML = "";

    const stats = await getStats()

    //Create Elements
    const container = document.createElement('div');
    container.classList.add('text-center');
    container.classList.add('p-5');
    container.style.setProperty("display", "flex");
    container.style.setProperty("justify-content", "center");

    const statsCard = document.createElement('div');
    statsCard.classList.add('card');
    statsCard.style.setProperty("width", "18rem");

    const statsCardBody = document.createElement('div');
    statsCardBody.classList.add('card-body');

    const heading = document.createElement('h5');
    heading.textContent = "My Stats";

    const totalPages = document.createElement('p');
    totalPages.textContent = `Total Pages Read: ${stats['total_pages']}`;

    const totalBooks = document.createElement('p');
    totalBooks.textContent = `Total Books Read: ${stats['total_books']}`;

    const today = new Date();
    const booksThisYear = document.createElement('p');
    booksThisYear.textContent = `Books Read In ${today.getFullYear()}: ${stats['this_year_books']}`;

    statsCardBody.appendChild(heading);
    statsCardBody.appendChild(totalPages);
    statsCardBody.appendChild(totalBooks);
    statsCardBody.appendChild(booksThisYear);
    statsCard.appendChild(statsCardBody);
    container.appendChild(statsCard);
    mainApplication.appendChild(container);
}

/**
 * This function gets the username of the current user and displays it in the top left corner of the page
 * @param {event} event 
 */
async function usernameOnLoad(event) {
    wait = 1;
    let username = "";
    const url = `assets/book.php?username=username`;
    try {
        const response = await fetch(url); 
        
        if(!response.ok) {
            throw new error(`HTTP Error ${response.status}`);
        }

        username = await response.json();

    } catch(error) {
        console.log("Error fetching data: " + error);
    }
    wait = 0;
    
    theCurrentUser.innerHTML += username;

    const unordered = document.querySelector('ul');
    const newLi = document.createElement('li');

    const form = document.createElement('form');
    form.action = 'app.php';
    form.method = "POST";
    form.style.setProperty("all", "revert");
    form.style.setProperty("display", "inline");
    form.style.setProperty("padding", "0");
    form.style.setProperty("margin", "0");

    const logoutButton = document.createElement('input');
    logoutButton.type = "submit";
    logoutButton.value = "Logout";
    logoutButton.name = "logout";
    logoutButton.classList.add("accent-one-button");
    logoutButton.classList.add('button-small');

    form.appendChild(logoutButton);
    newLi.appendChild(form);
    unordered.appendChild(newLi);
}

/**
 * This function brings up the books that the user has read. It will get that data from the backend
 */
myGroupsButton.addEventListener('click', function() {
    mainApplication.innerHTML = "";
    let myGroupCard = `
        <div class="p-5">
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">Group Name</h5>
                    <div class="card-text text-center">
                        <p>Genre/Description</p>
                        <p>Current Read</p>
                        <p>Member Count:</p>
                    </div>
                </div>
            </div>
        </div>`;
    mainApplication.innerHTML += myGroupCard;

    myBooksButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myBooksButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    myGroupsButton.style.setProperty('--sidebar-text', colorsArray[0]);
    myGroupsButton.style.setProperty('--sidebar-bg', colorsArray[2]);

    myFriendsButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myFriendsButton.style.setProperty('--sidebar-bg', colorsArray[0]);

    myStatsButton.style.setProperty('--sidebar-text', colorsArray[1]);
    myStatsButton.style.setProperty('--sidebar-bg', colorsArray[0]);
});

requestButton.addEventListener('click', (event) => displayRequests(""));
myFriendsButton.addEventListener('click', friendHandler);
myStatsButton.addEventListener('click', (event) => myStatsHandler(event));
myBooksButton.addEventListener('click', (event) => myBooksHandler(event, 0));
document.addEventListener('DOMContentLoaded', usernameOnLoad);