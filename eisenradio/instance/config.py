"""
Flask configuration Not in the version control
"""
import os

this_script_dir = os.path.dirname(__file__)
app_root = os. path.dirname(this_script_dir)
radio_db_dir = os.path.join(app_root, 'app_writeable', 'db')

is_snap_device = 'SNAP' in os.environ
is_android_device = 'ANDROID_STORAGE' in os.environ


class Config:
    """Base config."""
    SECRET_KEY = "9fc2e5bd8372430fb6a1012af0b51f37"


class ProdConfig(Config):
    FLASK_ENV = 'production'
    DEBUG = False
    TESTING = False
    DATABASE_URI = os.path.join(radio_db_dir, 'database.db')
    DATABASE = os.path.join(radio_db_dir, 'database.db')
    PYTEST = False


class AndroidConfig(Config):
    FLASK_ENV = 'production'
    DEBUG = False
    TESTING = False
    if is_android_device:
        DATABASE_URI = "/storage/emulated/0/Music/EisenRadio/eisenradio_android.db"
        DATABASE = "/storage/emulated/0/Music/EisenRadio/eisenradio_android.db"
    ANDROID_DEVICE = True
    PYTEST = False


class SnapConfig(Config):
    FLASK_ENV = 'production'
    DEBUG = False
    TESTING = False
    if is_snap_device:
        DATABASE_URI = os.environ["SNAP_USER_COMMON"] + '//database.db'
        DATABASE = os.environ["SNAP_USER_COMMON"] + '//database.db'
    PYTEST = False


class TestConfig(Config):
    """pep 257 senseless class because unit test can not convince flask to load it, I give up here

    load from inside flask works; use old school config_apfac.py to test it, write an .env
    """
    FLASK_ENV = 'development'
    DEBUG = True
    TESTING = True
    # DATABASE_URI = os.path.join(radio_db_dir, 'eisenradio_test.db')
    DATABASE = os.path.join(radio_db_dir, 'eisenradio_test.db')
    PYTEST = True
