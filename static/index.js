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

function loader_component(text) {
    const textSpan = document.createElement('span');
    textSpan.innerText = text === 'large' ? '' : text;
    textSpan.style.paddingRight = "12px";

    const carouselSpan = document.createElement('span');
    carouselSpan.className = text === 'large' ? 'spinner-border spinner-border-lg' : "dot-carousel";

    const loader_container = document.createElement('div');
    loader_container.className = "center-up-flex-row";

    loader_container.append(textSpan, carouselSpan);
    return loader_container;
};

const aNodes = document.getElementsByTagName('a');
const headerNodes = document.getElementsByTagName('header');
const mainNodes = document.getElementsByTagName('main');

for (let i = 0; i < aNodes.length; i++) {
    aNodes[i].addEventListener('click', () => {
        for (let j = 0; j < headerNodes.length; j++) {
            headerNodes[j].innerHTML = '';
        };
        mainNodes[0].innerHTML = '';
        mainNodes[0].style.cssText = 'height:70vh; display:flex; flex-direction:column; align-items:center; justify-content:center';
        mainNodes[0].appendChild(loader_component('large'));
    }); 
};