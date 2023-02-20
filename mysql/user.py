from werkzeug.security import check_password_hash

# Flask-Login requires this user class object
class User:

    def __init__(self, username, password, id):
        self.username = username
        self.password = password
        self.id = id

    @staticmethod
    def is_authenticated():
        return True

    @staticmethod
    def is_active():
        return True

    @staticmethod
    def is_anonymous():
        return False

    def get_id(self):
        return self.username

    def check_password(self, password_input):
        return check_password_hash(self.password, password_input)