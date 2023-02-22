from unidecode import unidecode
from easygoogletranslate import EasyGoogleTranslate
import re
import locale

t = {
    "en-US": {
        "login": "User needs to be logged in",
        "notExistErr": "does not exist.",
        "existsErr": "is already registered.",
        "registered": "Successfully registered!",
        "nameReqErr": "Username is required.",
        "pswrdReqErr": "Password is required.",
        "pswrdInvldErr": "Password invalid.",
        "pswrdCnfrmErr": "Password confirmation is required.",
        "pswrdMisMatchErr": "Password confirmation does not match.",
        "incorrect": "No!",
        "createRmFail": "Failed to create room",
        "firstRm": "No rooms exist. Create the first room",
        "noRooms": "No rooms are available. Create a room",
        "getRmErr": "Couldn't find room. Go back and try again",
        "firstRm": "There are no rooms yet. Create the first!"
    },
    "es-es": {
        "notExistErr": "no existe.",
        "existsErr": "ya esta registrado.",
        "registered": "¡Registrado exitosamente!",
        "nameReqErr": "Se requiere nombre de usuario.",
        "pswrdReqErr": "Se requiere contraseña.",
        "pswrdInvldErr": "Contraseña incorrecta.",
        "pswrdCnfrmErr": "Se requiere confirmación de contraseña.",
        "pswrdMisMatchErr": "La confirmación de la contraseña no coincide.",
        "incorrect": "¡No!",
        "createRmFail": "No se pudo crear la sala",
        "firstRm": "No hay habitaciones todavía",
        "noRooms": "No hay habitaciones disponibles",
        "getRmErr": "No pude encontrar habitación",
        "firstRm": "No hay habitaciones todavía. ¡Crea el primero!"
    },
    "pt": {
        "notExistErr": "não existe.",
        "existsErr": "já está registrado.",
        "registered": "Registrado com sucesso!",
        "nameReqErr": "Nome de usuário é requerido.",
        "pswrdReqErr": "Senha requerida.",
        "pswrdInvldErr": "Senha inválida.",
        "pswrdCnfrmErr": "A confirmação da senha é necessária.",
        "pswrdMisMatchErr": "A confirmação da senha não corresponde.",
        "incorrect": "Não!",
        "createRmFail": "Falha ao criar sala",
        "firstRm": "Ainda não há quartos",
        "noRooms": "Não há quartos disponíveis",
        "getRmErr": "Não foi possível encontrar quarto",
        "firstRm": "Ainda não há quartos. Crie o primeiro!"
    },
    "fr-FR": {
        "notExistErr": "n'existe pas.",
        "existsErr": "est déjà enregistré.",
        "registered": "Enregistré avec succès!",
        "nameReqErr": "Nom d'utilisateur est nécessaire.",
        "pswrdReqErr": "Mot de passe requis.",
        "pswrdInvldErr": "Mot de passe invalide.",
        "pswrdCnfrmErr": "La confirmation du mot de passe est requise.",
        "pswrdMisMatchErr": "La confirmation du mot de passe ne correspond pas.",
        "incorrect": "Non!",
        "createRmFail": "Échec de la création du salon",
        "firstRm": "Il n'y a pas encore de chambres",
        "noRooms": "Aucune chambre n'est disponible",
        "getRmErr": "Impossible de trouver de la place",
        "firstRm": "Il n'y a pas encore de chambres. Créez le premier!"
    },
    "iw": {
        "notExistErr": "לא קיים",
        "existsErr": "כבר רשום",
        "registered": "!נרשם בהצלחת",
        "nameReqErr": ".נדרש שם משתמש",
        "pswrdReqErr": ".דרושה סיסמא",
        "pswrdInvldErr": ".הסיסימא אינה תקפה",
        "pswrdCnfrmErr": ".נדרש אישור סיסמה",
        "pswrdMisMatchErr": ".אישור הסיסמה אינו תואם",
        "incorrect": "!לא",
        "createRmFail": "יצירת החדר נכשלה",
        "firstRm": "עדיין אין חדרים",
        "noRooms": "אין חדרים זמינים",
        "getRmErr": "לא הצלחתי למצוא מקום",
        "firstRm":  "!צור את הראשון .עדיין אין חדרים"
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

def getSysLang():
    langTuple = locale.getdefaultlocale()
    firstTwo = langTuple[0][0:2]

    availableLanguages = ['es-es', 'pt', 'fr-FR', 'en-US']
    for lang in availableLanguages:
        if firstTwo == lang[0:2]:
            return lang
        elif langTuple[0] == 'he':
            return 'iw'
        else:
            return 'en-US'