from ghettorecorder import ghettoApi
from eisenradio.api import eisenApi


def header_data_read(name):
    """ Return header info data for the arg id.
    """
    return request_header_info(name)


def request_header_info(name):
    """ Return a list with collected response header strings if available. """
    info_dct = {
        "request_time": request_time_api(name),
        "request_suffix": request_suffix_api(name),
        "request_icy_genre": request_icy_genre_api(name),
        "request_icy_name": request_icy_name_api(name),
        "request_icy_view": request_icy_view_id_api(name),
        "request_icy_br": request_icy_br_api(name),
        "request_icy_url": request_icy_url_api(name),
        "current_song": request_current_song_api(name),
    }
    return info_dct


def request_suffix_api(name):
    """ Return the content type resolved to file suffix string. """
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
        for key, val in eisenApi.radio_id_name_dict.items():
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


def request_current_song_api(name):
    rv = '---'
    try:
        rv = ghettoApi.current_song_dict[name]
    except KeyError:
        pass
    return str(rv)
