const announcementElement = document.getElementById('announcements');
const heading = document.getElementById("heading");
const component = document.getElementById("component");

const clearElement = (id) => {
    const element = document.getElementById(id);
    element.innerHTML = '';
};

const clearAll = () => {
    announcementElement.innerHTML = '';
    heading.innerHTML = '';
    component.innerHTML = '';
};

const setHeading = (text) => {
    clearElement('heading');
    heading.innerHTML = text;
};

const announceWithLoader = (message) => {
    clearElement('announcements');
    announcementElement.append(loader_component(message));
};

const make__div = (classname) => {
    const div = document.createElement("div");
    div.className = classname;
    return div;
};

const make_button = (value, style, added_class, text, onClick, id) => {
    const btn = document.createElement('button');
    btn.className = "btn btn-primary m-1";
    if (value) { btn.setAttribute('value', value) };
    if (style) { btn.setAttribute('style', style) };
    if (added_class) { btn.classList.add(added_class) };
    if (onClick) { btn.onclick = onClick };
    if (id) { btn.setAttribute('id', id) };
    textNode = document.createTextNode(text);
    btn.appendChild(textNode); 
    return btn;
};

const loadingBtn = (text) => {
    const btnInner = document.createElement('span');
    btnInner.className = "spinner-border spinner-border-sm me-1";
    btnInner.setAttribute('role', 'status');
    btnInner.setAttribute('aria-hidden', 'true');

    const btnOuter = make_button('', 'margin-right: 0 !important; width: 120px', '', '', null, 'loadBtn');
    btnOuter.setAttribute('hidden', 'hidden');
    btnOuter.append(btnInner);
    btnInner.after(text);
    return btnOuter;
};

const create_buttons_array = (list, style, added_class, onClick) => {
    const btnContainer = document.createElement('div');
    btnContainer.className = "image_container";

    for (let i=0; i < list.length; i++) {
        btn = make_button(list[i], style, added_class, list[i], onClick, '')
        btnContainer.appendChild(btn);
    }
    return btnContainer;
};

// create difficulty_buttons
const difficulty_buttons = () => {
    clearAll();
    const onClick = async (e) => {
        clearAll();
        announceWithLoader("Loading");
        const diff_level = e.currentTarget.value;
        await fetch(`/rooms/get_words/${diff_level}`).then(response => {
            response.json().then(list => {
                //  on click, create and display word_buttons
                wordsContainer = word_buttons(list, diff_level);
                clearElement('announcements');
                component.appendChild(wordsContainer);
            });
        });
    };
    const diff_ranges = ['Easy', 'Med', 'Hard'];
    const btnContainer = create_buttons_array(
        diff_ranges, "width:100px", 'difficultyBtn', onClick
    );
    setHeading('Select Difficulty');
    return btnContainer;
};

// create word_buttons and on click, display canvas 
const word_buttons = (list, diff_level) => {
    const onClick = async (e) => {
        clearElement('heading');
        clearElement('component');
        announceWithLoader("Loading")
        const word = e.currentTarget.value;
        const wordDiv = make__div("center-up-flex-column");
        wordDiv.innerText = word;
        // on click, display canvas
        const canvasContainer = make_canvas();
        clearElement('component');
        setHeading('Start Drawing!');
        component.append(wordDiv, canvasContainer);
        new DrawableCanvasElement("canvas", "clearBtn", "sendBtn", onSendSketch);
        heading.setAttribute('hidden', 'hidden')
        component.setAttribute('hidden', 'hidden')
        choseWord(word, diff_level);
    };
    const btnContainer = create_buttons_array(
        list, "width:100px", 'wordBtn', onClick
    );
    setHeading('Choose A Word');
    return btnContainer;
}

const receive_sketch = (data) => {
    clearElement('announcements');
    const newNode = make__div();
    newNode.innerHTML = `Received sketch from <b>${data.username}</b>`;
    announcementElement.appendChild(newNode);
    heading.innerText = "Start guessing!"

    const img = new Image;
    img.src = data.url;
    img.setAttribute('width', '300px');
    img.setAttribute('height', '350px');
    img.style.backgroundColor = "aliceblue";

    const imgContainer = make__div("center-up-flex-column");
    imgContainer.appendChild(img);

    clearElement('component');
    component.appendChild(imgContainer);
};

const make_guess_form = () => {
    const onClick = () => {
        const guessInput = document.getElementById('guessInput');
        const guess = guessInput.value;
        onGuess(guess);
        toggle('guessBtn', 'loadBtn');
    };
    const guessInput = document.createElement('input');
    guessInput.setAttribute('id', 'guessInput');
    guessInput.className = 'form-control';
    guessInput.setAttribute('autocomplete', 'off');
    guessInput.setAttribute('autofocus', 'autofocus');
    const guessBtn = make_button('', 'margin-right: 0 !important; width: 120px', '', "Guess", onClick, 'guessBtn');
    const loadBtn = loadingBtn('Guess');

    const guessContainer = make__div("center-up-flex-row");
    guessContainer.style.maxWidth = '300px';
    guessContainer.append(guessInput, guessBtn, loadBtn);
    return guessContainer;
};

const setWaitingScreen = () => {
    clearAll();
    announceWithLoader('Waiting for your opponent to chose a word and draw');
};