const socket = io.connect("http://127.0.0.1:5000");

socket.on('connect', function () {
    socket.emit('join_room', {
        username: username,
        room: room
    });

    let sketch_input = document.getElementById('sketch_input');

    document.getElementById('sketch_input_form').onsubmit = function (e) {
        e.preventDefault();
        let sketch = sketch_input.value.trim();
        if (sketch.length) {
            socket.emit('send_sketch', {
                user_id: user_id,
                username: username,
                room_id: room_id,
                room: room,
                sketch: sketch
            })
        }
        sketch_input.value = '';
        sketch_input.focus();
    }
});


socket.on('receive_sketch', function (data) {
    console.log(data);
    const newNode = document.createElement('div');
    newNode.innerHTML = `<b>${data.username}&nbsp;[${data.created_at}]:&nbsp;</b> ${data.sketch}`;
    document.getElementById('sketches').appendChild(newNode);
    toggle('sendBtn', 'loadingBtn')
});

let page = 0;

document.getElementById("load_older_sketches_btn").onclick = (e) => {
    page += 1;
    
    fetch(`/rooms/${room_id}/sketches?page=` + page).then(response => {
        response.json().then(sketches => {
            sketches.reverse().forEach(sketch => prepend_sketch(sketch.sketch, sketch.created_by, sketch.created_at));
        })
    })
};

function prepend_sketch(sketch, username, created_at) {
    const newNode = document.createElement('div');
    newNode.innerHTML = `<b>${username}&nbsp;[${created_at}]:&nbsp;</b> ${sketch}`;
    const sketches_div = document.getElementById('sketches');
    sketches_div.insertBefore(newNode, sketches_div.firstChild);
}

window.onbeforeunload = function () {
    socket.emit('leave_room', {
        username: "{{ username }}",
        room: "{{ room_id }}"
    })
};


socket.on('join_room_announcement', function (data) {
    console.log(data);
    if (data.username !== "{{ username }}") {
        const newNode = document.createElement('div');
        newNode.innerHTML = `<b>${data.username}</b> has joined the room`;
        document.getElementById('sketches').appendChild(newNode);
    }
});

socket.on('leave_room_announcement', function (data) {
    console.log(data);
    const newNode = document.createElement('div');
    newNode.innerHTML = `<b>${data.username}</b> has left the room`;
    document.getElementById('sketches').appendChild(newNode);
});