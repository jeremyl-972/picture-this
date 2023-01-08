const clearComponent = () => { component.innerHTML = '' };

const setLoader = () => {
    component.appendChild(loader_component());
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

const create_buttons_array = (list, style, added_class, onClick) => {
    const btnContainer = document.createElement('div');
    btnContainer.className = "image_container";

    for (let i=0; i < list.length; i++) {
        btn = make_button(list[i], style, added_class, list[i], onClick, '')
        btnContainer.appendChild(btn);
    }
    return btnContainer;
};

const make__div = (classname) => {
    const div = document.createElement("div");
    div.className = classname;
    return div;
};

// create difficulty_buttons
const difficulty_buttons = () => {
    const onClick = async (e) => {
        clearComponent();
        setLoader();
        const diff_level = e.currentTarget.value;
        await fetch(`/rooms/get_words/${diff_level}`).then(response => {
            response.json().then(list => {
                //  on click, create and display word_buttons
                wordsContainer = word_buttons(list, diff_level);
                clearComponent();
                component.appendChild(wordsContainer);
            });
        });
    };
    const diff_ranges = ['Easy', 'Med', 'Hard'];
    const btnContainer = create_buttons_array(
        diff_ranges, "width:100px", 'difficultyBtn', onClick
    );
    heading.innerText = 'Select Difficulty'
    return btnContainer;
};

// create word_buttons and on click, display canvas 
const word_buttons = (list, diff_level) => {
    const onClick = async (e) => {
        clearComponent();
        setLoader();

        const word = e.currentTarget.value;
        emitWord(word, diff_level)

        const node = document.createTextNode(word);
        const wordDiv = make__div("center-up-flex-column");
        wordDiv.appendChild(node);
        // on click, display canvas
        const canvasContainer = make_canvas();
        clearComponent();
        heading.innerText = 'Start Drawing!'
        component.append(wordDiv, canvasContainer);
        new DrawableCanvasElement("canvas", "clearBtn", "sendBtn", onSendSketch);
    };
    const btnContainer = create_buttons_array(
        list, "width:100px", 'wordBtn', onClick
    );
    heading.innerText = 'Choose A Word'
    return btnContainer;
}