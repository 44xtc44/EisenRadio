import concurrent.futures
from eisenradio.api import ghettoApi


def header_data_read():
    """return a list of radio lists with header info of all connected internet radios

    call header_from_api_read() to read all response header info from ghettoApi dicts that GhettoRecorder module wrote
    """
    active_btn_list = active_buttons()
    header_data_list_of_lists = header_from_api_read(active_btn_list)
    return header_data_list_of_lists


def active_buttons():
    """return the list of all currently pressed buttons ids of rec and listen type

    use set to remove duplicate ids if rec and listen is active
    """
    active_btn_list = [radio_id for radio_id, btn_down in ghettoApi.rec_btn_dict.items() if btn_down]
    listen_list = [radio_id for radio_id, btn_down in ghettoApi.lis_btn_dict.items() if btn_down]
    active_btn_list.extend(listen_list)
    return list(set(active_btn_list))


def header_from_api_read(active_btn_list):
    """return the ready to send list for jsonify

    use map() built-in and ThreadPoolExecutor, but speed is not a requirement here
    """
    name_list = [ghettoApi.radios_in_view_dict[radio_id] for radio_id in active_btn_list]
    with concurrent.futures.ThreadPoolExecutor() as executor:
        list_of_lists = list(executor.map(request_header_info, name_list))
    return list_of_lists


def request_header_info(name):
    """return a list with collected response header strings if available else string '---' to let look empty info pro"""
    info_list = [
        request_time_api(name),
        request_suffix_api(name),
        request_icy_genre_api(name),
        request_icy_name_api(name),
        request_icy_view_id_api(name),
        request_icy_br_api(name),
        request_icy_url_api(name)
    ]
    # list order:
    # request_time, request_suffix, request_icy_genre, request_icy_name,
    # request_icy_view_id, request_icy_br, request_icy_url
    return info_list


def request_suffix_api(name):
    """return the content type resolved to file suffix string"""
    rv = '---'
    try:
        content_type = ghettoApi.ghetto_measure_dict[name + ',suffix']
        if content_type == 'audio/aacp' or content_type == 'application/aacp':
            rv = 'aacp'
        if content_type == 'audio/aac':
            rv = 'aac'
        if content_type == 'audio/ogg' or content_type == 'application/ogg':
            rv = 'ogg'
        if content_type == 'audio/mpeg':
            rv = 'mp3'
        if content_type == 'audio/x-mpegurl' or content_type == 'text/html':
            rv = 'm3u'
    except KeyError:
        pass
    return str(rv)


def request_icy_view_id_api(name):
    rv = '---'
    try:
        for key, val in ghettoApi.radios_in_view_dict.items():
            if val == name:
                rv = key
    except KeyError:
        pass
    return str(rv)


def request_time_api(name):
    rv = '---'
    try:
        rv = ghettoApi.ghetto_measure_dict[name + ',request_time']
    except KeyError:
        pass
    return str(rv)


def request_icy_genre_api(name):
    rv = '---'
    try:
        rv = ghettoApi.ghetto_measure_dict[name + ',icy_genre']
    except KeyError:
        pass
    return str(rv)


def request_icy_name_api(name):
    rv = '---'
    try:
        rv = ghettoApi.ghetto_measure_dict[name + ',icy_name']
    except KeyError:
        pass
    return str(rv)


def request_icy_br_api(name):
    rv = '---'
    try:
        rv = ghettoApi.ghetto_measure_dict[name + ',icy_br']
    except KeyError:
        pass
    return str(rv)


def request_icy_url_api(name):
    rv = '---'
    try:
        rv = ghettoApi.ghetto_measure_dict[name + ',icy_url']
    except KeyError:
        pass
    return str(rv)
