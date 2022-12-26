import os

from flask import g
from werkzeug.security import generate_password_hash
from user import User
import pymysql


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

def get_user(username):
    db = get_db()
    cur = db["cur"]
    error = None
    user = None

    try:
         # Query database for username
        cur.execute("SELECT * FROM users WHERE username = %s", username)
        rows = cur.fetchall() 
    # Ensure username exists and password is correct    
    except len(rows) != 1:
        error = f"User {username} does not exist."
        return error
    else:
        user_data = rows[0]
        user = User(user_data['username'], user_data['hash'])
        return user

def save_user(username, password):
    db = get_db()
    cur = db["cur"]
    conn = db["conn"]
    user = None
    error = None
    
    try:
        # check for existing username
        user = cur.execute("SELECT * FROM users WHERE username = %s", username)  
    except user:
        error = f"User {username} is already registered."
        return {"error": True, "message": error}
    else:
        hash = generate_password_hash(
        password, method='pbkdf2:sha256', salt_length=8)
        cur.execute("INSERT INTO users (username, hash) VALUES(%s, %s)", (username, hash))
        conn.commit()
        return {"error": False, "message": "Successfully registered!"}
        