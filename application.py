from datetime import datetime

from flask import Flask, render_template, request, session, url_for
from flask_socketio import SocketIO, send, join_room, leave_room
from flask_login import LoginManager, login_required, current_user
from dotenv import load_dotenv

from auth.auth import auth
from rooms.rooms import rooms
from mysql.db import get_user


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
    """Show welcome view"""
    # define user
    # set expected data structure
    data = []
    return render_template("index.html", data=data)

@application.route("/players")
@login_required
def players():
    """Show players view"""
    # define room
    room = "gameroom"
    # set expected data structure
    data = {}
    data["user"] = current_user.username
    data["room"] = room
    return render_template("players.html", data=data)

@application.route("/words")
@login_required
def words():
    """Show words view"""
    # define userId
    id = session["user_id"]
    # set expected data structure
    data = []
    return render_template("words.html", data=data)

@socketio.on('join_room')
def handle_join_room_event(data):
    join_room(data['room'])
    socketio.emit('join_room_announcement', data)

@socketio.on('send_sketch')
def handle_send_message_event(data):
    application.logger.info("{} has sent message to room {}: {}".format(data['username'], data['room'], data['sketch']))
    data['created_at'] = datetime.now().strftime("%d %b, %H:%M")
    socketio.emit('receive_sketch', data, room=data['room'])


@socketio.on('leave_room')
def handle_leave_room_event(data):
    application.logger.info("{} has left the room {}".format(data['username'], data['room']))
    leave_room(data['room'])
    socketio.emit('leave_room_announcement', data, room=data['room'])

@login_manager.user_loader
def load_user(username):
    return get_user(username)

if __name__ == "__main__":
    socketio.run(application, debug=True)