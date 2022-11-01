from ghettorecorder import ghettoApi


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


class GhettoTest:
    def __init__(self):
        self.thread_killer = ()

    def init_test_thread_killer(self, thread_killer):
        """kills a single thread ("radio", "listen", "meta"), thread reads tuple and exit if match"""
        self.thread_killer = thread_killer


class EisenApi:
    """ attributes and methods only needed for eisenradio
    todo:
        refactor GhettoApi of GhettoRecorder package to transfer all those attributes to here
    """
    def __init__(self):
        """ init
        Attributes:
                radio_id_dict, {radio1: 1, radio2: 2} radio name to db table id mapping (from {id: name})
                skipped_record_eisen_dict, {radio1: 2} compare list len of Ghetto skipped_in_session_dict with counter
                call_skipped_record_eisen_dict, endpoint call before get_skipped_record()
        """
        self.radio_id_dict = {}
        self.call_radio_id_dict = True
        self.skipped_record_eisen_dict = {}
        self.call_skipped_record_eisen_dict = True

    def init_radio_id_dict(self):
        if self.call_radio_id_dict:
            self.radio_id_dict = {name: table_id for table_id, name in ghettoApi.radios_in_view_dict.items()}
            self.call_radio_id_dict = False

    def init_skipped_record_eisen_dict(self):
        """ get radio key name from GhettoApi all_blacklists_dict {radio1: [], radio2: []} ([] is title skip list)
        set key value to zero to see if GhettoApi skipped_in_session_dict was updated later
        only called once
        """
        if self.call_skipped_record_eisen_dict:
            self.skipped_record_eisen_dict = {radio: 0 for radio in ghettoApi.all_blacklists_dict.keys()}
            self.call_skipped_record_eisen_dict = False

    def get_skipped_record(self, radio_name):
        """ return True if a title was skipped since last request, False if not
        check EisenApi skipped_record_eisen_dict radio:count lower than in length of GhettoApi skipped_in_session_dict
        update skipped_record_eisen_dict[radio_name] to new length of ghettoApi.skipped_in_session_dict[radio_name] list
        """
        if not len(ghettoApi.skipped_in_session_dict):
            return False
        if radio_name not in ghettoApi.skipped_in_session_dict.keys():
            return False

        if self.skipped_record_eisen_dict[radio_name] < len(ghettoApi.skipped_in_session_dict[radio_name]):
            self.skipped_record_eisen_dict[radio_name] = len(ghettoApi.skipped_in_session_dict[radio_name])
            return True
        else:
            return False


api = Api()
ghettoTest = GhettoTest()
eisenApi = EisenApi()
