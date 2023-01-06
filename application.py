from datetime import datetime

from flask import Flask, render_template, request, session, url_for
from flask_socketio import SocketIO, send, join_room, leave_room
from flask_login import LoginManager, login_required, current_user
from dotenv import load_dotenv

from auth.auth import auth
from rooms.rooms import rooms
from mysql.db import get_user, save_sketch


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

@application.route("/words")
@login_required
def words():
    """Show words view"""
    # set expected data structure
    data = []
    return render_template("words.html", data=data)


# WEB SOCKET ACTIVITY STARTS HERE

@socketio.on('join_room')
def handle_join_room_event(data):
    join_room(data['room'])
    socketio.emit('join_room_announcement', data)

@socketio.on('leave_room')
def handle_leave_room_event(data):
    application.logger.info("{} has left the room {}".format(data['username'], data['room']))
    leave_room(data['room'])
    socketio.emit('leave_room_announcement', data, room=data['room'])

@socketio.on('emit_sketch')
def handle_emit_sketch_event(data):
    application.logger.info("{} has sent a sketch to room {}".format(data['username'], data['room']))
    data['created_at'] = datetime.now().strftime("%d %b, %H:%M")
    save_sketch(data['room'], data['url'], data['user_id'], data['created_at'])
    socketio.emit('receive_sketch', data, room=data['room'])


@login_manager.user_loader
def load_user(username):
    return get_user(username)

if __name__ == "__main__":
    socketio.run(application, debug=True)