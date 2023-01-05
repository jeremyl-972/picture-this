// MAIN LOGIC WITH NON RE-USABLE COMPONENTS 
const heading = document.getElementById("heading");
const component = document.getElementById("component");

// create difficulty_buttons
const difficulty_buttons = () => {
    const onClick = async (e) => {
        clearComponent();
        setLoader();
        const diff_level = e.currentTarget.value;
        await fetch(`/rooms/get_words/${diff_level}`).then(response => {
            response.json().then(list => {
                //  on click, create and display word_buttons
                wordsContainer = word_buttons(list);
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
const word_buttons = (list) => {
    const onClick = async (e) => {
        clearComponent();
        setLoader();
        const word = e.currentTarget.value;
        await fetch(`/rooms/selected_word/${word}`).then(response => {
            response.json().then(data => {
                console.log(data);
                const node = document.createTextNode(data.word);
                const div = make__div("center-up-flex-column");
                div.appendChild(node);
                // on click, display canvas
                const canvas = make_canvas();
                clearComponent();
                component.append(div, canvas);
                new DrawableCanvasElement("canvas", "clearBtn");
            });
        });
    };
    const btnContainer = create_buttons_array(
        list, "width:100px", 'wordBtn', onClick
    );
    heading.innerText = 'Choose A Word'
    return btnContainer;
}

// display difficulty_buttons
component.appendChild(difficulty_buttons());