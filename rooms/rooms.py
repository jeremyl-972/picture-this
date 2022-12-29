from flask import Blueprint, render_template, redirect, flash, url_for, request
from flask_login import login_required, current_user

from mysql.db import get_user_id, get_username_by_id, save_room, add_room_members, get_room, is_room_member, is_room_admin, get_room_members, get_sketches

rooms = Blueprint("rooms", __name__, static_folder="static",
                  template_folder="templates")

@rooms.route('/create-room/', methods=['GET', 'POST'])
@login_required
def create_room():
    message = ''
    if request.method == 'POST':
        room_name = request.form.get('room_name')
        usernames = [username.strip() for username in request.form.get('members').split(',')]
        # check that usernames are registered users
        for username in usernames:
            valid_user = get_user_id(username)
            if not valid_user:
                flash("Must only include valid registered users")
                return redirect(url_for("rooms.create_room"))
        
        if len(room_name) and len(usernames):
            room_id = save_room(room_name, current_user.id)
            # take admin out of list if they added themselves
            if current_user.username in usernames:
                usernames.remove(current_user.username)
            add_room_members(room_id, usernames, current_user.id)
            return redirect(url_for('rooms.view_room', room_id=room_id))
        else:
            message = "Failed to create room"
    return render_template('create_room.html', message=message)

@rooms.route('/<room_id>/')
@login_required
def view_room(room_id):
    room = get_room(room_id)
    if room and is_room_member(room_id, current_user.id):
        room_members = get_room_members(room_id)
        usernames = []
        for member in room_members:
            user_id = member['user_id']
            username = get_username_by_id(user_id)
            usernames.append(username)
        sketches = get_sketches(room_id)
        roomname = room["name"]
        return render_template('view_room.html', username=current_user.username, room=roomname, room_members=usernames,
                               sketches=sketches)
    else:
        return "Room not found", 404