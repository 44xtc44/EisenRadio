import os
from flask import flash
from eisenradio.api import ghettoApi


def make_folder(this_folder):
    rv = True
    if not os.path.exists(os.path.abspath(this_folder)):
        flash('Can create folder!\t' + os.path.abspath(this_folder), 'success')
        rv = True
    else:
        rv_write = eisen_write_test(os.path.abspath(this_folder))
        if not rv_write:
            flash('Folder exists, but write test failed!\t' + os.path.abspath(this_folder), 'danger')
            rv = False
            return rv
        if rv_write:
            rv = True

    if rv:
        try:
            os.makedirs(this_folder)
        except FileExistsError as err:
            if not err.errno == 17:    # pybug, py3.10, makedirs() ignores existing dirs
                print('-make_folder----------- FileExistsError' + str(err.errno))
                rv = False
        except PermissionError:
            print('-make_folder----------- PermissionError')
            rv = False
        except OSError:
            print('-make_folder----------- OSError')
            rv = False
    return rv


def eisen_write_test(write_file):
    test_file = os.path.join(write_file, 'eisen_test.txt')
    try:
        with open(test_file, 'wb') as record_file:
            record_file.write(b'\x03')
        os.remove(test_file)
    except OSError:  # master of desaster
        return False
    return True


def is_in_db_view(a_name):
    for radio_name in ghettoApi.radios_in_view_dict.values():
        if radio_name.lower() == a_name.lower():
            return True
    return False


def remove_blank(a_name):
    rv = a_name.replace(" ", "")
    return rv


def remove_special_chars(str_name):
    str_name.replace(" ", "")
    # my_str = "hey th~!ere. /\ coolleagues?! Straße"
    rv = str_name.translate({ord(string): "" for string in '"!@#$%^*()[]{};:,./<>?\|`~=+"""'})
    return rv
