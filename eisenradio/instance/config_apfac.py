"""
only alive for testing, since unit test do not init app.config.from_object('config.TestConfig')
writes an .env with test config and loads it
"""
from os import path, remove
from dotenv import load_dotenv

this_script_dir = path.dirname(__file__)


def write_config():
    global this_script_dir
    # get root of app, rip off one subdir .go up
    app_root = path.dirname(this_script_dir)
    radio_db_dir = path.join(app_root, 'app_writeable', 'db')

    # Secrets that actually belong to an encrypted vault; ci app encryption
    db_path_test = path.join(radio_db_dir, 'eisenradio_test.db')
    secret_num = '9fc2e5bd8372430fb6a1012af0b51f37'

    list_test = [
        'DATABASE=' + db_path_test,
        'FLASK_ENV=development',
        'DEBUG=True',
        'TESTING=True',
        'SECRET_KEY=' + secret_num
    ]

    remove_config()
    with open(path.join(this_script_dir, '.env'), 'w') as writer:
        for line in list_test:
            writer.write(line + '\n')
        writer.flush()

    load_config_os()

    # print(api.config)
    print('')
    remove_config()


def load_config_os():
    global this_script_dir
    load_dotenv(path.join(this_script_dir, '.env'))
    pass


def remove_config(new_path=None):
    global this_script_dir
    if new_path is not None:
        this_script_dir = new_path
    try:
        remove(path.join(this_script_dir, '.env'))
    except OSError:
        pass
