import os
from datetime import datetime

from flask import g
from werkzeug.security import generate_password_hash
from werkzeug.local import LocalProxy
from mysql.user import User
import pymysql


# Configure app to use pymysql
def get_db():
    if 'conn' not in g:
        connection = pymysql.connect(
        host=f'{os.getenv("DB_HOST")}', user=f'{os.getenv("DB_USER")}', passwd=f'{os.getenv("DB_PASSWORD")}', database=f'{os.getenv("DB")}', cursorclass=pymysql.cursors.DictCursor)
        g.conn = connection
        g.cur = connection.cursor()
    return {"conn":g.conn, "cur":g.cur}

def close_db():
    g.cur.close()
    g.conn.close()
    g.pop('cur')
    g.pop('conn')
    
db = LocalProxy(get_db)

def get_user(username):
    error = None
    user = None

    try:
         # Query database for username
        db['cur'].execute("SELECT * FROM users WHERE username = %s", username)
        rows = db['cur'].fetchall()
        close_db() 
    # Ensure username exists and password is correct    
    except len(rows) != 1:
        error = f"User {username} does not exist."
        return error
    else:
        user_data = rows[0]
        user = User(user_data['username'], user_data['hash'], user_data['id'])
        return user

def get_user_id(username):
    print(username)
    db["cur"].execute("SELECT id FROM users WHERE username = %s", username)
    row = db["cur"].fetchone()
    user_id = row['id']
    return user_id

def get_username_by_id(id):
    db["cur"].execute("SELECT username FROM users WHERE id = %s", id)
    row = db["cur"].fetchone()
    user_id = row['username']
    return user_id
    

def save_user(username, password):
    user = None
    error = None
    
    try:
        # check for existing username
        user = db['cur'].execute("SELECT * FROM users WHERE username = %s", username)  
    except user:
        close_db()
        error = f"User {username} is already registered."
        return {"error": True, "message": error}
    else:
        hash = generate_password_hash(
        password, method='pbkdf2:sha256', salt_length=8)
        db['cur'].execute("INSERT INTO users (username, hash) VALUES(%s, %s)", (username, hash))
        db["conn"].commit()
        close_db()
        return {"error": False, "message": "Successfully registered!"}

def save_room(room_name, created_by):
    db["cur"].execute("INSERT INTO rooms (name, created_by, created_at) VALUES(%s, %s, %s)", (room_name, created_by, datetime.now()))
    add_room_member(room_name, created_by, created_by, True)
    db["conn"].commit()
    close_db()


def update_room(room_id, room_name):
    db["cur"].execute("UPDATE rooms SET name = %s WHERE id = %s", (room_name, room_id))
    db["conn"].commit()
    close_db()


def get_all_rooms():
    db["cur"].execute("SELECT * FROM rooms")
    rooms = db["cur"].fetchall()
    close_db()
    return rooms

def get_room(name):
    db["cur"].execute("SELECT * FROM rooms WHERE name = %s", name)
    room = db["cur"].fetchone()
    close_db()
    return room

def add_room_member(room_name, user_id, added_by, is_room_admin):
    db["cur"].execute("INSERT INTO room_members (room_name, user_id, added_at, added_by, is_room_admin, connected) VALUES(%s, %s, %s, %s, %s, %s)", (room_name, user_id, datetime.now(), added_by, is_room_admin, True))
    db["conn"].commit()
    close_db()

def connect_to_room(room_name, user_id):
    db["cur"].execute("UPDATE room_members SET connected = %s WHERE room_name = %s AND user_id = %s", (True, room_name, user_id))
    db["conn"].commit()
    close_db()

def disconnect_from_room(room_name, user_id):
    db["cur"].execute("UPDATE room_members SET connected = %s WHERE room_name = %s AND user_id = %s", (False, room_name, user_id))
    db["conn"].commit()
    close_db()


def add_room_members(room_name, usernames, added_by):
    for username in usernames:
        user_id = get_user_id(username)
        db["cur"].execute("INSERT INTO room_members (room_name, added_by, added_at, is_room_admin, user_id) VALUES(%s, %s, %s, %s, %s)", (room_name, added_by, datetime.now(), False, user_id))
    db["conn"].commit()
    close_db()


def remove_room_members(room_id, usernames):
    for username in usernames:
        user_id = get_user_id(username)
        db["cur"].execute("DELETE FROM room_members JOIN rooms ON room_members.room_id = rooms.id WHERE room_id = %s AND user_id = %s", (room_id, user_id))
    db["conn"].commit()
    close_db()


def get_room_members(room_id):
    db["cur"].execute("SELECT * FROM room_members WHERE room_id = %s", room_id)
    membersList = list(db["cur"].fetchall())
    close_db()
    return membersList

def get_connected_members(room_name):
    db["cur"].execute("SELECT username FROM room_members JOIN users ON room_members.user_id = users.id WHERE room_name = %s AND connected = %s", (room_name, True))
    membersList = db["cur"].fetchall()
    connected_members = [member['username'] for member in membersList]
    close_db()
    return connected_members

def get_rooms_for_user(user_id):
    db["cur"].execute("SELECT name FROM rooms JOIN room_members ON rooms.id = room_members.room_id WHERE user_id = %s", user_id)
    membersList = list(db["cur"].fetchall())
    close_db()
    return membersList


def is_room_member(room_name, user_id):
    db["cur"].execute("SELECT user_id FROM room_members WHERE room_name = %s AND user_id = %s ", (room_name, user_id))
    memberId = db["cur"].fetchone()
    close_db()
    return memberId


def is_room_admin(room_id, user_id):
    db["cur"].execute("SELECT * FROM room_members JOIN rooms ON room_members.room_id = rooms.id WHERE room_id = %s AND user_id = %s AND is_room_admin = %s", (room_id, user_id, True))
    admin_id = db["cur"].fetchone()
    close_db()
    return admin_id


def save_sketch(room_id, sketch, artist_id, created_at):
    db['cur'].execute("INSERT INTO sketches (room_id, sketch, created_by, created_at) VALUES(%s, %s, %s, %s)", (room_id, sketch, artist_id, created_at))
    db['conn'].commit()
    close_db()

MESSAGE_FETCH_LIMIT = 3

def get_sketches(room_id, page=0):
    offset = page * MESSAGE_FETCH_LIMIT
    db["cur"].execute("SELECT sketch, created_at FROM sketches WHERE room_id = %s LIMIT %s OFFSET %s", (room_id, MESSAGE_FETCH_LIMIT, offset))
    sketches = list(db["cur"].fetchall())
    print(sketches)
    close_db()
    return sketches