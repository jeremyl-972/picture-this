function toggle(btnId, loadBtnId) {
    let btn = document.getElementById(btnId);
    let loadingBtn = document.getElementById(loadBtnId);
    if (btn.getAttribute('hidden') != null) {
        loadingBtn.setAttribute("hidden", "hidden");
        btn.removeAttribute("hidden");
    } 
    else {
        btn.setAttribute("hidden", "hidden");
        loadingBtn.removeAttribute("hidden");
    };
}

const loader_component = () => {
    const loader_container = document.createElement('div');

    const loader = document.createElement('div');
    loader.className = "center-up-flex-row";

    const text = document.createTextNode('Loading...');

    const spinner = document.createElement('span');
    spinner.className = "spinner-border mx-1";
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-hidden', 'true');

    loader.append(text, spinner);

    loader_container.appendChild(loader);
    return loader_container;
};
