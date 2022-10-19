import certifi
from flask import Flask
from os import path, environ
from eisenradio.api import api
from ghettorecorder import ghettoApi

# android ssl fix
environ['SSL_CERT_FILE'] = certifi.where()

script_path = path.dirname(__file__)

""" Flask application factory with blueprints  """

""" 'Home' and 'Util' load modules, templates, styles, favicon from its own project folders """


def create_app(work_port):  # must be None
    """ flask prod application factory
    prod
    """
    app = Flask('eisenradio')

    with app.app_context():

        api.init_app(app)
        ghettoApi.init_work_port(work_port)  # port to use; browser autostart, sound endpoint

        is_snap_device = 'SNAP' in environ  # write in [SNAP_USER_COMMON]

        is_android_device = 'ANDROID_STORAGE' in environ

        if not is_snap_device and not is_android_device:
            # PROD
            app.config.from_object('config.ProdConfig')
            # app.config.from_object('config.TestConfig')    # total fail from pytest

        if is_snap_device:
            # write_config('snap')
            # remove_config(environ["SNAP_USER_COMMON"])
            app.config.from_object('config.SnapConfig')
            pass

        if is_android_device:
            app.config.from_object('config.AndroidConfig')

        # helper stuff
        from eisenradio.lib.platform_helper import main as start_frontend
        from eisenradio.lib.eisdb import install_new_db as create_install_db

        from eisenradio.eisenhome import routes as home_routes
        from eisenradio.eisenutil import routes as util_routes

        # Register Blueprints (pointer to parts of the application, subprojects in production)
        app.register_blueprint(home_routes.eisenhome_bp)
        app.register_blueprint(util_routes.eisenutil_bp)

        create_install_db(app.config['DATABASE'])

        start_frontend()
        return app


def create_app_dev(work_port, test=None):  # must be None
    """dev

    dev
    """
    app = Flask('eisenradio')

    with app.app_context():

        api.init_app(app)
        ghettoApi.init_work_port(work_port)  # port to use; browser autostart, sound endpoint

        if test is not None:
            """------------- TEST RUN -------------------
            exec  write_config('test') at first from pytest"""
            # write_config('test')
            # remove in teardown

        if not test:
            # environ['WERKZEUG_RUN_MAIN'] = 'true'
            is_snap_device = 'SNAP' in environ  # write in [SNAP_USER_COMMON]
            is_android_device = 'ANDROID_STORAGE' in environ

            if not is_snap_device and not is_android_device:
                # write_config('dev')
                # remove_config()
                app.config.from_object('config.DevConfig')

        # helper stuff
        from eisenradio.lib.platform_helper import main as start_frontend
        from eisenradio.lib.eisdb import install_new_db as create_install_db

        from eisenradio.eisenhome import routes as home_routes
        from eisenradio.eisenutil import routes as util_routes

        # Register Blueprints (pointer to parts of the application, subprojects in production)
        app.register_blueprint(home_routes.eisenhome_bp)
        app.register_blueprint(util_routes.eisenutil_bp)

        app.config.update(
            SECRET_KEY=environ['SECRET_KEY'],
            DATABASE=environ['DATABASE'],
            FLASK_ENV=environ['FLASK_ENV'],
            DEBUG=environ['DEBUG'],
            TESTING=environ['TESTING'],
            PYTEST=True
        )

        create_install_db(app.config['DATABASE'])

        if test:
            print(f"\tTEST!!!:       {app.config}\n")
        if not test:
            start_frontend()
        return app
