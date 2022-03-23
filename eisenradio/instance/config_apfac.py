from os import path, remove, environ
from dotenv import load_dotenv

try:
    from flask import current_app
except ImportError:
    pass

this_script_dir = path.dirname(__file__)


def write_config(conf, empty_db=None):
    global this_script_dir
    # get root of app, rip off one subdir .go up
    app_root = path.dirname(this_script_dir)

    radio_db_dir = path.join(app_root, 'app_writeable', 'db')

    # SECRET_KEY
    secret_num = '9fc2e5bd8372430fb6a1012af0b51f37'
    # PRODUCTION, DEV
    db_path_prod = path.join(radio_db_dir, 'database.db')
    # TEST
    db_path_test = path.join(radio_db_dir, 'eisenradio_test.db')
    # SNAP
    db_path_snap = ''
    if conf == 'snap':
        db_path_snap = environ["SNAP_USER_COMMON"] + '//database.db'
    db_path_android = ''
    if conf == 'android':
        # location is only temporary writable, to next restart of app, like a docker container
        # db_path_android = path.abspath(path.join(app_root, 'app_writeable', 'db', 'eisenradio_android.db'))
        # have to copy the db to a user writable location, hardcoded in this version
        db_path_android = "/storage/emulated/0/Music/EisenRadio/eisenradio_android.db"

    if empty_db is None:
        empty_db = 'False'
    if empty_db == 'True':
        empty_db = 'True'

    list_prod = [
        'DATABASE=' + db_path_prod,
        'FLASK_ENV=production',
        'DEBUG=False',
        'TESTING=False',
        'SECRET_KEY=' + secret_num,
        'EMPTY_DB=' + empty_db
    ]

    list_test = [
        'DATABASE=' + db_path_test,
        'FLASK_ENV=development',
        'DEBUG=True',
        'TESTING=True',
        'SECRET_KEY=' + secret_num,
        'EMPTY_DB=' + empty_db
    ]

    list_dev = [
        'DATABASE=' + db_path_prod,
        'FLASK_ENV=development',
        'DEBUG=True',
        'TESTING=True',
        'SECRET_KEY=' + secret_num,
        'EMPTY_DB=' + empty_db
    ]

    list_snap = [
        'DATABASE=' + db_path_snap,
        'FLASK_ENV=production',
        'DEBUG=False',
        'TESTING=False',
        'SECRET_KEY=' + secret_num,
        'EMPTY_DB=' + empty_db
    ]

    dict_android_os_env = {"DATABASE": str(db_path_android),
                           "FLASK_ENV": 'production',
                           "DEBUG": 'False',
                           "TESTING": 'False',
                           "SECRET_KEY": 'environ[] = ' + str(secret_num),
                           "EMPTY_DB": str(empty_db),
                           "ME_TOO": 'False'
                           }

    """loader is not needed if os env loaded directly here in /instance folder (but can load from share)"""
    loader = ''
    db = ''
    f_env = ''
    debug = ''
    testing = ''

    # flask env
    if conf == 'prod':
        loader = list_prod  # write to .env -> os env
        db = db_path_prod  # make flask env, config.update
        f_env = 'production'
        debug = 'False'
        testing = 'False'

    if conf == 'test':
        loader = list_test
        db = db_path_test
        f_env = 'development'
        debug = 'True'
        testing = 'True'

    if conf == 'dev':
        loader = list_dev
        db = db_path_prod
        f_env = 'development'
        debug = 'True'
        testing = 'True'

    if conf == 'snap':
        loader = list_snap
        if db_path_snap == '':
            raise ValueError('\n SNAP got no db path!!')
        db = db_path_snap
        f_env = 'production'
        debug = 'False'
        testing = 'False'

    if conf == 'android':
        loader = ''
        if db_path_android == '':
            raise ValueError('\n Android got no db path!!')
        db = db_path_android
        f_env = 'production'
        debug = 'False'
        testing = 'False'

    if not conf == 'snap' and not conf == 'android':
        remove_config()
        with open(path.join(this_script_dir, '.env'), 'w') as writer:
            for line in loader:
                writer.write(line + '\n')
            writer.flush()
        load_config_os()

    if conf == 'snap':
        db_path_snap_dir = environ["SNAP_USER_COMMON"]
        remove_config(db_path_snap_dir)
        with open(path.join(db_path_snap_dir, '.env'), 'w') as writer:
            for line in loader:
                writer.write(line + '\n')
            writer.flush()
        load_config_os(db_path_snap_dir)

    if conf == 'android':
        for var, setter in dict_android_os_env.items():
            environ[var] = setter

    try:
        current_app.config.update(SECRET_KEY=secret_num,
                                  DATABASE=path.abspath(db),
                                  FLASK_ENV=f_env,
                                  DEBUG=debug,
                                  TESTING=testing,
                                  )
    except RuntimeError:
        """test from outside can not connect to flask 'current_app' """
        pass


def load_config_os(new_path=None):
    global this_script_dir
    if new_path is not None:
        this_script_dir = new_path
    load_dotenv(path.join(this_script_dir, '.env'))


def remove_config(new_path=None):
    global this_script_dir
    if new_path is not None:
        this_script_dir = new_path
    try:
        remove(path.join(this_script_dir, '.env'))
    except OSError:
        pass
