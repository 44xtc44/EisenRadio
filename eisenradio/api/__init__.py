

class Api:
    """class in a 3rd party module mirrors the flask variables

    to get the variables without the (with app.app_context:) statement of flask used
    experimenting with android, which do not like(d) application factory and app_context
    default class constructor without arguments
    init vars:
    config -- flask config (default None)
    """

    def __init__(self):
        """default without args"""

        self.config = None

    def init_app(self, app):
        """flask config
        compare with os vars to see if start config db path got an accident
        trouble with testing from partial initialized functional test
        """

        self.config = app.config

    def __repr__(self):
        return f"api.init_app({self.config})"

    def __str__(self):
        return f"Flask application factory config: {self.config}"


class GhettoTest:
    def __init__(self):
        self.thread_killer = ()

    def init_test_thread_killer(self, thread_killer):
        """kills a single thread ("radio", "listen", "meta"), thread reads tuple and exit if match"""
        self.thread_killer = thread_killer


api = Api()
ghettoTest = GhettoTest()
