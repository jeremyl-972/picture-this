from threading import Lock
import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room
from flask_login import LoginManager, login_required, current_user
from dotenv import load_dotenv

from auth.auth import auth
from rooms.rooms import rooms
from mysql.db import get_user, connect_to_room, disconnect_from_room, update_user_language, get_top_score, update_top_score
from static.translations import t, translate, getSysLang

thread = None
thread_lock = Lock()

# Configure application
load_dotenv()
application = Flask(__name__)
application.register_blueprint(auth, url_prefix="/auth")
application.register_blueprint(rooms, url_prefix="/rooms")

application.secret_key = os.getenv('SECRET_KEY')
# additional SocketIO Params: logger=True, engineio_logger=True
socketio = SocketIO(application, cors_allowed_origins="*")
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.init_app(application)
login_manager.login_message = t[getSysLang()]["login"]


@application.route("/set_language/<userLang>/")
def set_language(userLang):
    update_user_language(userLang, current_user.username)
    return "Language set to: " + userLang

@application.route("/health_check")
def health_check():
    return "Healthcheck ok"

@application.route("/")
@login_required
def index():
    """Show intro view"""
    return render_template("intro.html", username=current_user.username)

# WEB SOCKET ACTIVITY STARTS HERE

@socketio.on('send_audio')
def send_audio(data):
    socketio.emit('receive_audio', data, room=data['room'], include_self=False)
    

@socketio.on('disconnect')
def disconnect():
    data = disconnect_from_room(request.sid)
    socketio.emit('leave_room_announcement', {'username': data['username'], 'room_name': data['room_name']}, room=data['room_name'])

@socketio.on('join_room')
def handle_join_room_event(data):
    join_room(data['room'])
    count = connect_to_room(request.sid, data['room'], data['user_id'])
    data['count'] = count
    data['topScore'] = get_top_score(data['room'])
    socketio.emit('join_room_announcement', data, room=data['room'])


@socketio.on('introduce_drawing_player')
def introduce_drawing_player(data):
    socketio.emit('hello_from_player1', data, room=data['room'], include_self=False)


@socketio.on('chose_word')
def chose_word(data):
    word_dict = data['word_object']
    # if client languages differ, translate word to guesser's language
    if not data['artist_lang'] == data['guesser_lang']:
        word = data['word_object']['word']
        translation = translate(word, data['artist_lang'], data['guesser_lang'])
        word_dict['word'] = translation
     
    socketio.emit('send_word', word_dict, room=data['room'], include_self=False)


@socketio.on('emit_sketch')
def emit_sketch(data):
    socketio.emit('getting_sketch', data, room=data['room'], include_self=False)

keepUpdating = {'update': False}
@socketio.on('sent_guess')
def sent_guess(data):
    lang = data['lang']
    score_dict = data['score_object']
    word_dict = data['word_object']
    responseData = {}
    responseData['guess'] = data['guess']
    responseData['username'] = data['username']
    responseData['message'] = t[lang]['incorrect'] 
    responseData['correct'] = False
    score_dict['topped'] = False

    if data['guess'].replace(' ','').lower() == word_dict['word'].replace(' ','').lower():
        responseData['correct'] = True
        # add word_value to score
        score_dict['score'] += word_dict['word_value']
        # if score beats topScore
        if score_dict['score'] > score_dict['topScore']:
            # if 1st cycle, mark topped as true
            if keepUpdating['update'] == False:
                score_dict['topped'] = True
                keepUpdating['update'] = True
            # update topScore
            score_dict['topScore'] = score_dict['score']
            # set high score in db
            update_top_score(score_dict['score'], data['room'])

        # return updated score object
        responseData['score_dict'] = score_dict
    socketio.emit('guess_response', responseData, room=data['room'])


@socketio.on('activate_timer')
def activate_timer(data):
    socketio.emit('start_timer', room=data['room'])


@login_manager.user_loader
def load_user(username):
    return get_user(username, lang=None)

if __name__ == "__main__":
    # additional socketio.run param: debug=True
    socketio.run(application, host='0.0.0.0')