import sqlite3
import base64

from os import path, makedirs, remove
from pathlib import Path as Pathlib_path
from flask import flash
from werkzeug.exceptions import abort
from eisenradio.db import make_db_from_schema
from eisenradio.api import api


def get_db_path():
    return api.config['DATABASE']


def get_db_connection():
    conn = sqlite3.connect(api.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn


def status_read_status_set(set_status, table, column, table_id):
    """return value of db or set a value in db

    helper function for often used queries
    can only set values in eisen_intern table
    """
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
    rv = col_value[0]  # test
    return rv


def get_download_dir():
    """return download dir, return None if db is empty"""
    conn = get_db_connection()
    column = conn.execute('SELECT download_path FROM posts').fetchall()
    conn.close()
    if column:
        if column[0]:
            for row in column:
                return row[0]
    message = ' No Radio in Database! Create a radio and set Save path in navigation bar'
    print(message)
    flash(message, 'warning')
    return


def get_db_smaller():
    db = api.config['DATABASE']
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
    """make db from schema"""
    if not path.exists(db_path):
        try:
            makedirs(path.dirname(db_path))
        except FileExistsError:
            pass

    if not Pathlib_path(db_path).is_file():
        make_db_from_schema(Pathlib_path(db_path))


def delete_db(db_path):
    if Pathlib_path(db_path).is_file():
        remove(Pathlib_path(db_path))


def delete_radio(radio_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM posts WHERE id = ?', (str(radio_id),))
    conn.commit()
    conn.close()
    get_db_smaller()
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
