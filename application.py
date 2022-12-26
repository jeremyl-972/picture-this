from datetime import timedelta, datetime

from flask import Flask, flash, redirect, render_template, request, session, url_for
from flask_session import Session
from flask_socketio import SocketIO, send, join_room
from flask_login import LoginManager, login_required, current_user
from dotenv import load_dotenv

from auth.auth import auth
from helpers import apology
from db import get_user


# Configure application
load_dotenv()
application = Flask(__name__)
application.register_blueprint(auth, url_prefix="/auth")

application.secret_key = "sfdjkafnk"
socketio = SocketIO(application, cors_allowed_origins="*")
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.init_app(application)

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

@socketio.on('send_message')
def handle_send_message_event(data):
    application.logger.info("{} has sent message to room {}: {}".format(data['username'], data['room'], data['message']))
    socketio.emit('receive_message', data, room=data['room'])

@login_manager.user_loader
def load_user(username):
    return get_user(username)

if __name__ == "__main__":
    socketio.run(application, debug=True)