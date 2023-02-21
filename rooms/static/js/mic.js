// GET MICROPHONE PERMISSION
document.addEventListener('DOMContentLoaded', navigator.mediaDevices.getUserMedia({audio: true}))    

// DEFINE DOM ELEMENTS
const mic = document.getElementById('recordBtn');
mic.style.display = 'inline-block';
const micToolTip = document.getElementById('tooltip');
const tooltipX = document.getElementById('tooltipX');
const recording = document.getElementById('recording');
const clock = document.getElementById('clock');

// FASTPRESS RECORD BTN - TOOLTIP OPENS
tooltipX.addEventListener('click', (e) => {
  micToolTip.style.display = 'none';
  tooltipOpen = false;
});

// hide tooltip when clicking outside mic
document.addEventListener('click', (e) => {
    if (!mic.contains(e.target)) {
      micToolTip.style.display = 'none';
      tooltipOpen = false;
    };
});

// HOLDPRESS RECORD BTN - adapted from: https://www.kirupa.com/html5/press_and_hold.htm
// While the press is still active, you need to ensure you are holding the press
// Once you've held the press long enough, you fire an event to signal that this gesture was successfully completed
// When the press is released, you reset everything back to its original state
let tooltipOpen = false;
let btnPressed = false;
let timerID;
let counter = 0;
let recorder;
let audio;
let clockOn;

let pressHoldEvent = new CustomEvent("pressHold");
let pressHoldDuration = 15;

// Listening for the mouse and touch events    
mic.addEventListener("mousedown", pressingDown, false);
mic.addEventListener("mouseup", notPressingDown, false);

mic.addEventListener("touchstart", pressingDown, { passive: true}, false);
mic.addEventListener("touchend", notPressingDown, false);


// THIS IS WHERE THE MAGIC HAPPENS ////////////////////////////////////////////////////
mic.addEventListener("pressHold", async () => {
    recorder = await recordAudio();
    recorder.start();
    // when recording: close tooltip, show recording element, start clock
    micToolTip.style.display = 'none';
    recording.style.display = 'flex';
    startClock();
    btnPressed = false;
}, false);
//////////////////////////////////////////////////////////////////////////////////////


function pressingDown(e) {
  if (!tooltipOpen) {
    btnPressed = true;
    // Start the timer
    requestAnimationFrame(timer);
    if (e.cancelable) e.preventDefault();
  };
};

async function notPressingDown(e) {
  if (e) e.preventDefault();
  // Stop the timer
  cancelAnimationFrame(timerID);
  if (recorder) {
    audio = await recorder.stop();
    recording.style.display = 'none';
    recorder = null;
    if (audio) {
        socket.emit('send_audio', {
          room: room_name,
          audio: audio.audioBlob
        })
        audio = null;
    };
  };
  if (btnPressed) {
    micToolTip.style.display = 'flex'
    tooltipOpen = true;
  };
  if (clockOn) stopClock(clockInterval);
  btnPressed = false;
  clockOn = false;
  counter = 0;
};

// Runs at 60fps when you are pressing down
function timer() {
  if (counter < pressHoldDuration) {
    timerID = requestAnimationFrame(timer);
    counter++;
  } else {
    console.log("Press threshold reached!");
    mic.dispatchEvent(pressHoldEvent);
  }
};

// recorder adapted from: https://medium.com/@bryanjenningz/how-to-record-and-play-audio-in-javascript-faa1b2b3e49b
const recordAudio = () =>
  new Promise(async resolve => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    const start = () => mediaRecorder.start();

    const stop = () =>
      new Promise(resolve => {
        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks);
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          const play = () => audio.play();
          resolve({ audioBlob, audioUrl, play });
        });

        mediaRecorder.stop();
      });

    resolve({ start, stop });
  });

let clockInterval;
const startClock = () => {
    clockOn = true;
    clockInterval = setInterval(() => {
        let text = '';
        const slicedString = clock.innerText.slice(2);
        console.log(slicedString);
        const number = parseInt(slicedString) + 1;
        if (number > 15) {
            // hide and reset recording, show timeout
            // stopClock(clockInterval);
            notPressingDown();
            showTimeout();
        } else if (number < 10) {
            text = String(number).padStart(2, '0');
        } else {
            text = number.toString();
        };
        clock.innerText = `0:${text}`;
    }, 1000);
};
const stopClock = (interval) => {
    recording.style.display = 'none';
    clearInterval(interval);
    clock.innerText = '0:00';
};
const showTimeout = () => {
  mic.setAttribute('disabled', 'disabled');
  timeout.style.display = 'flex';
  setTimeout(() => {
    timeout.style.display = 'none';
    mic.removeAttribute('disabled');
  },2000);
};