from os import environ
from time import sleep
from eisenradio.api import ghettoApi


def stream_audio_feed(name):
    """yield buffer, drain queue (cleanup) in ghetto_audio_stream_dict[name + ',audio'] if listen btn gets inactive
    Raise:
        HTML audio element connects earlier than buffer is prepared
    """
    while True:

        try:
            if not ghettoApi.listen_active_dict[name]:
                if not ghettoApi.ghetto_audio_stream_dict[name + ',audio'].empty():
                    ghettoApi.ghetto_audio_stream_dict[name + ',audio'].get()
                return

            if not ghettoApi.ghetto_audio_stream_dict[name + ',audio'].empty():
                yield ghettoApi.ghetto_audio_stream_dict[name + ',audio'].get()

        except KeyError:
            pass


def get_stream_content_type(name):
    """loop until return radios content type, create var {radio: content type}, route don't call def again"""
    content_type = ''
    while not content_type:

        try:
            content_type = ghettoApi.ghetto_measure_dict[name + ',suffix']
            environ[name] = content_type
        except KeyError:
            pass

        sleep(.1)
    return content_type
