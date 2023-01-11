// MAIN LOGIC WITH NON RE-USABLE COMPONENTS
announceWithLoader('Connecting to room');

const socket = io("http://localhost:5000");
    // user joining socketio room from rooms.html or create_room.html
socket.on('connect', () => {
    socket.emit('join_room', {
        username: username,
        room: room_name,
        user_id: user_id
    });
});
// component initialized after join_room announcment
socket.on('join_room_announcement', (data) => {
    clearElement('announcements');
    const newNode = make__div();
    newNode.innerHTML = username === data.username ? 'You have joined the room' : `<b>${data.username}</b> has joined the room`;
    announcementElement.appendChild(newNode);
    if (data.count === 1){
        component.append(difficulty_buttons());
    }
    else {
        if (username === data.username) {
            clearAll();
            announceWithLoader('Waiting your opponent to chose a word and draw')
        }
        else {
            heading.removeAttribute('hidden');
            component.removeAttribute('hidden');
        }
    };
});
// reroute to view_room when opponent leaves the room
socket.on('leave_room_announcement', (data) => {
    clearAll();
    announceWithLoader(`${data.username} has left the room`);
    window.location.href = `http://127.0.0.1:5000/rooms/view-room/${data.room_name}/`;
});

const choseWord = async (word, diff_level) => {
    const levels = [{level: 'Easy', points: 1}, {level: 'Med', points: 3}, {level: 'Hard', points: 5}]
    let points = 0;
    for (let i = 0; i < 3; i++) {
        if (levels[i].level === diff_level) {
            points = levels[i].points;
        };
    };
    socket.emit('chose_word', {
        username: username,
        user_id: user_id,
        room: room_name,
        word: word,
        points: points
    });
    // check number of connected members
    const response = await fetch(`/rooms/connected_members/${room_name}`)
    const data = await response.json();

    if (data.count < 2) {
        clearElement('announcements');
        announceWithLoader("Waiting for your opponent to join");
    }
    else {
        clearElement('announcements');
        heading.removeAttribute('hidden');
        component.removeAttribute('hidden');
    };
};

socket.on('is_drawing_prompt', (data) => {
    if (username != data.username) {
        clearElement('announcements');
        announceWithLoader(data.message);
    }
    else if (data.count > 1) {
        heading.removeAttribute('hidden');
        component.removeAttribute('hidden');
    };
});

const sentSketch = (sketch_url) => {
    socket.emit('sent_sketch', {
        username: username,
        user_id: user_id,
        room: room_name,
        url: sketch_url
    });
};


socket.on('receive_sketch', (data) => {
    receive_sketch(data);
    const guessForm = make_guess_form();
    component.appendChild(guessForm);
});

const onGuess = (guess) => {
    const guessInput = document.getElementById('guessInput');
    guessInput.value = '';
    if (guess) {
        socket.emit('sent_guess', {
            guess: guess,
            room: room_name,
            username: username
        });
    };
};


socket.on('guess_response', (data) => {
    if (username === data.username) {
        clearElement('announcements');
        announcementElement.append(data.message)
        if (data.message === 'Correct!') {
            clearAll();
            announceWithLoader(data.message);
            setTimeout(() => {
                component.append(difficulty_buttons());
            }, 3000);
        };
    };
});

socket.on('switch_turns', (data) => {
    announceWithLoader(`${data.username} scored ${data.points} points`);
    setTimeout(() => {
        setWaitingScreen();
    }, 3000);
});