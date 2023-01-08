// MAIN LOGIC WITH NON RE-USABLE COMPONENTS 
const heading = document.getElementById("heading");
const component = document.getElementById("component");


if (connected_members.length < 2) {
    console.log(connected_members);
    const div = make__div('center-up-flex-column');
    div.innerText = "Please wait for second player"
    component.appendChild(div);
}
else {
    console.log(connected_members.length);

    // display difficulty_buttons
    component.appendChild(difficulty_buttons());
};


