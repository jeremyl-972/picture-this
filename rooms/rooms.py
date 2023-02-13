import random

from flask import Blueprint, render_template, redirect, flash, url_for, request
from flask_login import login_required, current_user

from mysql.db import get_all_rooms, get_connected_members, save_room, get_room, get_word_rows, update_user_language, get_user_language

rooms = Blueprint("rooms", __name__, static_folder="static",
                  template_folder="templates")


@rooms.route('/create-room/', methods=['GET', 'POST'])
@login_required
def create_room():
    message = ''
    if request.method == 'POST':
        room_name = request.form.get('room_name')

        if len(room_name):
            save_room(room_name.strip(), current_user.id)
            return redirect(url_for('rooms.view_room', room_name=room_name))
        else:
            message = "Failed to create room"
    return render_template('create_room.html', message=message, username=current_user.username)


@rooms.route("/choose-room", methods=['GET', 'POST'])
@login_required
def choose_room():
    """Show choose_room view"""
    username = current_user.username
    if request.method == 'GET':
        rooms = get_all_rooms()
        if not rooms:
            flash('No rooms exist. Create the first room.')
            return redirect(url_for("rooms.create_room"))

        available_rooms = []
        for room in rooms:
            members = get_connected_members(room['name'])
            players = len(members)
            if players < 2:
                available_rooms.append(room['name'])

        if available_rooms:
            return render_template("join_room.html", username=username, rooms=available_rooms, language=get_user_language(username))
        flash('No rooms are available. Create a room.')
        return redirect(url_for("rooms.create_room"))

    room_name = request.form.get('roomSelect')
    return redirect(url_for('rooms.view_room', room_name=room_name))


@rooms.route('/view-room/<room_name>/')
@login_required
def view_room(room_name):
    room = get_room(room_name)
    if room:
        return render_template('view_room.html', current_user=current_user, room_name=room_name)
    else:
        return "Room not found", 404


@rooms.route('/get_words/<difficulty>')
def get_words(difficulty):

    diff_ranges = [
        {'range': 'Easy', 'start': 1, 'end': 123},
        {'range': 'Med', 'start': 124, 'end': 331},
        {'range': 'Hard', 'start': 332, 'end': 544}
    ]

    start = 1
    end = 1
    for r in diff_ranges:
        if difficulty == r['range']:
            start = r['start']
            end = r['end']

    random_ids = [random.randint(start, end) for i in range(10)]

    word_dict_list = get_word_rows(random_ids)
    return word_dict_list