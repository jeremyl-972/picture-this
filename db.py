import os
from datetime import datetime

from flask import g
from werkzeug.security import generate_password_hash
from werkzeug.local import LocalProxy
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

db = LocalProxy(get_db)

def get_user(username):
    error = None
    user = None

    try:
         # Query database for username
        db['cur'].execute("SELECT * FROM users WHERE username = %s", username)
        rows = db['cur'].fetchall() 
    # Ensure username exists and password is correct    
    except len(rows) != 1:
        error = f"User {username} does not exist."
        return error
    else:
        user_data = rows[0]
        user = User(user_data['username'], user_data['hash'])
        return user

def save_user(username, password):
    user = None
    error = None
    
    try:
        # check for existing username
        user = db['cur'].execute("SELECT * FROM users WHERE username = %s", username)  
    except user:
        error = f"User {username} is already registered."
        return {"error": True, "message": error}
    else:
        hash = generate_password_hash(
        password, method='pbkdf2:sha256', salt_length=8)
        db['cur'].execute("INSERT INTO users (username, hash) VALUES(%s, %s)", (username, hash))
        db["conn"].commit()
        return {"error": False, "message": "Successfully registered!"}

def save_room(room_name, created_by):
    db["cur"].execute("INSERT INTO rooms (name, created_by, created_at) VALUES(%s, %s)", (room_name, created_by, datetime.now()))
    room_id = db["cur"].execute("SELECT id FROM rooms WHERE created_by = %s", created_by)
    add_room_member(room_id, room_name, created_by, created_by, is_room_admin=True)
    db["conn"].commit()
    return room_id


def update_room(room_id, room_name):
    db["cur"].execute("UPDATE rooms SET name = %s WHERE id = %s", (room_name, room_id))
    db["conn"].commit()


def get_room(room_id):
    return db["cur"].execute("SELECT * FROM rooms WHERE id = %s", room_id)


def add_room_member(room_id, room_name, username, added_by, is_room_admin=False):
    db["cur"].execute("INSERT INTO room_members (room_id, room_name, username, added_by, added_at, is_room_admin) VALUES(%s, %s, %s, %s, %s, %s)", (room_id, room_name, username, added_by, datetime.now(), is_room_admin))
    db["conn"].commit()


def add_room_members(room_id, room_name, usernames, added_by, is_room_admin=False):
    for username in usernames:
        db["cur"].execute("INSERT INTO room_members (room_id, room_name, username, added_by, added_at, is_room_admin) VALUES(%s, %s, %s, %s, %s, %s)", (room_id, room_name, username, added_by, datetime.now(), is_room_admin))
    db["conn"].commit()


def remove_room_members(room_id, usernames):
    for username in usernames:
        db["cur"].execute("DELETE FROM room_members JOIN rooms ON room_members.room_id = rooms.id WHERE room_id = %s AND username = %s", (room_id, username))
    db["conn"].commit()


def get_room_members(room_id):
    return list(db["cur"].execute("SELECT * FROM room_members WHERE room_id = %s"), room_id)


def get_rooms_for_user(username):
    return list(db["cur"].execute("SELECT name FROM rooms JOIN room_members ON rooms.id = room_members.room_id WHERE username = %s"), username)


def is_room_member(room_id, username):
    return list(db["cur"].execute("SELECT id FROM room_members JOIN rooms ON room_members.room_id = rooms.id WHERE room_id = %s AND username = %s"), (room_id, username))


def is_room_admin(room_id, username):
    return list(db["cur"].execute("SELECT id FROM room_members JOIN rooms ON room_members.room_id = rooms.id WHERE room_id = %s AND username = %s AND is_room_admin = %s"), (room_id, username, True))


def save_sketch(room_id, sketch, artist_id):
    db['cur'].execute("INSERT INTO sketches (room_id, sketch, artist_id, created_at) VALUES(%s, %s, %s, %s)", (room_id, sketch, artist_id, datetime.now()))