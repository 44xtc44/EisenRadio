import os
from flask import flash
from eisenradio.api import eisenApi


def make_folder(this_folder):
    rv = True
    try:
        os.makedirs(this_folder)
        flash('Done!\t' + this_folder, 'success')
    except FileExistsError:
        pass
    except Exception as e:
        flash(f'Failed!\t {e}', 'danger')
        rv = False
    finally:
        return rv


def is_in_db_view(a_name):
    for radio_name in eisenApi.radio_id_name_dict.values():
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
    for id_num, name in eisenApi.radio_id_name_dict.items():
        if name == radio_name:
            radio_id = id_num
    port = eisenApi.work_port
    radio_start_page_url = 'http://localhost:' + str(port) + '/#dot_' + str(radio_id)
    return radio_start_page_url


def radio_listen_button_get():
    """ return complete id of current pressed listen button"""
    l_list = [radio_id for radio_id, btn_down in eisenApi.lis_btn_dict.items() if btn_down]
    button_id = "Listen_" + str(l_list[0]) if len(l_list) > 0 else ""
    return button_id


def radio_name_get():
    """return name if id is in list else None"""
    l_list = [radio_id for radio_id, btn_down in eisenApi.lis_btn_dict.items() if btn_down]
    if len(l_list) > 0:
        radio_id = l_list[0]
        return eisenApi.radio_id_name_dict[radio_id]
    return


def parse_url_simple_url(radio_url):
    """called by routes.py, def post(post_id) to link to original radio URL """
    url = radio_url  # whole url is used for connection to radio server

    # 'http:' is first [0], 'ip:port/xxx/yyy' second item [1] in list_url_protocol
    list_url_protocol = url.split("//")
    list_url_ip_port = list_url_protocol[1].split("/")  # 'ip:port' is first item in list_url_ip_port
    radio_simple_url = list_url_protocol[0] + '//' + list_url_ip_port[0]
    return radio_simple_url
