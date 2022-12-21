from datetime import timedelta, datetime

from flask import Flask, flash, redirect, render_template, request, session, url_for
from flask_session import Session
from dotenv import load_dotenv

from auth.auth import auth
from helpers import apology, login_required


# Configure application
load_dotenv()
application = Flask(__name__)
application.register_blueprint(auth, url_prefix="/auth")

# Ensure templates are auto-reloaded
application.config["TEMPLATES_AUTO_RELOAD"] = True
# setup server-side sessions
application.config['SESSION_PERMANENT'] = True
application.config['SESSION_TYPE'] = 'filesystem'
application.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=5)
# The max # of items the session stores before it starts deleting some, default 500
application.config['SESSION_FILE_THRESHOLD'] = 100
Session(application)

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
    # define userId
    id = session["user_id"]
    # set expected data structure
    data = []
    return render_template("index.html", data=data)