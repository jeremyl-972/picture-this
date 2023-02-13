// MAIN LOGIC FOR VIEW-ROOM
document.getElementById('langBtn').setAttribute('hidden', 'hidden');

const socket = io("http://localhost:5000");

// user joining socketio room from rooms.html or create_room.html
socket.on('connect', () => {
    announceWithLoader(t('socketio.connecting'));

    socket.emit('join_room', {
        username: user,
        room: room_name,
        user_id: user_id
    });
});

let CLIENT_GUESSING = false;
let DRAWING_PLAYER = '';
let GUESSING_PLAYER = '';
let score_object = {'total': 0, 'topScore': 0, 'topped': false};
let word_object = {'word': null, 'word_value': null};

// reroute to view_room when opponent leaves the room
socket.on('leave_room_announcement', (data) => {
    score_object.total = 0;
    document.getElementById('score').innerText = `Score: ${score_object.total}`
    clearAll();
    announcementElement.style.marginTop = '45px';
    announceWithLoader(`${data.username} ${t('socketio.leftRm')}`);
    window.location.href = `http://127.0.0.1:5000/rooms/view-room/${data.room_name}/`;
});

// component initialized after join_room announcment
socket.on('join_room_announcement', (data) => {
    score_object.topScore = data.topScore;
    document.getElementById('topScore').innerText = `${t('socketio.topScore')} ${data.topScore}`
    let joinee_is_self = user === data.username ? true : false;

    announcementElement.innerHTML = '';
    const newNode = make__div();
    newNode.innerHTML = joinee_is_self ? t('socketio.selfJoined') : `<b>${data.username}</b> ${t('socketio.opponentJoined')}`;
    announcementElement.appendChild(newNode);
    
    // if player count is 1, initialize wait for second player
    if (data.count === 1){
        DRAWING_PLAYER = user;
        announceWithLoader(t('socketio.waiting'));
    }
    else {
        GUESSING_PLAYER = data.username;

        if (!joinee_is_self) {
            socket.emit(t('intro'), {username:user, room:room_name})
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


const choseWord = async (word, diff_level) => {
    const levels = [{level: 'Easy', points: 1}, {level: 'Med', points: 3}, {level: 'Hard', points: 5}]
    let points = 0;
    for (let i = 0; i < 3; i++) {
        if (levels[i].level === diff_level) {
            points = levels[i].points;
        };
    };
    word_object.word = word;
    word_object.word_value = points;
    socket.emit('chose_word', {
        username: user,
        user_id: user_id,
        room: room_name,
        word_object: word_object,
    });

    socket.emit('activate_timer', {
        room: room_name,
    });
};

socket.on('send_word', (word_data) => {
    word_object.word = word_data.word;
    word_object.word_value = word_data.word_value;
})

socket.on('start_timer', () => {
    component.removeAttribute('hidden');
    startTimer();
});


const emittingSketch = (sketch_url) => {
    socket.emit('emit_sketch', {
        room: room_name,
        url: sketch_url,
        username: user
    });
};


socket.on('getting_sketch', (data) => {
    getting_sketch(data);
    const guessForm = make_guess_form();
    component.appendChild(guessForm);
});


const onGuess = (guess) => {
    console.log(score_object)
    const guessInput = document.getElementById('guessInput');
    guessInput.value = '';
    if (guess) {
        const editedGuess = guess.toLowerCase().trim();
        setTimeout(() => {
            socket.emit('sent_guess', {
                word_object: word_object,
                guess: editedGuess,
                room: room_name,
                username: user,
                score_object: score_object,
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
        score_object.total += data.score;
        // clear timer
        clearInterval(myInterval);
        clearAll();
        // update scoreboard
        if (data.keepUpdating) document.getElementById('topScore').innerText = `${t('socketio.topScore')} ${data.score}`;
        document.getElementById('score').innerText = `${t('socketio.score')} ${data.score}`
        // update announcements
        announcementElement.style.marginTop = '45px';
        announcePointsScored();
        
        if (data.toppedScore) {
            score_object.topped = true;
            setTimeout(() => {
                announcementElement.innerHTML = '';
                announce(t('socketio.topped'));
                announceWithLoader(t('socketio.switching'));
            }, 2000);
        } else {
            announceWithLoader(t('socketio.switching'));
        };

        setTimeout(() => {
            if (user === data.username) component.append(difficulty_buttons());
            else setWaitingScreen(data.username);
        }, 5000);

    } else {
        // document.getElementById('guessBox').innerHTML = `Guess: ${data.guess}`;
        if (user === data.username) {
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
        if (i18next.language === 'iw') {
            announce(`${t('socketio.awarded')} ${data.points === 1 ? `${t('socketio.point')} ${data.points}` : `${t('socketio.points')} ${data.points}`} ${t(user === data.username ? 'socketio.selfGuessed' : 'socketio.opponentGuessed')}`);
        } else {
            announce(`${t(user === data.username ? 'socketio.selfGuessed' : 'socketio.opponentGuessed')} ${data.points === 1 ? `${data.points} ${t('socketio.point')}` : `${data.points} ${t('socketio.points')}`} ${t('socketio.awarded')}`);
        }
    };
});


const timed_out = () => {
    let TEMP = DRAWING_PLAYER;
    DRAWING_PLAYER = GUESSING_PLAYER;
    GUESSING_PLAYER = TEMP;
    announcementElement.innerHTML = '';
    clearComponent();
    announceWithLoader(t('timesUp'));
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