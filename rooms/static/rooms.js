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

// // client emits send_message event on form input submission
// const input_form = document.getElementById('input_form')
// input_form.onsubmit = (e) => {
//     e.preventDefault();
//     let message = input.value.trim();
//     if (message.length) {
//         socket.emit('send_message', {
//             username: "{{data['user']}}",
//             room: "{{data['room']}}",
//             message: message
//         })
//     }
//     input.value = '';
//     input.focus();
// }

// // client receives message from another client in the room
// socket.on('receive_message', function (data){
//     console.log(data);
//     const pTag = document.createElement('p');
//     pTag.innerHTML = `<b>${data.username}</b> says: ${data.message}`;
//     messagesContainer.appendChild(pTag)
// });

// // pTag.innerHTML = JSON.parse('{{ data['user'] | tojson }}');
// let sketch_input = document.getElementById('sketch_input');

// document.getElementById('sketch_input_form').onsubmit = function (e) {
//     e.preventDefault();
//     let sketch = sketch_input.value.trim();
//     if (sketch.length) {
//         socket.emit('send_sketch', {
//             user_id: user_id,
//             username: username,
//             room_id: room_id,
//                 room: room,
//             sketch: sketch
//         });
//     };
//     sketch_input.value = '';
//     sketch_input.focus();
// };



// socket.on('receive_sketch', function (data) {
//     console.log(data);
//     const newNode = document.createElement('div');
//     newNode.innerHTML = `<b>${data.username}&nbsp;[${data.created_at}]:&nbsp;</b> ${data.sketch}`;
//     document.getElementById('sketches').appendChild(newNode);
//     toggle('sendBtn', 'loadingBtn')
// });

// let page = 0;

// document.getElementById("load_older_sketches_btn").onclick = (e) => {
//     page += 1;
    
//     fetch(`/rooms/${room_id}/sketches?page=` + page).then(response => {
//         response.json().then(sketches => {
//             sketches.reverse().forEach(sketch => prepend_sketch(sketch.sketch, sketch.created_by, sketch.created_at));
//         })
//     })
// };

// function prepend_sketch(sketch, username, created_at) {
//     const newNode = document.createElement('div');
//     newNode.innerHTML = `<b>${username}&nbsp;[${created_at}]:&nbsp;</b> ${sketch}`;
//     const sketches_div = document.getElementById('sketches');
//     sketches_div.insertBefore(newNode, sketches_div.firstChild);
// }
