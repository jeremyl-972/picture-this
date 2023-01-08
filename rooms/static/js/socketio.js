const socket = io("http://localhost:5000");
    // user joining socketio room from rooms.html or create_room.html
socket.on('connect', function () {
    console.log('connection');
    socket.emit('join_room', {
        username: username,
        room: room_name,
        user_id: user_id
    });
});

window.onbeforeunload = async () => {
    let response = await fetch(`/rooms/${room_name}/${user_id}/disconnect`);
    console.log(response);
    socket.emit('leave_room', {
        username: username,
        room: room_name,
        user_id: user_id
    });
};

socket.on('join_room_announcement', function (data) {
    console.log('announcement made');
    const newNode = document.createElement('div');
    newNode.innerHTML = `<b>${data.username}</b> has joined the room`;
    document.getElementById('announcements').appendChild(newNode);
    if (connected_members.length < 2)
    clearComponent();
    component.appendChild(difficulty_buttons());
});

socket.on('leave_room_announcement', function (data) {
    const newNode = document.createElement('div');
    newNode.innerHTML = `<b>${data.username}</b> has left the room`;
    document.getElementById('announcements').appendChild(newNode);
});

socket.on('prompt', (data) => {
    const newNode = document.createElement('div');
    newNode.innerHTML = `${data.message}`;
    const announcementElement = document.getElementById('announcements');
    announcementElement.innerHTML = '';
    announcementElement.appendChild(newNode);
});

const emitWord = (word, diff_level) => {
    console.log("emitWord fired");
    socket.emit('emit_word', {
        username: username,
        user_id: user_id,
        room: room_name,
        word: word,
        diff_level: diff_level
    });
};

const emitSketch = (sketch_url) => {
    console.log("emitSketch fired");
    socket.emit('emit_sketch', {
        username: username,
        user_id: user_id,
        room: room_name,
        url: sketch_url
    });
};

socket.on('receive_sketch', function (data) {
    console.log("got something back");
    var img = new Image;
    img.src = data.url;
    const div = make__div("center-up-flex-column");
    div.appendChild(img);
    clearComponent();
    component.append(div);
});

// const test = document.getElementById('test');
// test.addEventListener('click', async () => {
//     let response = await fetch(`/rooms/${room_name}/`);
//     console.log(response);

//     socket.emit('', {
//         username: username,
//         room: room_name
//     })
// });

