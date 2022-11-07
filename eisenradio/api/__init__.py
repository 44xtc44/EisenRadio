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


class EisenTest:
    def __init__(self):
        self.thread_killer = ()

    def init_test_thread_killer(self, thread_killer):
        """kills a single thread ("radio", "listen", "meta"), thread reads tuple and exit if match"""
        self.thread_killer = thread_killer


class EisenApi:
    """ EisenRadio is a frontend and runs on top of GhettoRecorder
    attributes needed only for eisenradio modules, some api modules connect to GhettoApi

    """

    def __init__(self):
        """ init

        Attributes:
           radio_id_name_dict . {starRadio: 1, planetRadio: 2} radio name to db table id mapping (from {id: name})
           radio_name_id_dict . radios listed on startpage, key:db id, val: radio name shown on html
           skipped_record_eisen_dict . {radio1: 2} compare list len of Ghetto skipped_in_session_dict with counter
           call_skipped_record_eisen_dict . endpoint call before get_skipped_record()
           lis_btn_dict . listen, radio get on/off entry for radio table id
           rec_btn_dict . record, radio get on/off entry for radio table id
           show_analyser . cookie for analyser, can have db entry but want cookie to show howto
           work_port . wsgi port number, for functions in java to connect to correct endpoint
           radio_active . shows if a thread is connected to the internet, green light in console
        """
        self.radio_id_name_dict = {}
        self.radio_name_id_dict = {}
        self.call_radio_id_name_dict = True
        self.skipped_record_eisen_dict = {}
        self.call_skipped_record_eisen_dict = True
        self.lis_btn_dict = {}
        self.rec_btn_dict = {}
        self.show_analyser = True
        self.work_port = None
        self.radio_active = False

    def init_radio_id_name_dict(self):
        """ key is radio_id: val is name radio_id_name_dict {table_id: name},
        radio_name_id_dict {name: table_id}
        todo change names to better reflect purpose, radio_id_name_dict, radio_name_id_dict
        """
        if self.call_radio_id_name_dict:
            self.radio_id_name_dict = {name: table_id for table_id, name in self.radio_name_id_dict.items()}
            self.call_radio_id_name_dict = False

    def init_radio_name_id_dict(self, radio_name_id_dict):
        """ key:db id, val: radio name shown on html """
        self.radio_name_id_dict = radio_name_id_dict

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

    def init_lis_btn_dict(self, lis_btn_dict):
        """ key:db id, val: 0 or 1, button down 1 """
        self.lis_btn_dict = lis_btn_dict

    def init_rec_btn_dict(self, rec_btn_dict):
        """ key:db id, val: 0 or 1, button down 1 """
        self.rec_btn_dict = rec_btn_dict

    def init_show_analyser(self, show_analyser):
        """ set cookie to show or hide spectrum analyser, true or false """
        self.show_analyser = show_analyser

    def init_work_port(self, work_port):
        """ port number on startup in wsgi.py or app.py: write the sound endpoint url to java """
        self.work_port = work_port

    def init_radio_active(self, radio_active):
        """ return True if a thread with action string record or listen is connected to the internet """
        self.radio_active = radio_active


api = Api()
eisenTest = EisenTest()
eisenApi = EisenApi()
