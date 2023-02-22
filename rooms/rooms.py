import random

from flask import Blueprint, render_template, redirect, flash, url_for, request
from flask_login import login_required, current_user

from mysql.db import get_all_rooms, get_connected_members, save_room, get_room, get_word_rows, get_user_language
from static.translations import t, translate

rooms = Blueprint("rooms", __name__, static_folder="static",
                  template_folder="templates")


@rooms.route('/create-room/', methods=['GET', 'POST'])
@login_required
def create_room():
    if request.method == 'POST':
        lang = request.form.get('language')
        room_name = request.form.get('room_name')

        if len(room_name):
            save_room(room_name.strip(), current_user.id)
            return redirect(url_for('rooms.view_room', room_name=room_name))
        else:
            message = t[lang]['createRmFail']
            flash(message)
    return render_template('create_room.html', username=current_user.username)


@rooms.route("/choose-room", methods=['GET', 'POST'])
@login_required
def choose_room():
    """Show choose_room view"""
    username = current_user.username
    lang = get_user_language(username)
    if request.method == 'GET':
        rooms = get_all_rooms()
        if not rooms:
            flash(t[lang]['firstRm'])
            return redirect(url_for("rooms.create_room"))

        available_rooms = []
        for room in rooms:
            members = get_connected_members(room['name'])
            players = len(members)
            if players < 2:
                available_rooms.append(room['name'])

        if available_rooms:
            return render_template("join_room.html", username=username, rooms=available_rooms, language=lang)
        flash(t[lang]['noRooms'])
        return redirect(url_for("rooms.create_room"))

    room_name = request.form.get('roomSelect')
    return redirect(url_for('rooms.view_room', room_name=room_name))


@rooms.route('/view-room/<room_name>/')
@login_required
def view_room(room_name):
    lang = request.form.get('language')
    room = get_room(room_name)
    if room:
        return render_template('view_room.html', current_user=current_user, room_name=room_name)
    else:
        flash(t[lang]['getRmErr'])
        return "Room not found", 404


@rooms.route('/get_words/<difficulty>/<lang>')
def get_words(difficulty, lang):
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
    word_list = get_word_rows(random_ids)

    # translate word_dict_list if lang not en-US then return 
    if not lang == 'en-US':      
        # translate word list and remove accents with unidecode library
        tr_word_list = [translate(word, 'en', lang) for word in word_list]
        return tr_word_list
    return word_list