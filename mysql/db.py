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

def connect_to_room(sid, room_name, user_id):
    db["cur"].execute("INSERT INTO sio_connected_clients (room_name, user_id, sid) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE sid=VALUES(sid)" , (room_name, user_id, sid))
    db["conn"].commit()
    db["cur"].execute("SELECT COUNT(*) as count FROM sio_connected_clients WHERE room_name = %s", room_name)
    count = db["cur"].fetchone()
    close_db()
    return count['count']

def disconnect_from_room(sid):
    db["cur"].execute("SELECT username, room_name FROM users JOIN sio_connected_clients ON users.id = sio_connected_clients.user_id WHERE sid = %s", sid)
    userDict = db["cur"].fetchone()
    db["cur"].execute("DELETE FROM sio_connected_clients WHERE sid = %s", (sid))
    db["conn"].commit()
    close_db()
    return userDict

def get_connected_members(room_name):
    db["cur"].execute("SELECT username FROM users JOIN sio_connected_clients ON users.id = sio_connected_clients.user_id WHERE room_name = %s", (room_name))
    membersList = db["cur"].fetchall()
    connected_members = [member['username'] for member in membersList]
    close_db()
    return connected_members


def save_sketch(room_name, dataUrl, artist_id, created_at):
    db['cur'].execute("INSERT INTO sketches (room_name, dataUrl, created_by, created_at) VALUES(%s, %s, %s, %s)", (room_name, dataUrl, artist_id, created_at))
    db['conn'].commit()
    close_db()
    

def get_word_rows(int_list):
    db["cur"].execute("SELECT word FROM words WHERE id IN%(int_list)s", {'int_list': tuple(int_list)})
    word_dict_list = list(db["cur"].fetchall())        
    close_db()
    word_list = [dict['word'] for dict in word_dict_list]
    return word_list