const announcementElement = document.getElementById('announcements');
announcementElement.style.marginTop = '45px';
const component = document.getElementById("component");

const clearAnnouncements = () => {
    announcementElement.innerHTML = '';
    announcementElement.style.marginTop = 0;
    announcementElement.style.marginBottom = 0;
};

const clearComponent = () => {
    component.innerHTML = '';
};

const clearAll = () => {
    clearAnnouncements();
    clearComponent();
};

const announce = (message, clear) => {
    if (clear) {
        clearAnnouncements();
        announcementElement.style.marginTop = 0;
    } 
    const node = document.createTextNode(message);
    announcementElement.appendChild(node);
};

const announceWithLoader = (message, clear) => {
    if (clear) clearAnnouncements();
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
    btnInner.setAttribute('id', 'spinner');
    btnInner.setAttribute('role', 'status');
    btnInner.setAttribute('aria-hidden', 'true');

    const btnOuter = make_button('', 'flex-shrink: 0; margin-right: 0 !important; width: 90px', '', '', null, 'loadBtn');
    btnOuter.setAttribute('hidden', 'hidden');
    btnOuter.append(btnInner);
    btnInner.after(text);
    return btnOuter;
};

const create_buttons_array = (valueList, textList, style, added_class, onClick) => {
    const btnContainer = document.createElement('div');
    btnContainer.className = "array_container";

    for (let i=0; i < textList.length; i++) {
        if (valueList) {
            btn = make_button(valueList[i], style, added_class, textList[i], onClick, '');
        } else {
            btn = make_button(null, style, added_class, textList[i], onClick, '');
        }
        btnContainer.appendChild(btn);
    }
    return btnContainer;
};

// create difficulty_buttons
const difficulty_buttons = () => {
    announcementElement.style.marginTop = '45px';
    announcementElement.innerHTML = '';
    clearComponent();
    const onClick = async (e) => {
        announcementElement.innerHTML = '';
        announceWithLoader(t('loadingText.loadingText'), clear=false);
        clearComponent();
        const diff_level = e.currentTarget.value;
        //  on click, create and display word_buttons
        const wordsList = await get_words(diff_level, i18next.language);
        wordsContainer = word_buttons(wordsList, diff_level);
        component.appendChild(wordsContainer);
    };
    const diff_ranges_values = ['Easy', 'Med', 'Hard'];
    const diff_range_texts = [t('components.easy'), t('components.med'), t('components.hard')];
    const btnContainer = create_buttons_array(
        diff_ranges_values, diff_range_texts, "width:100px", 'difficultyBtn', onClick
    );
    announce(t('components.selectDifficulty'), clear=false);
    return btnContainer;
};

// create word_buttons and on click, initialize canvas 
const word_buttons = (list, diff_level) => {
    const onClick = async (e) => {
        clearComponent();
        announcementElement.innerHTML = '';
        announceWithLoader(t('components.getReady'), clear=false);
        const word = e.currentTarget.innerText;
        const wordDiv = make__div("center-up-flex column");
        wordDiv.setAttribute('id', 'wordDiv')
        wordDiv.innerText = word;
        // on click, create canvas but hide it
        const canvasContainer = make_canvas();
        component.append(wordDiv, canvasContainer);
        new DrawableCanvasElement("canvas", "clearBtn", onEmitSketch);
        component.setAttribute('hidden', 'hidden')
        choseWord(word, diff_level);
    };
    const btnContainer = create_buttons_array(
        null, list, "width:100px", 'wordBtn', onClick
    );
    announcementElement.innerHTML = '';
    announce(t('components.chooseWrd'), clear=false);
    return btnContainer;
}

const setImgSize = (image) => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const navHeight = document.getElementById('mainNavbar').clientHeight;

    const header = document.getElementById('header');
    const headerStyle = header.currentStyle || getComputedStyle(header);
    const headerHeight = header.clientHeight + parseInt(headerStyle.marginTop, 10) + parseInt(headerStyle.marginBottom, 10);

    let anncmntHeight = 44;
    let wordDivHeight = 24;
    let formHeight = 38;
    const clearBtnMargin = 8;

    if (screen.width >= 750) formHeight = 46;

    if (screen.width >= 750 && screen.width < 900) {
        anncmntHeight = 56;
        wordDivHeight = 36;
    };
    if (screen.width >= 900 && windowHeight >= 900) {
        anncmntHeight = 62;
        wordDivHeight = 45;
        formHeight = 60;
    };

    const footerHeight = document.getElementById('footer').clientHeight;

    let imageHeight =
        windowHeight - navHeight - headerHeight - anncmntHeight - wordDivHeight -
        formHeight - footerHeight - clearBtnMargin;
    setHeight(`${imageHeight}px`);
        
    if (windowWidth > windowHeight) {
        positionElement('announcements', `${headerHeight - 8}px`);
        positionElement('component', `${headerHeight - 8}px`);

        imageHeight = imageHeight + (headerHeight - 8) + anncmntHeight - 10;  
        setHeight(`${imageHeight}px`);
        setWidth(`${imageHeight}px`);
    } else {
        if (windowWidth > 970) setWidth('970px');
        else {setWidth(`${windowWidth - 20}px`)};
    }
    
    function setHeight(value) {
        image.setAttribute('height', value);
    };
    function setWidth(value) {
        image.setAttribute('width', value);
    };
    function positionElement(id, bottom) {
        const element = document.getElementById(id);
        element.style.position = 'relative';
        element.style.bottom = bottom;
    }
};

const make_blank_canvas = (url) => {
    const img = new Image;
    setImgSize(img);
    img.style.backgroundColor = "aliceblue";

    const imgContainer = make__div("center-up-flex column");
    imgContainer.setAttribute('id', 'image')
    imgContainer.appendChild(img);
    if (url) {
        img.src = url;
    }
    return imgContainer;
};

const getting_sketch = (data) => {
    const imgContainer = make_blank_canvas(data.url);
    clearComponent();
    component.appendChild(imgContainer);
};

const make_guess_form = () => {
    announcementElement.style.marginTop = '10px';
    announcementElement.style.marginBottom = '10px';
    const onClick = () => {
        const loadBtn = document.getElementById('loadBtn');
        const newNode = document.createTextNode(t('socketio.guessBtn'));
        loadBtn.replaceChild(newNode, loadBtn.childNodes[2]);

        const guessInput = document.getElementById('guessInput');
        const guess = guessInput.value;
        onGuess(guess);
        toggle('guessBtn', 'loadBtn');
    };
    const guessBtn = make_button('', 'flex-shrink: 0; margin-right: 0 !important; width: 90px', '', t('socketio.guessBtn'), onClick, 'guessBtn');
    guessBtn.setAttribute('disabled', 'disabled');
    const loadBtn = loadingBtn(t('socketio.guessBtn'));

    const guessInput = document.createElement('input');
    guessInput.className = 'form-control';
    guessInput.setAttribute('id', 'guessInput');
    guessInput.setAttribute('autocomplete', 'off');
    guessInput.setAttribute('autofocus', 'autofocus');
    guessInput.addEventListener('input', (e) => {
        if (e.currentTarget.value != '') {
            document.getElementById('guessBtn').removeAttribute('disabled');
        } else {
            document.getElementById('guessBtn').setAttribute('disabled', 'disabled');
        };
    });
    guessInput.style.zIndex = '1';
    onClickEnter(guessInput, guessBtn);

    const canvasWidth = document.getElementById('image').clientWidth;
    const guessForm = make__div("center-up-flex");
    guessForm.setAttribute('id', 'guessForm');

    guessForm.style.maxWidth = `${canvasWidth}px`;
    guessForm.append(guessBtn, loadBtn, guessInput);

    return guessForm;
};

const setWaitingScreen = (name) => {
    clearAll();
    if (i18next.language === 'iw') {
        announceWithLoader(`${t('components.toDraw')} ${name} ${t('components.waitFor')}`);
    } else {
        announceWithLoader(`${t('components.waitFor')} ${name} ${t('components.toDraw')}`);
    }
    announcementElement.style.marginBottom = '10px';
    announcementElement.style.marginTop = '10px';
    const imgContainer = make_blank_canvas('');
    component.append(imgContainer);
};

let myInterval;
const startTimer = () => {
    const countdownElement = make__div('');
    countdownElement.setAttribute('id', 'countdownElement');
    countdownElement.innerText = ":90";
    clearAnnouncements();
    announcementElement.append(countdownElement);
    
    myInterval = setInterval(() => {
        let text = '';
        const slicedString = countdownElement.innerText.slice(1);
        const number = parseInt(slicedString) - 1;
        if (number < 0) {
            announceWithLoader(t('components.timedOut'), clear=true)
            stopTimer(myInterval);
        } else if (number < 10) {
            text = String(number).padStart(2, '0');
        } else {
            text = number.toString();
        };
        countdownElement.innerText = `:${text}`;
    }, 1000);
};
const stopTimer = (interval) => {
    clearInterval(interval);
    timed_out();
};