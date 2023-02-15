from flask import Blueprint, render_template, redirect, flash, url_for, request
from flask_login import login_user, login_required, logout_user, current_user

from mysql.db import get_user, save_user, update_user_language

auth = Blueprint("auth", __name__, static_folder="static",
                  template_folder="templates")

@auth.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""
    if current_user.is_authenticated:
        redirect(url_for('index'))
    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        username = request.form['username']
        password = request.form['password']
        language = request.form['language']
        print(language)
        user = None
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'
        else:
            user = get_user(username)
            if type(user) == str:
                error = user
            elif not user.check_password(password):
                error = "Password invalid."
            else:
                update_user_language(language, username)
                login_user(user)              
                return redirect(url_for("index"))    

        flash(error)
        return redirect(url_for("auth.login"))    

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@auth.route("/logout")
@login_required
def logout():
    """Log user out"""
    logout_user()

    # Redirect user to login form
    return redirect("/")

@auth.route('/register', methods=('GET', 'POST'))
def register():
    if current_user.is_authenticated:
        redirect(url_for('index'))
        
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirmation = request.form['confirmation']
        language = request.form['language']
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'
        elif not confirmation:
            error = 'Confirmation is required.'
        elif not confirmation == password:
            error = 'Password confirmation does not match.'
        else:
            # save user to db
            status = save_user(username, password, language)
            # username already registered
            if status["error"] == True:
                error = status["error"]
            else:
                flash(status["message"])
                return redirect(url_for("auth.login"))

        flash(error)
    # User reached route via GET (as by clicking a link or via redirect)
    return render_template("register.html")