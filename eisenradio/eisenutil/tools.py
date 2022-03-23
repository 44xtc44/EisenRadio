import configparser
from os import path
from flask import flash
from eisenradio.lib.eisdb import delete_radio, get_db_connection, get_db_smaller, status_read_status_set
from eisenradio.eisenutil.eisutil import is_in_db_view
from eisenradio.lib.eisdb import render_picture, get_download_dir


def delete_all_radios():
    rv = False
    posts = get_radios()

    for radio in posts:
        rv = delete_radio(radio['id'])
        if rv:
            rv = True
        if not rv:
            rv = False
    # vakuum db
    get_db_smaller()
    flash('Deletion Done', 'success')
    return rv


def export_radios():
    # BLUES_UK = http://149.255.59.3:8232/stream
    rv = True
    radio_url_dict = {}
    download_path = ''

    try:
        posts = get_radios()
        for station in posts:
            station_name = status_read_status_set(False, 'posts', 'title', station['id'])
            station_url = status_read_status_set(False, 'posts', 'content', station['id'])
            download_path = status_read_status_set(False, 'posts', 'download_path', station['id'])
            radio_url_dict[station_name] = station_url
    except KeyError:
        rv = False
    except ValueError:
        rv = False

    if not rv:
        return rv

    export_path = download_path

    try:
        with open(path.join(export_path, 'settings.ini'), 'w') as writer:
            writer.write('[GLOBAL]' + '\n')
            writer.write('SAVE_TO_DIR = ' + download_path + '\n')
            writer.write('[STATIONS]' + '\n')
            for radio, url in radio_url_dict.items():
                writer.write(radio + ' = ' + url + '\n')
            writer.flush()
    except OSError:
        rv = False
    return rv


def upload_radios(str_ini):    # entry point for an uploaded ini
    config = configparser.ConfigParser()
    global_dict = False
    station_dict = False
    try:
        config.read_string(str_ini)
        station_dict = config['STATIONS']
        global_dict = config['GLOBAL']
        if len(global_dict) == 0:
            global_dict = False
    except Exception as error:
        print(f' upload_radios unknown error: {error} - but will proceed')
    finally:
        if not station_dict:
            print(f' error in [STATIONS]')
            return False
        rv = db_import_ini(station_dict, global_dict, None)
        if rv:
            return True
        return False


def import_radios(path_ini):    # entry point for a normal input field: path
    station_dict = find_all_in_stations(path_ini)

    if station_dict:
        rv = db_import_ini(station_dict, None, path_ini)
        if rv:
            return True
    return False


def find_all_in_stations(path_ini):
    config = configparser.ConfigParser()  # imported library to work with .ini files
    try:
        config.read_file(open(path_ini))
    except FileNotFoundError as ex:
        print(ex)
        return False
    else:
        station_dict = config['STATIONS']
        return station_dict


def find_save_to_dir(path_ini):
    config = configparser.ConfigParser()
    try:
        config.read_file(open(path_ini))
    except FileNotFoundError as ex:
        print(ex)
        return False
    else:
        global_dict = config['GLOBAL']
        return global_dict


def db_import_ini(station_dict, global_dict=None, path_ini=None):
    download_path = ''
    conn = get_db_connection()
    posts = conn.execute('SELECT * FROM posts').fetchall()

    """all radios with url from ini file, station section"""
    for title, content in station_dict.items():

        if is_in_db_view(title):
            title = title + '__duplicated_name'

        radio_image, content_type = radio_spare_image()

        try:
            download_path = posts[0]["download_path"]
        except IndexError:
            if not global_dict:
                # 'Section Header, but no content.'
                conn.execute('INSERT INTO posts (title, content, download_path, pic_data, pic_content_type) VALUES ('
                             '?, ?, ?, ?, ?)',
                             (title, content, '/use/Save/from/menu', radio_image, content_type))
            if global_dict:
                download_path = global_dict['SAVE_TO_DIR']
            if path_ini:
                global_dict = find_save_to_dir(path_ini)
                if global_dict:
                    download_path = global_dict['SAVE_TO_DIR']
        except KeyError:
            print(' looks like the first radio to create, no save to path set')
            conn.execute('INSERT INTO posts (title, content, download_path, pic_data, pic_content_type) VALUES ('
                         '?, ?, ?, ?, ?)',
                         (title, content, '/use/Save/from/menu', radio_image, content_type))
        try:
            if download_path:
                conn.execute('INSERT INTO posts (title, content, download_path, pic_data, pic_content_type) VALUES ('
                             '?, ?, ?, ?, ?)',
                             (title, content, download_path, radio_image, content_type))
        except ValueError:
            conn.close()
            return False

    conn.commit()
    conn.close()
    return True


def get_radios():
    conn = get_db_connection()
    posts = conn.execute('SELECT * FROM posts').fetchall()
    conn.close()
    return posts


def radio_spare_image():
    this_dir = path.dirname(__file__)
    img_path = path.join(this_dir, 'bp_util_static', 'images', 'styles', 'drum_snail.png')
    with open(img_path, 'rb') as pic_reader:
        image_bin = pic_reader.read()
    img_base64 = render_picture(image_bin, 'encode')
    content_type = 'image/png'
    return img_base64, content_type


def get_export_path():
    download_path = get_download_dir()
    if not download_path:
        export_path = "use Save from Navigation Menu"
    else:
        export_path = download_path
    return export_path
