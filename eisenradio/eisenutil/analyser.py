from eisenradio.api import ghettoApi
from eisenradio.eisenutil import measure

"""Audio analyser, visualiser info from stream get, convert, transfer to browser """


def analyser_entry(table_id):
    media_chunk = '-empty-'
    content_type = '-empty-'
    active_radios_list = measure.active_buttons()

    if int(table_id) in active_radios_list:
        name = ghettoApi.radios_in_view_dict[int(table_id)]
        content_type = header_content_type(name)
        # mp3_suffix = content_type_to_suffix(name)
        media_chunk = request_fifo_queue_api(name)
    return media_chunk, content_type


def content_type_to_suffix(a_name):
    suffix = None
    try:
        suffix = measure.request_suffix_api(a_name)
    except KeyError:
        pass
    return suffix


def header_content_type(a_name):
    rv = '-empty-'
    try:
        rv = ghettoApi.ghetto_measure_dict[a_name + ',suffix']
    except KeyError:
        pass
    return rv


def request_fifo_queue_api(name):
    chunk = b''
    try:
        # a fifo queue.Queue inside, grab from stream, range to prevent accident
        for i in range(100):
            if ghettoApi.ghetto_analyser_dict[name + ',analyser'].empty():
                break
            chunk = chunk + ghettoApi.ghetto_analyser_dict[name + ',analyser'].get()
    except KeyError:
        return False
    return chunk
