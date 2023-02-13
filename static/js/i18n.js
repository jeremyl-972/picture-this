const langBtn = document.getElementById('langBtn');
const langList = document.getElementById('langList');
const langSpan = document.getElementById('langSpan');

langBtn.removeAttribute('hidden');
let language;
let clickedLangBtn = false;

document.addEventListener("DOMContentLoaded", async () => {
  setMainForLoading();

  language = await getStoredLanguage() || navigator.language || navigator.userLanguage;
  console.log('inital-lang:', language);
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

  // hid list when clicking outside langBtn
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
    // send lang to backend only if logged in user clicked langBtn
    let newClone;
    if (clickedLangBtn) {
      setMainForLoading();
      if (user) await setUserLanguage(i18next.language);
    };
    
    // fix the DOM
    content.style.removeProperty('height');
    content.removeChild(content.lastElementChild);
    mainNode.removeAttribute('hidden');

    // manipulate the DOM so form send will carry the language value
    if (document.getElementById('title').innerText === 'Picture This: Register') {
      const langInput = document.getElementById('langInput');
      langInput.setAttribute('value', i18next.language);
    }
    
    const keyNames = Object.keys(pageArrays);
    const values = Object.values(pageArrays);
    for (let i = 0; i < keyNames.length; i++) {
      alterPage(keyNames[i], values[i]);
    };
    clickedLangBtn = false;
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
