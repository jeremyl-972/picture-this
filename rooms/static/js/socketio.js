// MAIN LOGIC FOR VIEW-ROOM
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

// enable user engagment on audio element (for mobile devices)
let audioEngaged = false;
const audioBtn = document.getElementById("audioBtn");
audioBtn.classList.remove('hide');
audioBtn.addEventListener("click", ()=>{
    audioEngaged = true;
    audioBtn.classList.add("hide");
    mic.style.display = 'inline-block';
    const audioTag = document.getElementById("audioTag");
    audioTag.play();
});
// All the message receiving logic:
socket.on('receive_audio', async (data) => {
    if (audioEngaged) {
        console.log(data);
        // const audioTag = document.getElementById("audioTag");
        // const sourceTag = document.getElementById('sourceTag');
        // let audioChunks = [];
        // audioChunks.push(data.audio);
        // const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const context = new AudioContext();
        playSound(data.audio, context)


        // const audioUrl = window.URL.createObjectURL(audioBlob);
        // sourceTag.setAttribute('src', audioUrl);
        // sourceTag.srcObject = audioUrl;
        // sourceTag.type = 'audio/wav';
        // audioTag.load();
        // audioTag.play();
    };
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

function connectToSpeaker(audio, gain) {
    // for legacy browsers
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    const audioNode = audioContext.createMediaStreamSource(audio);
    const gainNode = audioContext.createGain();
    // some device volume too low ex) iPad
    gainNode.gain.value = gain;
    audioNode.connect(gainNode);
    gainNode.connect(audioContext.destination);
}; 


function playSound(buffer, context) {
    const float32Buffer = new Float32Array(buffer);
    console.log(float32Buffer);
    const audioBuffer = new AudioBuffer({
        length: float32Buffer.length,
        sampleRate: 48000
    });
    audioBuffer.copyToChannel(float32Buffer, 0, 0);
    const source = context.createBufferSource(); // creates a sound source
    source.buffer = audioBuffer;                // tell the source which sound to play
    source.connect(context.destination); 
    console.log(source);      // connect the source to the context's destination (the speakers)
    source.noteOn(0);                         // play the source now
}

