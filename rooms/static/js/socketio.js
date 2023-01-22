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

let CLIENT_GUESSING = false;
let DRAWING_PLAYER = '';
let GUESSING_PLAYER = '';

// reroute to view_room when opponent leaves the room
socket.on('leave_room_announcement', (data) => {
    clearAll();
    announceWithLoader(`${data.username} has left the room`);
    window.location.href = `http://127.0.0.1:5000/rooms/view-room/${data.room_name}/`;
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
        DRAWING_PLAYER = username;
        announceWithLoader("Waiting for your opponent to join");
    }
    else {
        GUESSING_PLAYER = data.username;

        if (!joinee_is_self) {
            socket.emit('introduce_drawing_player', {username:username})
            setTimeout(() => {component.append(difficulty_buttons())}, 2000)
        };
    };
});


socket.on('hello_from_player1', (data) => {
    CLIENT_GUESSING = true;
    DRAWING_PLAYER = data.username
    // player2 waits for player 1 to draw sketch
    setWaitingScreen(DRAWING_PLAYER);
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

    socket.emit('activate_timer', {
        room: room_name,
    });
};

socket.on('start_timer', () => {
    heading.removeAttribute('hidden');
    component.removeAttribute('hidden');
    startTimer();
});


const emittingSketch = (sketch_url) => {
    socket.emit('emit_sketch', {
        room: room_name,
        url: sketch_url,
        username: username
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
        setTimeout(() => {
            socket.emit('sent_guess', {
                guess: guess,
                room: room_name,
                username: username
            });
        }, 1500);
    };
};


socket.on('guess_response', (data) => {
    console.log(data);
    if (data.message === 'Yes!') {
        clearInterval(myInterval);
        document.getElementById('scoreboard').innerText = `Score: ${data.score}`
        
        let TEMP = DRAWING_PLAYER;
        DRAWING_PLAYER = GUESSING_PLAYER;
        GUESSING_PLAYER = TEMP;
        CLIENT_GUESSING = !CLIENT_GUESSING;

        clearElement('announcements');
        announcementElement.append(username === data.username ? `You guessed it. ${data.points} points awarded!` : `${data.username} guessed it. ${data.points} points awarded!`);
        announceWithLoader('Switching turns');
        setTimeout(() => {
            if (username === data.username) component.append(difficulty_buttons());
            else setWaitingScreen(data.username);
        }, 3000);

    } else {
        if (username === data.username) {
            if (data.message === 'No!') {
                const loadBtn = document.getElementById('loadBtn');
                const newNode = document.createTextNode(data.message);
                loadBtn.replaceChild(newNode, loadBtn.childNodes[2]);
    
                setTimeout(() => {
                    toggle('guessBtn', 'loadBtn');
                }, 1500);
            };
        };
    };
});


const timed_out = () => {
    let TEMP = DRAWING_PLAYER;
    DRAWING_PLAYER = GUESSING_PLAYER;
    GUESSING_PLAYER = TEMP;
    clearAll();
    announceWithLoader("Time's up! Switching turns");
    if (CLIENT_GUESSING) {
        CLIENT_GUESSING = !CLIENT_GUESSING;
        setTimeout(() => {
            component.append(difficulty_buttons());
        }, 3000);
    } 
    else {
        CLIENT_GUESSING = !CLIENT_GUESSING;
        setTimeout(() => {
            setWaitingScreen(DRAWING_PLAYER);
        }, 3000);
    };
};