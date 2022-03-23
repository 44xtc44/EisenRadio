

class Api:
    def __init__(self):
        self.config = None

    def init_app(self, app):
        self.config = app.config

    def __repr__(self):
        return f"api.init_app({self.config})"

    def __str__(self):
        return f"Flask application factory config: {self.config}"


class GhettoApi:

    def __init__(self):
        self.lis_btn_dict = None
        self.rec_btn_dict = None
        self.radios_in_view_dict = None
        self.ghetto_radios_metadata_text = None
        self.ghetto_dict_error = None
        self.ghetto_measure_dict = None
        self.ghetto_audio_stream_dict = None
        self.ghetto_show_analyser = True
        self.local_play_suffix = None
        self.local_play_queue = None
        self.listen_active_dict = None

    def init_lis_btn_dict(self, lis_btn_dict):
        self.lis_btn_dict = lis_btn_dict

    def init_rec_btn_dict(self, rec_btn_dict):
        self.rec_btn_dict = rec_btn_dict

    """key:db id, val: radio name shown on html"""
    def init_radios_in_view(self, radios_in_view_dict):
        self.radios_in_view_dict = radios_in_view_dict

    """key:radio name, val: text from metadata"""
    def init_ghetto_radios_metadata_text(self, ghetto_radios_metadata_text):
        self.ghetto_radios_metadata_text = ghetto_radios_metadata_text

    """key:radio name, val: error"""
    def init_ghetto_dict_error(self, ghetto_dict_error):
        self.ghetto_dict_error = ghetto_dict_error

    """"show meta data"""
    def init_ghetto_measurements(self, ghetto_measure_dict):
        self.ghetto_measure_dict = ghetto_measure_dict

    """show frequency analyser, transfer buffer data for js AudioContext , ..dict[key + ',audio']"""
    def init_ghetto_audio_stream(self, ghetto_audio_stream_dict):
        self.ghetto_audio_stream_dict = ghetto_audio_stream_dict

    """set cookie to show or hide analyser, true or false"""
    def init_ghetto_show_analyser(self, ghetto_show_analyser):
        self.ghetto_show_analyser = ghetto_show_analyser

    """upload local sound to server to make byte array and get duration info (*aacp files), not working so far """
    def init_eisen_local_play_suffix(self, local_play_suffix):
        self.local_play_suffix = local_play_suffix

    """get sample rate, frequency and channel num to calculate time,some aac show no time, audio element stuck"""
    def init_eisen_local_play_queue(self, local_play_queue):
        self.local_play_queue = local_play_queue

    def init_ghetto_listen_active_dict(self, listen_active_dict):
        self.listen_active_dict = listen_active_dict


api = Api()
ghettoApi = GhettoApi()
