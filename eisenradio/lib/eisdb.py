import sqlite3
import base64
import shutil
from os import path, makedirs, environ, remove
from pathlib import Path as Pathlib_path
from flask import flash, current_app
from werkzeug.exceptions import abort
from eisenradio.db import make_db_from_schema, empty_db_from_schema
from eisenradio.api import api


def get_db_path():

    try:
        db = environ['DATABASE']
        return db
    except KeyError:
        db = current_app.config["DATABASE"]
        return db


def get_db_connection():

    db = get_db_path()
    conn = sqlite3.connect(str(db))
    conn.row_factory = sqlite3.Row
    return conn


def status_read_status_set(set_status, table, column, table_id):
    # sqlite does not allow dynamic table or column assignment, user handbook
    col_value = ''

    conn = get_db_connection()

    if table == 'posts':
        """ tuple one field set(id,) """
        if column == 'content':
            col_value = conn.execute('SELECT content FROM posts WHERE id = ? ;', (table_id,)).fetchone()
        if column == 'title':
            col_value = conn.execute('SELECT title FROM posts WHERE id = ? ;', (table_id,)).fetchone()
        if column == 'download_path':
            col_value = conn.execute('SELECT download_path FROM posts WHERE id = ? ;', (table_id,)).fetchone()
        conn.close()
        if col_value:
            return col_value[0]
        if not col_value:
            return "column not in table posts, status_read_status_set"

    if table == 'eisen_intern':
        """ tuple two fields are set (id,str) """
        if column == 'browser_open':
            col_value = conn.execute(
                'SELECT browser_open FROM eisen_intern WHERE id = ?;', (str(table_id))).fetchone()

            if set_status:
                if col_value[0]:  # toggle values
                    conn.execute('UPDATE eisen_intern SET browser_open = ? WHERE id = ?;', (str(0), str(table_id)))
                else:
                    conn.execute('UPDATE eisen_intern SET browser_open = ? WHERE id = ?;', (str(1), str(table_id)))

        conn.commit()
        conn.close()

    return col_value[0]


def get_download_dir():
    dir_path = ''
    conn = get_db_connection()

    records = conn.execute('select id from posts').fetchall()
    if not records:
        print(f' No Radio in Database! Create a radio and set Save path in navigation bar')
        flash('No Radio in Database! Create a radio and set Save path in navigation bar', 'warning')
        return False
    for row_name_id in records:
        if row_name_id[0]:
            """take first item"""
            dir_path = conn.execute('SELECT download_path FROM posts WHERE id = ? ;', [str(row_name_id[0])]).fetchone()
            conn.close()
            break
        if not row_name_id[0]:
            dir_path = False
            break

    if dir_path:
        return dir_path[0]
    if not dir_path:
        print(f' No Radio in Database! Create a radio and set Save path in navigation bar')
        flash('No Radio in Database! Create a radio and set Save path in navigation bar', 'warning')
    return False


def get_db_smaller():
    db = get_db_path()
    conn = sqlite3.connect(db, isolation_level=None)
    conn.execute("VACUUM")
    conn.close()


def render_picture(byte_data, de_enc):
    render_pic = ''
    if de_enc == 'encode':
        render_pic = base64.b64encode(byte_data).decode('ascii')
    if de_enc == 'decode':
        render_pic = base64.b64decode(byte_data).decode('ascii')
    return render_pic


def get_post(post_id):
    conn = get_db_connection()
    post = conn.execute('SELECT * FROM posts WHERE id = ?',
                        [str(post_id)]).fetchone()
    conn.close()
    if post is None:
        abort(404)  # flask.abort(404)
    return post


def install_new_db(db_path):

    schema_db = ''

    is_snap_device = 'SNAP' in environ
    if not is_snap_device:
        # get root of app, rip off one subdir from script dir .go up
        schema_dir = path.dirname(path.dirname(__file__))
        schema_db = path.join(schema_dir, 'database.db')
    if is_snap_device:
        schema_dir = environ["SNAP_USER_COMMON"]
        schema_db = path.join(schema_dir, 'pre_configured.db')

    db_env = path.abspath(environ['DATABASE'])
    db_flask = path.abspath(api.config.get("DATABASE"))

    if str(db_env) != str(db_flask):
        print(f' -ValueError->{db_env}<-ValueError- environ')
        print(f' -ValueError->{db_flask}<-ValueError- api')
        raise ValueError("\nDatabase path do not match in os env and flask env!\nMost likely no clean up in Test; "
                         "RESTART!\nrh")

    """ if not path exists """
    if not path.exists(db_path):
        try:
            makedirs(path.dirname(db_path))
        except FileExistsError:
            pass

    this_db = Pathlib_path(db_path)
    testing = environ["TESTING"]
    if testing == 'False':
        if not this_db.is_file():
            make_db_from_schema()

    if testing == 'True':
        if this_db.is_file():
            remove(this_db)

        empty_db = environ["EMPTY_DB"]
        print(f' environ["EMPTY_DB"] for Test ->{environ["EMPTY_DB"]}<- in eisdb.py')

        if empty_db == 'True':
            empty_db_from_schema()
        if empty_db == 'False':
            make_db_from_schema()
        shutil.move(str(schema_db), db_path)

    if not this_db.is_file():
        shutil.move(str(schema_db), db_path)


def delete_radio(radio_id):
    conn = get_db_connection()
    try:
        conn.execute('DELETE FROM posts WHERE id = ?', (str(radio_id),))
        conn.commit()
        conn.close()
        get_db_smaller()
    except KeyError:
        conn.close()
        return False
    conn.close()
    return True


def enum_radios():
    conn = get_db_connection()
    posts = conn.execute('SELECT * FROM posts').fetchall()
    conn.close()
    return posts


def db_get_id_from_name(radio_name):
    conn = get_db_connection()
    radio_id = conn.execute('SELECT id FROM posts WHERE title = ?', (str(radio_name),)).fetchone()
    conn.close()
    return radio_id[0]
