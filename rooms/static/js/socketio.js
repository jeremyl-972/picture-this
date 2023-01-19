// MAIN LOGIC FOR VIEW-ROOM
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
    let joinee_is_self = username === data.username ? true : false;

    clearElement('announcements');
    const newNode = make__div();
    newNode.innerHTML = joinee_is_self ? 'You have joined the room' : `<b>${data.username}</b> has joined the room`;
    announcementElement.appendChild(newNode);
    
    // if player count is 1, initialize difficulty buttons
    if (data.count === 1){
        component.append(difficulty_buttons());
    }
    else {
        // player2 waits for player 1 to draw sketch
        if (joinee_is_self) {
            clearAll();
            announceWithLoader(`Waiting for your opponent to draw`)
        }
        else {
            console.log('removing hidden attribute');
            // player1 sees initialized canvas
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


// word and level gets stored on server
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

const emittingSketch = (sketch_url) => {
    socket.emit('emit_sketch', {
        username: username,
        user_id: user_id,
        room: room_name,
        url: sketch_url
    });
};


socket.on('getting_sketch', (data) => {
    getting_sketch(data);
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
        if (data.message === 'No!') {
            const loadBtn = document.getElementById('loadBtn');
            const newNode = document.createTextNode(data.message);
            loadBtn.replaceChild(newNode, loadBtn.childNodes[2]);
        };

        setTimeout(() => {
            toggle('guessBtn', 'loadBtn');
        }, 1500);

        if (data.message === 'Yes!') {
            clearAll();
            announceWithLoader('You got it! Switching turns');
            setTimeout(() => {
                component.append(difficulty_buttons());
            }, 3000);
        };
    };
});


socket.on('switch_turns', (data) => {
    clearAll();
    announceWithLoader(`${data.username} guessed it and scored ${data.points} points`);
    setTimeout(() => {
        setWaitingScreen(data.username);
    }, 3000);
});