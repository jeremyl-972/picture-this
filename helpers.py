import os
from functools import wraps

from flask import redirect, render_template, session, g
import pymysql


def apology(message, code=400):
    """Render message as an apology to user."""
    def escape(s):
        """
        Escape special characters.

        https://github.com/jacebrowning/memegen#special-characters
        """
        for old, new in [("-", "--"), (" ", "-"), ("_", "__"), ("?", "~q"),
                         ("%", "~p"), ("#", "~h"), ("/", "~s"), ("\"", "''")]:
            s = s.replace(old, new)
        return s
    return render_template("apology.html", top=code, bottom=escape(message)), code


def login_required(f):
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("auth/login")
        return f(*args, **kwargs)
    return decorated_function


# Configure app to use pymysql
def get_db():
    if 'conn' not in g:
        connection = pymysql.connect(
        host=f'{os.getenv("DB_HOST")}', user=f'{os.getenv("DB_USER")}', passwd=f'{os.getenv("DB_PASSWORD")}', database=f'{os.getenv("DB")}', cursorclass=pymysql.cursors.DictCursor)
        g.conn = connection
        g.cur = connection.cursor()
    return {"conn":g.conn, "cur":g.cur}

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

