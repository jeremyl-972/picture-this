from flask import Flask, render_template, request, session, url_for
from flask_socketio import SocketIO, send, join_room, leave_room
from flask_login import LoginManager, login_required, current_user
from dotenv import load_dotenv

from auth.auth import auth
from rooms.rooms import rooms, sent_sketch, selected_word
from mysql.db import get_user, connect_to_room, disconnect_from_room


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
@application.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@application.route("/")
@login_required
def index():
    """Show intro view"""
    # define user
    # set expected data structure
    data = []
    return render_template("intro.html", data=data)

# WEB SOCKET ACTIVITY STARTS HERE

@socketio.on('join_room')
def handle_join_room_event(data):
    join_room(data['room'])
    connect_to_room(data['room'], data['user_id'])
    socketio.emit('join_room_announcement', data, include_self=False)

@socketio.on('leave_room')
def handle_leave_room_event(data):
    application.logger.info("{} has left the room {}".format(data['username'], data['room']))
    leave_room(data['room'])
    disconnect_from_room(data['room'], data['user_id'])
    socketio.emit('leave_room_announcement', data, room=data['room'])

@socketio.on('emit_word')
def emit_word(data):
    selected_word(data['word'], data['diff_level'])
    socketio.emit('prompt', {'message': f"{data['username']} is drawing"}, room=data['room'], include_self=False)

@socketio.on('emit_sketch')
def handle_emit_sketch_event(data):
    application.logger.info("{} has sent a sketch to room {}".format(data['username'], data['room']))
    socketio.emit('receive_sketch', data, room=data['room'])
    sent_sketch(data)

@login_manager.user_loader
def load_user(username):
    return get_user(username)

if __name__ == "__main__":
    socketio.run(application, debug=True)