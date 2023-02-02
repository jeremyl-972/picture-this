// MAIN LOGIC FOR VIEW-ROOM
announceWithLoader('Connecting to room', clear=false);

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
    document.getElementById('score').innerText = `Score: 0`
    clearAll();
    announcementElement.style.marginTop = '45px';
    announceWithLoader(`${data.username} has left the room`);
    window.location.href = `http://127.0.0.1:5000/rooms/view-room/${data.room_name}/`;
});

// component initialized after join_room announcment
socket.on('join_room_announcement', (data) => {
    document.getElementById('topScore').innerText = `Top Score: ${data.topScore}`
    let joinee_is_self = username === data.username ? true : false;

    announcementElement.innerHTML = '';
    const newNode = make__div();
    newNode.innerHTML = joinee_is_self ? 'You have joined the room' : `<b>${data.username}</b> has joined the room`;
    announcementElement.appendChild(newNode);
    
    // if player count is 1, initialize wait for second player
    if (data.count === 1){
        DRAWING_PLAYER = username;
        announceWithLoader("Waiting for your opponent to join");
    }
    else {
        GUESSING_PLAYER = data.username;

        if (!joinee_is_self) {
            socket.emit('introduce_drawing_player', {username:username, room:room_name})
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
        const editedGuess = guess.toLowerCase().trim();
        setTimeout(() => {
            socket.emit('sent_guess', {
                guess: editedGuess,
                room: room_name,
                username: username
            });
        }, 1500);
    };
};


socket.on('guess_response', (data) => {
    // on correct guess
    if (data.message === 'Yes!') {
        // swap players
        let TEMP = DRAWING_PLAYER;
        DRAWING_PLAYER = GUESSING_PLAYER;
        GUESSING_PLAYER = TEMP;
        CLIENT_GUESSING = !CLIENT_GUESSING;
        // clear timer
        clearInterval(myInterval);
        clearAll();
        // update scoreboard
        if (data.keepUpdating) document.getElementById('topScore').innerText = `Top Score: ${data.score}`;
        document.getElementById('score').innerText = `Score: ${data.score}`
        // update announcements
        announcementElement.style.marginTop = '45px';
        announcePointsScored();

        console.log(data.toppedScore);

        if (data.toppedScore) {
            setTimeout(() => {
                announcementElement.innerHTML = '';
                announce('Top Score Achieved!');
                announceWithLoader('Switching turns');
            }, 2000);
        } else {
            announceWithLoader('Switching turns');
        };

        setTimeout(() => {
            if (username === data.username) component.append(difficulty_buttons());
            else setWaitingScreen(data.username);
        }, 5000);

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
    function announcePointsScored() {
        announce(username === data.username ?
            `You guessed it. ${data.points === 1 ? `${data.points} point` : `${data.points} points`} awarded!` 
           : `${data.username} guessed it. ${data.points === 1 ? `${data.points} point` : `${data.points} points`} awarded!`);
    };
});


const timed_out = () => {
    let TEMP = DRAWING_PLAYER;
    DRAWING_PLAYER = GUESSING_PLAYER;
    GUESSING_PLAYER = TEMP;
    announcementElement.innerHTML = '';
    clearComponent();
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