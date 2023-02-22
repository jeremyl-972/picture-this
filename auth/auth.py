from flask import Blueprint, render_template, redirect, flash, url_for, request
from flask_login import login_user, login_required, logout_user, current_user

from mysql.db import get_user, save_user, update_user_language
from static.translations import t

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
        lang = request.form['language']
        user = None
        error = None

        if not username:
            error = t[lang]['nameReqErr']
        elif not password:
            error = t[lang]['pswrdReqErr']
        else:
            user = get_user(username, lang)
            if type(user) == str:
                error = user
            elif not user.check_password(password):
                error = t[lang]['pswrdInvldErr']
            else:
                update_user_language(lang, username)
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
        lang = request.form['language']
        error = None

        if not username:
            error = t[lang]['nameReqErr']
        elif not password:
            error = t[lang]['pswrdReqErr']
        elif not confirmation:
            error = t[lang]['pswrdCnfrmErr']
        elif not confirmation == password:
            error = t[lang]['pswrdMisMatchErr']
        else:
            # save user to db
            status = save_user(username, password, lang)
            # username already registered
            if status["error"] == True:
                error = status["message"]
            else:
                flash(status["message"])
                return redirect(url_for("auth.login"))

        flash(error)
    # User reached route via GET (as by clicking a link or via redirect)
    return render_template("register.html")