const langBtn = document.getElementById('langBtn');
const langList = document.getElementById('langList');
const langSpan = document.getElementById('langSpan');
let language;
let clickedLangBtn = false;
const supportedLanguages = ["iw", "he", "fr", "fr-FR", "pt", "es-es", "en"];

document.addEventListener("DOMContentLoaded", async () => {
  setMainForLoading();
  const storedLang = await getStoredLanguage();
  if (storedLang) {
    language = storedLang;
  } else if (supportedLanguages.includes(navigator.language) || supportedLanguages.includes(navigator.userLanguage)) {
    language = navigator.language;
  } else {language = "en-US"};

  console.log('inital-lang:', language);
  console.log('navigator.language:', navigator.language);
  console.log('navigator.userLanguage:', navigator.userLanguage);  
  i18next.init({
    lng: `${language}`,
    debug: true,
    resources: {
      en: {
        translation: engTrans
      },
      iw: {
        translation: hebTrans
      },
      es: {
        translation: spanTrans
      },
      fr: {
        translation: frnchTrans
      },
      pt: {
        translation: portugseTrans
      }
    }
  }, function(err, t) {
    // init set content
    updateContent();
  });

  // hide list when clicking outside langBtn
  document.addEventListener('click', (e) => {
    if (!langBtn.contains(e.target)) {
      langList.setAttribute('hidden', 'hidden');
      langBtn.classList.remove('active')
    };
  });


  langBtn.addEventListener('click', () => {
    langBtn.classList.toggle('active');
    langList.toggleAttribute('hidden');
  });

  const collection = langList.children 
  for (let i = 0; i < collection.length; i++) {
    collection[i].addEventListener('click', () => {
      langSpan.innerText = t('loadingText.switchSpan');
      clickedLangBtn = true;
      if (document.getElementById('title').innerText == 'Picture This: Join Room') {
        joinRoomWelcome();
      }
      if (document.getElementById('title').innerText == 'Picture This: Login') {
        registerPrompt();
      }
      changeLng(collection[i].getAttributeNode("value").nodeValue);
    });
  };


  async function changeLng(lng) {
    i18next.changeLanguage(lng);
  };


  i18next.on('languageChanged', () => {
    storeLanguage(i18next.language)
    updateContent();
  });
  

  async function updateContent() {
    storeLanguage(i18next.language)
    // send lang to backend only if logged in user clicked langBtn
    if (clickedLangBtn) {
      setMainForLoading();
      if (user) await setUserLanguage(i18next.language);
    };
        
    const titleElement = document.getElementById('title');
    const title = titleElement.innerText;
    const langInput = document.getElementById('langInput');

    // manipulate the DOM so a form send will carry the language value
    if (
        title === 'Picture This: Register' ||
        title === 'Picture This: Login' ||
        title === 'Picture This: Create Room'
      ) {
      langInput.setAttribute('value', i18next.language);
    };
    // align registerPrompt elements
    if (document.getElementById('title').innerText == 'Picture This: Login') {
      registerPrompt();
    };
    
    // Run through translations and update content
    const keyNames = Object.keys(pageArrays);
    const values = Object.values(pageArrays);
    for (let i = 0; i < keyNames.length; i++) {
      alterPage(keyNames[i], values[i]);
    };
    clickedLangBtn = false;
    // fix the DOM
    content.style.removeProperty('height');
    content.removeChild(content.lastElementChild);
    mainNode.removeAttribute('hidden');
    langBtn.removeAttribute('hidden');
  };
  
  
  function modifyElement(page, element) {
    const renderedElement = document.getElementById(element);
    if (renderedElement) renderedElement.innerHTML = i18next.t(`${page}.${element}`);
  }
  
  function alterPage(page, array) {
    array.forEach((element) => {
      modifyElement(page, element);
    })
  }
  
  function joinRoomWelcome () {
    const welcomeElement = document.getElementById('joinRmWelcome');
    const welcomeSpan = document.getElementById('welcomeSpan').cloneNode(true);
    const welcomeReceiver = document.getElementById('welcomeReceiver').cloneNode(true);
    const selectRoomSpan = document.getElementById('selectRoomSpan').cloneNode(true);
    const createOneSpan = document.getElementById('createRoomATag').cloneNode(true);
    welcomeElement.innerHTML = ''
    if (i18next.language === 'en-US') {       
        welcomeElement.append(selectRoomSpan, createOneSpan, welcomeReceiver, welcomeSpan)
    } else {
        welcomeElement.append(welcomeSpan, welcomeReceiver, selectRoomSpan, createOneSpan)
    };
  };
});

function registerPrompt() {
  const signupPrompt = document.getElementById('signupPrompt');
  const firstTimeSpan = document.getElementById('firstTime').cloneNode(true);
  const signupAtag = document.getElementById('signupAtag').cloneNode(true);
  signupPrompt.innerHTML = '';
  if (i18next.language === 'iw') {
      signupPrompt.append(signupAtag, firstTimeSpan);
  } else {
      signupPrompt.append(firstTimeSpan, signupAtag);
  };
};