from unidecode import unidecode
from easygoogletranslate import EasyGoogleTranslate
import re

t = {
    "en-US": {
        "existsErr": "",
        "registered": "Successfully registered!",
        "incorrect": "No!",
        "createRmFail": "Failed to create room",
        "firstRm": "No rooms exist. Create the first room",
        "noRooms": "No rooms are available. Create a room",
        "getRmErr": "Couldn't find room. Go back and try again",
        "firstRm": "There are no rooms yet. Create the first!"
    },
    "es-es": {
        "incorrect": "¡No!",
        "createRmFail": "No se pudo crear la sala",
        "firstRm": "No hay habitaciones todavía",
        "noRooms": "No hay habitaciones disponibles",
        "getRmErr": "No pude encontrar habitación",
        "firstRm": "No hay habitaciones todavía. ¡Crea el primero!"
    },
    "pt": {
        "incorrect": "Não!",
        "createRmFail": "Falha ao criar sala",
        "firstRm": "Ainda não há quartos",
        "noRooms": "Não há quartos disponíveis",
        "getRmErr": "Não foi possível encontrar quarto",
        "firstRm": "Ainda não há quartos. Crie o primeiro!"
    },
    "fr-FR": {
        "incorrect": "Non!",
        "createRmFail": "Échec de la création du salon",
        "firstRm": "Il n'y a pas encore de chambres",
        "noRooms": "Aucune chambre n'est disponible",
        "getRmErr": "Impossible de trouver de la place",
        "firstRm": "Il n'y a pas encore de chambres. Créez le premier!"
    },
    "iw": {
        "incorrect": "לא!",
        "createRmFail": "יצירת החדר נכשלה",
        "firstRm": "עדיין אין חדרים",
        "noRooms": "אין חדרים זמינים",
        "getRmErr": "לא הצלחתי למצוא מקום",
        "firstRm":  "!" + "צור את הראשון" + "." + "עדיין אין חדרים"
    }
}

def translate(word, src_lang, trgt_lang):
    #format language symbols
    if trgt_lang == 'es-es':
        trgt_lang = 'es'
    if trgt_lang == 'fr-FR':
        trgt_lang = 'fr'
    if src_lang == 'es-es':
        src_lang = 'es'
    if src_lang == 'fr-FR':
        src_lang = 'fr'

    # initiate translator
    translator = EasyGoogleTranslate(
        source_language=src_lang,
        target_language=trgt_lang,
        timeout=10
    )

    # special case for Hebrew
    if trgt_lang == 'iw':
        translation = translator.translate(word)
        flattened = remove_vowels(translation)
        return flattened

    return unidecode(translator.translate(word))

vowel_pattern = re.compile(r"[\u0591-\u05C7]")
def remove_vowels(text):
    return re.sub(vowel_pattern, "", text)
