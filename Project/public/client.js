const socket = io('http://localhost:8000');

const form = document.getElementById('send-container');
const messageContainer = document.getElementById("Chat-content");
const messageInput = document.getElementById('messageInp');
const OnBoard= document.querySelector(".UsersOnB");


// Function which will append message info to the container
const append = (message, position) => {
    const messageElement = document.createElement('div');  // Creating a div element for the message
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
};


const append2 = (imageUrl,name, position) => {
    const userElement = document.createElement('div');
    userElement.style.display = 'flex'; // Set the display to flex for row layout
    userElement.style.alignItems = 'center'; // Align items in the center vertically
    userElement.classList.add('user', position);

    const textElement = document.createElement('span'); // Create a span for text content
    textElement.innerText = name;
    textElement.style.marginLeft = '10px'; // Add margin to separate text from image

    const imageElement = document.createElement('img');
    imageElement.src = imageUrl;
    imageElement.alt = `Image of ${name}`;
    imageElement.style.width = '20px'; // Set image width
    imageElement.style.height = '20px'; // Set image height
    imageElement.style.marginLeft='5px';

    userElement.appendChild(imageElement);
    userElement.appendChild(textElement); // Append the text element before the image


    OnBoard.append(userElement);
};



// If the form gets submitted, send server the message
form.addEventListener('submit', (e) => {
    e.preventDefault();       //PAGE WON'T RELOAD USING THIS
    const message = messageInput.value;  //Taking the message input value
    append(`You: ${message}`, 'right');   //appending it with You and giving it position right
    socket.emit('send', message);   //Sending the message to the server using socket.emit
    messageInput.value = '';   //Clearing the input field after sending the message
});


// ASK THE NEW USER JOINED FOR THIER NAME
const name = prompt("Enter your name to join");
socket.emit('new-user-joined', name);   //Sending the name to the server that is node module


// If a new user joins, receive his/her name from the server
socket.on('user-joined', name => {
    append2('images/online.png',`${name} is online`,'online');
});

// If server sends a message receive it
socket.on('receive', data => {
    append(`${data.name}: ${data.message}`, 'left');
});

// If a user leaves the chat, append the info to the container
socket.on('left', name => {
    append2('images/online.png',`${name} is offline`,'offline');
});
