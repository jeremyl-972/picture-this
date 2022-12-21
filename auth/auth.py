from flask import Blueprint, render_template, redirect, flash, url_for, session, request
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, get_db

auth = Blueprint("auth", __name__, static_folder="static",
                  template_folder="templates")


@auth.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        cur = db["cur"]
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'
        
        if error is None:
            try:
                # Query database for username
                cur.execute("SELECT * FROM users WHERE username = %s",
                   username)
                rows = cur.fetchall()
            # Ensure username exists and password is correct    
            except len(rows) != 1 or not check_password_hash(rows[0]["hash"], password):
                error = f"User {username} does not exist or password invalid."
            else:
                # Remember which user has logged in
                session["user_id"] = rows[0]["id"]                
                return redirect(url_for("/"))

        flash(error)
    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@auth.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")

@auth.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirmation = request.form['confirmation']
        db = get_db()
        cur = db["cur"]
        conn = db["conn"]
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'
        elif not confirmation:
            error = 'Confirmation is required.'
        elif not confirmation == password:
            error = 'Password confirmation does not match.'

        if error is None:
            try:
                exists = cur.execute("SELECT * FROM users WHERE username = %s", username)  
            except exists:
                error = f"User {username} is already registered."
            else:
                hash = generate_password_hash(
                password, method='pbkdf2:sha256', salt_length=8)
                cur.execute("INSERT INTO users (username, hash) VALUES(%s, %s)", (username, hash))
                conn.commit()
                flash("Successfully registered!")
                return redirect(url_for("auth.login"))

        flash(error)

    return render_template("register.html")