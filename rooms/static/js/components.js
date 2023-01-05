const clearComponent = () => { component.innerHTML = '' };

const setLoader = () => {
    component.appendChild(loader_component());
};

const make_button = (value, style, added_class, text, onClick) => {
    const btn = document.createElement('button');
    btn.className = "btn btn-primary m-1";
    if (value) { btn.setAttribute('value', value) };
    if (style) { btn.setAttribute('style', style) };
    if (added_class) { btn.classList.add(added_class) };
    if (onClick) { btn.onclick = onClick };
    textNode = document.createTextNode(text);
    btn.appendChild(textNode); 
    return btn;
};

const create_buttons_array = (list, style, added_class, onClick) => {
    const btnContainer = document.createElement('div');
    btnContainer.className = "image_container";

    for (let i=0; i < list.length; i++) {
        btn = make_button(list[i], style, added_class, list[i], onClick)
        btnContainer.appendChild(btn);
    }
    return btnContainer;
};

const make__div = (classname) => {
    const div = document.createElement("div");
    div.className = classname;
    return div;
};

function createLink(name) {
    const link = document.createElement("a");
    const text = document.createTextNode(name);
    if (bodyId === name) {
      link.setAttribute("aria-current", "page");
    }
    link.className = bodyId === name ? "nav-link active" : "nav-link";
    link.href = `../${name.toLowerCase()}/${name.toLowerCase()}.html`;
    link.appendChild(text);
    return link;
  };
  
  const listen_and_display = (btn, callback) => {
    btn.addEventListener('click', (e) => {
        component.innerHTML = '';
        component.appendChild(loader_component());
        const parameter = e.currentTarget.value;
        callback(parameter)
    });  
};