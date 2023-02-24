// MAIN LOGIC FOR VIEW-ROOM
const langSelect = document.querySelector('.lang-select');
langSelect.style.display = 'none';

// const socket = io("http://localhost:5000");
const socket = io("https://www.ilpicturethis.com")

// user joining socketio room from rooms.html or create_room.html
socket.on('connect', async() => {
    announceWithLoader('');

    socket.emit('join_room', {
        username: user,
        room: room_name,
        user_id: user_id,
        user_lang: i18next.language
    });
});

let CLIENT_GUESSING = false;
let DRAWING_PLAYER = {'name': null, 'lang': null};
let GUESSING_PLAYER = {'name': null, 'lang': null};
let score_object = {'score': 0, 'topScore': 0, 'topped': false};
let word_object = {'word': null, 'word_value': null};

socket.on('receive_audio', (data) => {
    let audioChunks = [];
    audioChunks.push(data.audio)
    const audioBlob = new Blob(audioChunks);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    // audio.play();
    const sound = new Howl({
        src: [audio]
      });
    sound.play();
});

// reroute to view_room when opponent leaves the room
socket.on('leave_room_announcement', (data) => {
    score_object.score = 0;
    document.getElementById('score').innerText = `${t('viewRoom.initScore')}`
    clearAll();
    announcementElement.style.marginTop = '45px';
    announceWithLoader(`${data.username} ${t('socketio.leftRm')}`);
    // window.location.href = `http://127.0.0.1:5000/rooms/view-room/${data.room_name}/`;
    window.location.href = `https://www.ilpicturethis.com/rooms/view-room/${data.room_name}/`;
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
    
    // if player count is 1, wait for second player
    if (data.count === 1){
        DRAWING_PLAYER.name = data.username;
        DRAWING_PLAYER.lang = i18next.language;
        announceWithLoader(t('socketio.waiting'));
    }
    else {
        GUESSING_PLAYER.name = data.username;
        GUESSING_PLAYER.lang = data.user_lang;
        if (!joinee_is_self) {
            socket.emit('introduce_drawing_player', {username:user, room:room_name})
            setTimeout(() => {component.append(difficulty_buttons())}, 2000)
        };
    };
});


socket.on('hello_from_player1', (data) => {
    CLIENT_GUESSING = true;
    DRAWING_PLAYER.name = data.username
    // player2 waits for player 1 to draw sketch
    setWaitingScreen(DRAWING_PLAYER.name);
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
        artist_lang: DRAWING_PLAYER.lang,
        guesser_lang: GUESSING_PLAYER.lang,
    });

    socket.emit('activate_timer', {
        room: room_name,
    });
};

socket.on('send_word', (word_dict) => {
    console.log('received word_dict: ', word_dict);
    word_object = word_dict;
});

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
                lang: i18next.language
            });
        }, 1500);
    };
};


socket.on('guess_response', (data) => {
    // on correct guess
    if (data.correct === true) {
        // swap players
        let TEMP = DRAWING_PLAYER;
        DRAWING_PLAYER = GUESSING_PLAYER;
        GUESSING_PLAYER = TEMP;
        CLIENT_GUESSING = !CLIENT_GUESSING;
        // update score object
        score_object = data.score_dict;
        // clear timer
        clearInterval(myInterval);
        clearAll();
        // update scoreboard
        document.getElementById('topScore').innerText = `${t('socketio.topScore')} ${score_object.topScore}`;
        document.getElementById('score').innerText = `${t('socketio.score')} ${score_object.score}`
        // update announcements
        announcementElement.style.marginTop = '45px';
        announcePointsScored();
        
        if (score_object.topped) {
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
        }, 10000);

    } else {
        if (user === data.username) {
            const loadBtn = document.getElementById('loadBtn');
            const newNode = document.createTextNode(data.message);
            loadBtn.replaceChild(newNode, loadBtn.childNodes[2]);
    
            setTimeout(() => {
                toggle('guessBtn', 'loadBtn');
            }, 1500);
        } else {
            document.getElementById('guessBox').innerHTML =
                i18next.language === 'iw' ? `${data.guess} ${t('socketio.guessBox')} ${data.username}` : `${data.username} ${t('socketio.guessBox')} ${data.guess}`;
        };
    };
    function announcePointsScored() {
        const points = word_object.word_value
        if (word_object.word_value === 1 && i18next.language === 'iw') {
            user === data.username ? 
                announce(`!${t('socketio.selfGuessed')}! ` + `${t('socketio.point')}` + ' 1 ' + `${t('socketio.awarded')}`) 
                : announce(`!${t('socketio.opponentGuessed')}! ` +`${t('socketio.point')}` + ' 1 ' + `${t('socketio.awarded')}` + ` ${data.username}`);
        } else if (i18next.language === 'iw') {
            user === data.username ? 
                announce(`!${t('socketio.selfGuessed')}! ` + ` ${points} ` + `${t('socketio.points')} ` + `${t('socketio.awarded')}`) 
                : announce(`!${t('socketio.opponentGuessed')}! ` + ` ${points} ` + `${t('socketio.points')} ` + `${t('socketio.awarded')}` + ` ${data.username}`);
        } else if (i18next.language != 'iw' && points === 1) {
            announce(`${(user === data.username ? t('socketio.selfGuessed') : `${data.username} ${t('socketio.opponentGuessed')}`)} ${t('socketio.point')} ${t('socketio.awarded')}`);
        } else if (i18next.language != 'iw') {
            announce(`${(user === data.username ? t('socketio.selfGuessed') : `${data.username} ${t('socketio.opponentGuessed')}`)} ${points} ${t('socketio.points')} ${t('socketio.awarded')}`);
        }     
    };
});


const timed_out = () => {
    let TEMP = DRAWING_PLAYER;
    DRAWING_PLAYER = GUESSING_PLAYER;
    GUESSING_PLAYER = TEMP;
    announcementElement.innerHTML = '';
    clearComponent();
    announce(`${word_object.word} ${t('socketio.answer')}`);
    announceWithLoader(t('socketio.timesUp'))
    if (CLIENT_GUESSING) {
        CLIENT_GUESSING = !CLIENT_GUESSING;
        setTimeout(() => {
            component.append(difficulty_buttons());
        }, 3000);
    } 
    else {
        CLIENT_GUESSING = !CLIENT_GUESSING;
        setTimeout(() => {
            setWaitingScreen(DRAWING_PLAYER.name);
        }, 3000);
    };
};