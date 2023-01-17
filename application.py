from threading import Lock

from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room
from flask_login import LoginManager, login_required
from dotenv import load_dotenv

from auth.auth import auth
from rooms.rooms import rooms, add_points
from mysql.db import get_user, connect_to_room, disconnect_from_room, get_connected_members


thread = None
thread_lock = Lock()

# Configure application
load_dotenv()
application = Flask(__name__)
application.register_blueprint(auth, url_prefix="/auth")
application.register_blueprint(rooms, url_prefix="/rooms")

application.secret_key = "sfdjkafnk"
socketio = SocketIO(application, cors_allowed_origins="*")
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.init_app(application)
login_manager.login_message = "User needs to be logged in"

# Ensure responses aren't cached
# @application.after_request
# def after_request(response):
#     response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
#     response.headers["Expires"] = 0
#     response.headers["Pragma"] = "no-cache"
#     return response

# def receive_canvas_url(data):
#     print("Sending canvas url")
#     while True:
#         socketio.emit('receive_sketch', data)
#         socketio.sleep(.1)

@application.route("/")
@login_required
def index():
    """Show intro view"""
    data = []
    return render_template("intro.html", data=data)

# WEB SOCKET ACTIVITY STARTS HERE

@socketio.on('join_room')
def handle_join_room_event(data):
    join_room(data['room'])
    count = connect_to_room(request.sid, data['room'], data['user_id'])
    data['count'] = count
    socketio.emit('join_room_announcement', data)

@socketio.on('disconnect')
def disconnect():
    data = disconnect_from_room(request.sid)
    socketio.emit('leave_room_announcement', {'username': data['username'], 'room_name': data['room_name']}, room=data['room_name'])
    print("DISCONNECTED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

word = {}
@socketio.on('chose_word')
def chose_word(data):
    members = get_connected_members(data['room'])
    data['count'] = len(members)
    word['word'] = data['word']
    word['points'] = data['points']
    socketio.emit('is_drawing_prompt', {'word': word, 'count': data['count'], 'username': data['username'], 'message': f"{data['username']} is drawing"}, room=data['room'])

@socketio.on('emit_sketch')
def emit_sketch(data):
    socketio.emit('getting_sketch', data, room=data['room'], include_self=False)

@socketio.on('clear_sketch')
def clear_sketch(data):
    socketio.emit('clearing_sketch', data, room=data['room'], include_self=False)

@socketio.on('sent_guess')
def sent_guess(data):
    responseData = {}
    responseData['username'] = data['username']
    responseData['message'] = "No!"
    responseData['points'] = word['points']

    if data['guess'] == word['word']:
        responseData['score'] = add_points(request.sid, word['points'])
        responseData['message'] = "Correct! It's your turn to draw"
        socketio.emit('switch_turns', responseData, room=data['room'], include_self=False)
    socketio.emit('guess_response', responseData, room=data['room'])


@login_manager.user_loader
def load_user(username):
    return get_user(username)

if __name__ == "__main__":
    socketio.run(application, debug=True)