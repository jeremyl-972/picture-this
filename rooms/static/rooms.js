const socket = io("http://localhost:5000");
    // user joining socketio room from rooms.html or create_room.html
socket.on('connect', function () {
    console.log('connection');
    socket.emit('join_room', {
        username: username,
        room: room_name
    });
});

console.log(connected_members);

window.onbeforeunload = async () => {
    let response = await fetch(`/rooms/${room_name}/${user_id}/disconnect`);
    console.log(response);

    socket.emit('leave_room', {
        username: username,
        room: room_name
    })
};

const test = document.getElementById('test');
test.addEventListener('click', async () => {
    let response = await fetch(`/rooms/${room_name}/${user_id}/disconnect`);
    console.log(response);

    socket.emit('leave_room', {
        username: username,
        room: room_name
    })
});

socket.on('join_room_announcement', function (data) {
    console.log('announcement made');
    const newNode = document.createElement('div');
    newNode.innerHTML = `<b>${data.username}</b> has joined the room`;
    document.getElementById('announcements').appendChild(newNode);
});

socket.on('leave_room_announcement', function (data) {
    const newNode = document.createElement('div');
    newNode.innerHTML = `<b>${data.username}</b> has left the room`;
    document.getElementById('announcements').appendChild(newNode);
});




    // client receiving user joined room announcement and displays on page

    input.focus();


    // client emits send_message event on form input submission
    const input_form = document.getElementById('input_form')
    input_form.onsubmit = (e) => {
        e.preventDefault();
        let message = input.value.trim();
        if (message.length) {
            socket.emit('send_message', {
                username: "{{data['user']}}",
                room: "{{data['room']}}",
                message: message
            })
        }
        input.value = '';
        input.focus();
    }

    // client receives message from another client in the room
    socket.on('receive_message', function (data){
        console.log(data);
        const pTag = document.createElement('p');
        pTag.innerHTML = `<b>${data.username}</b> says: ${data.message}`;
        messagesContainer.appendChild(pTag)
    });

    // pTag.innerHTML = JSON.parse('{{ data['user'] | tojson }}');