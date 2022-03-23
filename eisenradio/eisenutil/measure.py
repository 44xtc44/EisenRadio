import copy
import concurrent.futures
from eisenradio.api import ghettoApi

""" read header info and request execution time """


rec_btn_archive = {}
lis_btn_archive = {}


def measure_meta():
    rv = cache_info()
    return rv


def stopped_stations():
    active_buttons_list = active_buttons()
    stop_list = streamer_stopped(active_buttons_list)
    renew_button_archive()

    # clean dict from api, no del, record runs?
    for radio_num in stop_list:
        for radio_db_id, radio_title in ghettoApi.radios_in_view_dict.items():
            if radio_num == radio_db_id:
                try:
                    ghettoApi.ghetto_radios_metadata_text[radio_title] = ""
                except KeyError:
                    print('fail #stopped_stations delete val from dict')
                    pass
    return stop_list


def cache_info():
    streamer_list = active_buttons()
    rv = read_meta_from_api(streamer_list)
    return rv


def active_buttons():
    streamer_list = streamer_active_read()
    listener_str = listener_active_read()
    if listener_str:
        streamer_list.append(listener_str)
    return streamer_list


def streamer_active_read():
    active_streamer_list = []
    for radio_id, btn_down in ghettoApi.rec_btn_dict.items():
        if btn_down:
            active_streamer_list.append(radio_id)
    return active_streamer_list


def listener_active_read():
    for radio_id, btn_down in ghettoApi.lis_btn_dict.items():
        if btn_down:
            return radio_id
    return False


def streamer_stopped(active_streamer_list):
    global rec_btn_archive
    global lis_btn_archive

    stopp_list = []
    for radio_id, btn_down in rec_btn_archive.items():
        if btn_down:
            if radio_id not in active_streamer_list:
                stopp_list.append(radio_id)
    for radio_id, btn_down in lis_btn_archive.items():
        if btn_down:
            if radio_id not in active_streamer_list:
                if radio_id not in stopp_list:
                    stopp_list.append(radio_id)
    return stopp_list


def renew_button_archive():
    global rec_btn_archive
    global lis_btn_archive
    rec_btn_archive.clear()
    rec_btn_archive = copy.deepcopy(ghettoApi.rec_btn_dict)
    lis_btn_archive.clear()
    lis_btn_archive = copy.deepcopy(ghettoApi.lis_btn_dict)


def read_meta_from_api(streamer_list):
    name_list = radio_names(streamer_list)
    with concurrent.futures.ThreadPoolExecutor() as executor:
        rv = list(executor.map(meta, name_list))
    return rv


def radio_names(streamer_list):
    name_list = []
    for radio_id in streamer_list:
        name_list.append(ghettoApi.radios_in_view_dict[radio_id])
    return name_list


def meta(name):
    meta_info_list = [
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
    return meta_info_list


def request_suffix_api(name):
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
