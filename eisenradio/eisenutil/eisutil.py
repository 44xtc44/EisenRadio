import os
from flask import flash
from ghettorecorder import ghettoApi


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
    rv = str_name.translate({ord(string): "" for string in '"!@#$%^*()[]{};:,./<>?\\|`~=+"""'})
    return rv


def radio_start_page_url_get(radio_name):
    """return the anchor point url with the port number of the server"""
    radio_id = ""
    for id_num, name in ghettoApi.radios_in_view_dict.items():
        if name == radio_name:
            radio_id = id_num
    port = ghettoApi.work_port
    radio_start_page_url = 'http://localhost:' + str(port) + '/#dot_' + str(radio_id)
    return radio_start_page_url


def radio_listen_button_get():
    """ return complete id of current pressed listen button"""
    l_list = [radio_id for radio_id, btn_down in ghettoApi.lis_btn_dict.items() if btn_down]
    button_id = "Listen_" + str(l_list[0]) if len(l_list) > 0 else ""
    return button_id


def radio_name_get():
    """return name if id is in list else None"""
    l_list = [radio_id for radio_id, btn_down in ghettoApi.lis_btn_dict.items() if btn_down]
    if len(l_list) > 0:
        radio_id = l_list[0]
        return ghettoApi.radios_in_view_dict[radio_id]
    return


def parse_url_simple_url(radio_url):
    """called by routes.py, def post(post_id) to link to original radio URL """
    url = radio_url  # whole url is used for connection to radio server

    # 'http:' is first [0], 'ip:port/xxx/yyy' second item [1] in list_url_protocol
    list_url_protocol = url.split("//")
    list_url_ip_port = list_url_protocol[1].split("/")  # 'ip:port' is first item in list_url_ip_port
    radio_simple_url = list_url_protocol[0] + '//' + list_url_ip_port[0]
    return radio_simple_url
