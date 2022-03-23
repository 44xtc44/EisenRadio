from os import environ
from time import sleep
from eisenradio.api import ghettoApi


def stream_audio_feed(name):

    while True:

        try:
            if not ghettoApi.listen_active_dict[name]:
                return
            """grab from queue"""
            if not ghettoApi.ghetto_audio_stream_dict[name + ',audio'].empty():
                chunk = ghettoApi.ghetto_audio_stream_dict[name + ',audio'].get()
                yield chunk
        except KeyError:
            pass


def get_stream_content_type(name):
    content_type = ''
    while not content_type:

        try:
            content_type = ghettoApi.ghetto_measure_dict[name + ',suffix']
            """os variable, can resp. faster next time"""
            environ[name] = content_type
        except KeyError:
            pass

        sleep(.1)

    return content_type




