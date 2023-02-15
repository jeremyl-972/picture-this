const t = i18next.t;
let user = null;

const navbarToggler = document.querySelector('.navbar-toggler');
let fontSize = '25px';
let mb = '0px';
navbarToggler.addEventListener('click', () => {
    fontSize = fontSize === '25px' ? 'larger' : '25px';
    mb = fontSize === '25px' ? '0' : '10px';
    const navbarBrand = document.querySelector('.navbar-brand');
    navbarBrand.style.fontSize = fontSize;
    navbarBrand.style.marginBottom = mb;
});

const navLinkAtags = document.querySelectorAll('.nav-item > a');
navLinkAtags.forEach(element => {
    element.addEventListener('click', () => {
        navbarToggler.click();
    });
});

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
    loader_container.className = "center-up-flex";

    loader_container.append(textSpan, carouselSpan);
    return loader_container;
};

const aNodes = document.getElementsByTagName('a');
const headerNodes = document.getElementsByTagName('header');
const mainNodes = document.getElementsByTagName('main');
const mainNode = mainNodes[0];

for (let i = 0; i < aNodes.length; i++) {
    aNodes[i].addEventListener('click', () => {
        for (let j = 0; j < headerNodes.length; j++) {
            headerNodes[j].innerHTML = '';
        };
        mainNode.innerHTML = '';
        mainNode.style.cssText = 'height:70vh; display:flex; flex-direction:column; align-items:center; justify-content:center';
        mainNode.appendChild(loader_component('large'));
    }); 
};

function onClickEnter(input, button) {
    input.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
          event.preventDefault();
          button.click();
        }
    });
};

const content = document.getElementById('content');
function setMainForLoading() {
    mainNode.setAttribute('hidden', 'hidden');

    content.style.height = '70vh';
    content.appendChild(loader_component('large'));
};

async function storeLanguage(language) {
    try {
        // set and then check language in localforage 
        await localforage.setItem('language', language);
        language = await localforage.getItem('language');
        if (!language) {
          throw new Error('Language not stored');
        };
    } catch (error) {
        console.log(error);
    };
};

async function getStoredLanguage() {
    return await localforage.getItem('language');
};

async function setUserLanguage(language) {
    try {
        // send language to backend
        res = await axios.get(`/set_language/${language}`);
        if (res.status != 200) {
          throw new Error(res.statusText);
        };
        console.log(res.data);
    } catch (error) {
      console.log(error);
    };
};