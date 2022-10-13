

class Api:
    """class in a 3rd party module mirrors the flask variables

    to get the variables without the (with app.app_context:) statement of flask used
    experimenting with android, which do not like(d) application factory and app_context
    default class constructor without arguments
    init vars:
    config -- flask config (default None)
    """

    def __init__(self):
        """default without args"""

        self.config = None

    def init_app(self, app):
        """flask config
        compare with os vars to see if start config db path got an accident
        trouble with testing from partial initialized functional test
        """

        self.config = app.config

    def __repr__(self):
        return f"api.init_app({self.config})"

    def __str__(self):
        return f"Flask application factory config: {self.config}"


class GhettoApi:
    """class in a 3rd party module for exposing variables to package modules to avoid circular imports

    default class constructor without arguments
    instance vars:
    lis_btn_dict -- pressed listen button (default None)
    rec_btn_dict -- pressed rec buttons (default None)
    radios_in_view_dict -- radios listed on startup on start page (default None)
    current_song_dict -- dict with 'radio_name': actual_title key, val pairs for each radio
    ghetto_dict_error -- conn errors on radio start to display on start page & interrupt thread start (default None)
    ghetto_measure_dict -- dict with 'radio,elem': txt key, val pairs of header (default None) Grec name: ghetto_measure
    ghetto_audio_stream_dict -- dict 'radio,audio': queue_data, val pairs to transfer to html audio elem (default None)
    ghetto_show_analyser -- set cookie to show spectrum analyser (default True)
    listen_active_dict -- break transfer to html audio elem if listen stops, also for thread stop (default None)
    recorder_new_title_dict -- radio writes title to dict to compare with db later (default None)
    all_blacklists_dict -- each radio: blacklist key, val (default None)
    stop_blacklist_writer -- stop event from timer (default None)
    blacklist_enabled_global -- radio looks if it should read its blacklist or not (default None)
    skipped_in_session_dict -- info to show effects of blacklisting per session (default None)
    work_port -- wsgi module calls flask app factory with real port num so all functions and js are happy (default None)

    path_ghetto_blacklist - path to ghetto_recorder blacklist json dict

    """

    def __init__(self):
        """default without args"""

        self.lis_btn_dict = None
        self.rec_btn_dict = None
        self.radios_in_view_dict = None
        self.current_song_dict = None
        self.ghetto_dict_error = None
        self.ghetto_measure_dict = None
        self.ghetto_audio_stream_dict = None
        self.ghetto_show_analyser = True
        self.listen_active_dict = None
        self.recorder_new_title_dict = None
        self.all_blacklists_dict = None
        self.stop_blacklist_writer = None
        self.blacklist_enabled_global = None
        self.skipped_in_session_dict = None
        self.work_port = None
        self.radio_active = False
        self.aac_repair_log = None
        self.path_ghetto_blacklist = None

    def init_lis_btn_dict(self, lis_btn_dict):
        """key:db id, val: 0 or 1, button down 1"""

        self.lis_btn_dict = lis_btn_dict

    def init_rec_btn_dict(self, rec_btn_dict):
        """key:db id, val: 0 or 1, button down 1"""

        self.rec_btn_dict = rec_btn_dict

    def init_radios_in_view(self, radios_in_view_dict):
        """key:db id, val: radio name shown on html"""

        self.radios_in_view_dict = radios_in_view_dict

    def init_current_song_dict(self, current_song_dict):
        """key:radio name, val: title_text from metadata"""

        self.current_song_dict = current_song_dict

    def init_ghetto_dict_error(self, ghetto_dict_error):
        """key:radio name, val: error"""

        self.ghetto_dict_error = ghetto_dict_error

    def init_ghetto_measurements(self, ghetto_measure_dict):
        """"show metadata from header and request time"""

        self.ghetto_measure_dict = ghetto_measure_dict

    def init_ghetto_audio_stream(self, ghetto_audio_stream_dict):
        """transfer queue: js audio element reads at '/sound/<radio_name>' endpoint
        dict[key + ',audio': queue.Queue object]
        """

        self.ghetto_audio_stream_dict = ghetto_audio_stream_dict

    def init_ghetto_show_analyser(self, ghetto_show_analyser):
        """set cookie to show or hide analyser, true or false"""

        self.ghetto_show_analyser = ghetto_show_analyser

    def init_ghetto_listen_active_dict(self, listen_active_dict):
        """add radio listening {classic: true}, now goa {classic: false} {goa: true}"""
        self.listen_active_dict = listen_active_dict

    def init_ghetto_recorder_new_title(self, recorder_new_title_dict):
        """radios write a title from metadata (minus remove_special_chars() in g_recorder, like copied file name)"""

        self.recorder_new_title_dict = recorder_new_title_dict

    def init_ghetto_all_blacklists_dict(self, all_blacklists_dict):
        """a dict where all radios show their blacklist, so recorder can compare title from metadata """

        self.all_blacklists_dict = all_blacklists_dict

    def init_ghetto_stop_blacklist_writer(self, stop_blacklist_writer):
        """timer set stop to kill thread loop"""

        self.stop_blacklist_writer = stop_blacklist_writer

    def init_ghetto_blacklist_enabled_global(self, blacklist_enabled_global):
        """on or off (True, False), recorder use it to copy or not copy the files"""

        self.blacklist_enabled_global = blacklist_enabled_global

    def init_ghetto_skipped_in_session_dict(self, skipped_in_session_dict):
        """radio writes skipped titles, to show in blacklist html page"""

        self.skipped_in_session_dict = skipped_in_session_dict

    def init_work_port(self, work_port):
        """port number on startup in wsgi.py or app.py: write the sound endpoint url to java"""
        self.work_port = str(work_port)

    def init_radio_active(self, radio_active):
        """return True if a thread with action string record or listen is radio-active"""
        self.radio_active = radio_active

    def init_aac_repair_log(self, aac_repair_log):
        """return True if a thread with action string record or listen is radio-active"""
        self.aac_repair_log = aac_repair_log

    def init_path_ghetto_blacklist(self, path_ghetto_blacklist):
        """ path to ghetto_recorder blacklist """
        self.path_ghetto_blacklist = path_ghetto_blacklist


class GhettoTest:
    def __init__(self):
        self.thread_killer = ()

    def init_test_thread_killer(self, thread_killer):
        """kills a single thread ("radio", "listen", "meta"), thread reads tuple and exit if match"""
        self.thread_killer = thread_killer


api = Api()
ghettoApi = GhettoApi()
ghettoTest = GhettoTest()
