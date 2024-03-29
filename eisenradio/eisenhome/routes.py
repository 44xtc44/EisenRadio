import os
import threading
import time
from flask import Blueprint, render_template, request, flash, make_response, jsonify
from eisenradio.eisenutil import config_html
import eisenradio.eisenhome.eishome as eis_home
from eisenradio.lib.eisdb import enum_radios, get_db_connection
from ghettorecorder import ghettoApi
from eisenradio.api import eisenApi
import ghettorecorder.ghetto_recorder as ghetto

# Blueprint Configuration
eisenhome_bp = Blueprint(
    'eisenhome_bp', __name__,
    template_folder='bp_home_templates',
    static_folder='bp_home_static',
    static_url_path='/bp_home_static'
)


@eisenhome_bp.route('/', methods=('GET', 'POST'))
def index():
    """draws start page

    dump db and run eis_home.index_first_run() to prepare app, fill dicts, start daemons
    collect vars for jinja to draw start page from template

    POST: js sends post with button click event listener, / index endpoint return json dict to js
    return: vars for looping over the html elements and provide names of radios, button color, title for console

    * posts - db dump
    * combo_master_timer - actual timer value call eis_home.combo_master_timer (default 0)
    * status_listen_btn_dict - whole dict eis_home.status_listen_btn_dict to set button colors if pressed (default 0)
    * status_record_btn_dict - whole dict eis_home.status_record_btn_dict to set button colors if pressed (default 0)
    * current_station - write name of listened station to console if any (default None)
    * current_table_id - table id of listened station (default None)
    * listen_last_url - feed the audio element with url after page refresh (default None)
    """
    local_host_sound_route = "http://localhost:" + str(eisenApi.work_port) + "/sound/"
    listen_last_url = ""

    posts = enum_radios()
    eis_home.index_first_run(posts)
    # first call returns None
    current_station, current_table_id = eis_home.curr_radio_listen()

    if request.method == 'POST':
        # print_request_values(request.form.values())
        post_request = request.form.to_dict()  # flat dict werkzeug doc
        # $("button").click(function () {}, ajax /  TODO ret must be split into multiple fun calls
        json_post = eis_home.index_posts_clicked(post_request)
        # returns False on error to deactivate buttons for newly created radios, app restart required
        if json_post:
            return json_post

    # for page reload, connect to last sound endpoint again
    if current_station:
        listen_last_url = local_host_sound_route + current_station

    [print(row[0], row[2]) for row in posts if row["id"]]

    return render_template('bp_home_index.html',
                           posts=posts,
                           combo_master_timer=eis_home.combo_master_timer,
                           status_listen_btn_dict=eis_home.status_listen_btn_dict,
                           status_record_btn_dict=eis_home.status_record_btn_dict,
                           current_station=current_station,
                           current_table_id=current_table_id,
                           listen_last_url=listen_last_url)


@eisenhome_bp.route('/enable_sound_endpoint', methods=['POST'])
def enable_sound_endpoint():
    """Get radio id.
    Disable/Enable endpoint and return URL with port num for JS audio element.
    """
    table_id = request.form['radioNum']
    radio_name = request.form['radioName']
    end_points = [radio for radio in ghettoApi.listen_active_dict.keys()]
    for radio in end_points:
        ghettoApi.listen_active_dict[radio] = False  # all sound endpoints stop yielding audio data, pretty or not
    time.sleep(1)
    [print(thread.name) for thread in threading.enumerate()]

    eis_home.status_listen_btn_dict[table_id] = 1  # register listen
    eis_home.dispatch_master(int(table_id), 'Listen', 1)  # enable via "normal" key press ON
    endpoint = "http://localhost:" + str(eisenApi.work_port) + "/sound/" + radio_name
    return jsonify({"newAudioSource": endpoint})


@eisenhome_bp.route('/enable_recorder', methods=['POST'])
def enable_recorder():
    """Big mess so far. Must go GhettoRecorder 3 to get rid of the buttons.
    V3 simply start, stop feeding a queue itself and is easy to kill.

    Problem (have solution)
    App had a record and a listen button. Dictionaries keep track of the up/down status of the buttons.
    dispatch_record_btn() writes multiple dicts and starts recorder threads.
    ghettoApi.listen_active_dict is there, but I forgot a ghettoApi.record_active_dict! :)

    eis_home.status_listen_btn_dict = {}  # {15: 1 } {"table_id 15": "pressed down"}
    eis_home.status_record_btn_dict = {} PLUS eis_home.active_streamer_dict[radio_name] = str(table_id)

    Solution for this version
    eis_home.status_listen_btn_dict; must be cleaned and written in enable_sound_endpoint()
    eis_home.status_record_btn_dict; enable_recorder()
    eis_home.active_streamer_dic; enable_recorder()

    Get radio id.
    Run recorder if it is not already running.
    """
    table_id = request.form['radioNum']
    radio_name = request.form['radioName']
    json_str = "No Data Yet, use pull interval eis_home.active_streamer_dict"
    if radio_name in eis_home.active_streamer_dict.keys():
        json_str = "recorder runs already " + radio_name
        return jsonify({"activeRecorderNameId": json_str})

    eis_home.active_streamer_dict[radio_name] = str(table_id)  # register name id
    eis_home.status_record_btn_dict[table_id] = 1  # record button pressed
    eis_home.dispatch_master(int(table_id), 'Record', 1)
    time.sleep(1)
    [print(thread.name) for thread in threading.enumerate()]
    return jsonify({"activeRecorderNameId": json_str})


@eisenhome_bp.route('/disable_recorder', methods=['POST'])
def disable_recorder():
    """ Revert settings of enable_recorder().

    Make sure the recorder thread is offline. radio_pan_america PB all others ok
    """
    table_id = request.form['id']
    radio_name = request.form['name']
    ghetto.GRecorder.record_active_dict[radio_name] = False
    if radio_name in eis_home.active_streamer_dict.keys():
        del eis_home.active_streamer_dict[radio_name]
    eis_home.status_record_btn_dict[table_id] = 0
    return jsonify({"disabledRecorder": radio_name + " " + table_id})  # need a return action


@eisenhome_bp.route('/degrade_animation_level_get', methods=['GET'])
def degrade_animation_level_get():
    """ return the animation level status for CPU utilisation from db, high is 1, low is 0,
    also called on js onLoad to fill the animationsAllowedDict
    db return value is a sql row object, one must choose the column
    jsonify first key is name of the caller function in js to separate (follow) ajax return values better
    """
    row_html_cpu = 8
    conn = get_db_connection()
    on = conn.execute('SELECT browser_open FROM eisen_intern WHERE id =' + str(row_html_cpu) + ';').fetchone()
    conn.close()
    cpu_utilization = "high" if on[0] else "low"
    return jsonify({"degradeAnimationsWriteDict": cpu_utilization})


@eisenhome_bp.route('/degrade_animation_level_set', methods=['GET'])
def degrade_animation_level_set():
    """ degrade_animation_level_set() and degrade_animation_level_get() called on radio button change to
    write the js animationsAllowedDict new, so animation can see if run is allowed

    | write the animation level status for CPU to db, high is 1 (default in db), low is 0
    | We can only use 1 and 0 values since db writer uses on/off style, default is 1.

    | config_html.tools_feature_settings_get_rows() compares actual rows number in db with rows hardcoded as a list
    | it calls tools_feature_settings_create_default(feature_without_row) to create the rows with default value
    | config_html.tools_feature_settings_get_rows is called on startup to write new rows if version upgrade of package
    | database row 8 for html_cpu
    """
    on = 1
    off = 0
    row_html_cpu = 8
    conn = get_db_connection()
    status = conn.execute('SELECT browser_open FROM eisen_intern WHERE id =' + str(row_html_cpu) + ';').fetchone()
    conn.close()
    toggle = off if status[0] else on
    config_html.tools_feature_toggle_show_html_config(toggle, row_html_cpu)
    return jsonify({"degradeAnimationsSet": "required response"})


@eisenhome_bp.route('/tools_radio_config_get', methods=['GET'])
def tools_radio_config_get():
    """ return a dictionary with HTML settings, tell the js how to style the app: style, animations;

    config_html.tools_feature_settings_get_rows() has all rows hardcoded as a list
    """
    row_db_html_animation = 3
    row_db_html_style = 4
    row_db_html_front_pigs = 5
    row_db_html_balloon = 6
    row_db_html_speaker = 7
    row_db_html_cpu = 8

    row_list = [
        row_db_html_animation,
        row_db_html_style,
        row_db_html_front_pigs,
        row_db_html_balloon,
        row_db_html_speaker,
        row_db_html_cpu,
    ]
    feature_list = [
        "checkboxConfigAnimation",
        "checkboxConfigStyle",
        "checkboxConfigFrontPigs",
        "checkboxConfigBalloon",
        "checkboxConfigFlatSpeaker",
        "cpuUtilisation",
    ]
    check_box_status_list = list(map(lambda row: config_html.tools_feature_on_off_state_in_db(row), row_list))
    feature_checked_tuple = zip(feature_list, check_box_status_list)
    settings_dict = {feature: checked for feature, checked in feature_checked_tuple}

    return jsonify({"configEisenradioHtmlSetting": settings_dict})


@eisenhome_bp.route('/page_flash', methods=('GET', 'POST'))
def page_flash():
    """reset timer vars, return flash info on info page"""
    eis_home.combo_master_timer = 0  # master timer recording
    eis_home.progress_master_percent = 0

    flash('Count down timer ended all activities. App restart recommended!', 'success')
    return render_template('bp_home_page_flash.html')


@eisenhome_bp.route('/cookie_set_dark', methods=['GET'])
def cookie_set_dark():
    """darkmode cookie

    secure=False for http and https
    localhost is an inner Network of the computer used by Eisenradio server and browser, therefore a save place
    secure=True without external signed ssl certs will NOT rise security nor let disappear dev console errors in IEx
    """
    resp = make_response("Eisenkekse sind die besten")
    resp.set_cookie(
        'eisen-cookie',
        'darkmode',
        max_age=60 * 60 * 24 * 365 * 2,
        httponly=True,
        secure=False,
        samesite='Strict'
    )
    return resp


@eisenhome_bp.route('/cookie_get_dark', methods=['GET'])
def cookie_get_dark():
    """Return dark mode set or not."""
    mode = request.cookies.get('eisen-cookie', None)
    return jsonify({"darkmode": mode})


@eisenhome_bp.route('/cookie_del_dark', methods=['GET'])
def cookie_del_dark():
    resp = make_response("necesito nuevas cookies")
    resp.set_cookie('eisen-cookie', max_age=0, samesite='Strict')
    return resp


@eisenhome_bp.route('/streamer_get', methods=['GET'])
def streamer_get():
    """return json dict of all active streams rec;

    populate dropdown in console after page refresh
    empty dict if no streamer, else send name and db table id
    """
    streamer_dict = {}
    if len(eis_home.active_streamer_dict) > 0:
        for rec_station, rec_station_id in eis_home.active_streamer_dict.items():
            streamer_dict[rec_station] = rec_station_id
    return jsonify({'streamerGet': streamer_dict})


@eisenhome_bp.route('/index_posts_combo', methods=['POST'])
def index_posts_combo():
    """set hours for timer, return read val for test"""
    eis_home.combo_master_timer = request.form['timeRecordSelectAll']
    return eis_home.combo_master_timer


@eisenhome_bp.route('/index_posts_percent', methods=['GET'])
def index_posts_percent():
    """return percent of timer to js"""
    return jsonify({'result': eis_home.progress_master_percent, "timer": eis_home.combo_master_timer})


@eisenhome_bp.route('/svg_symbol_get', methods=['GET'])
def svg_symbol_get():
    """
    """
    svg_symbol = "svgImagesSymbol.svg"
    this_module_dir = os.path.dirname(__file__)
    symbol_folder = os.path.join(this_module_dir, "bp_home_static", "images", svg_symbol)
    with open(symbol_folder, "rb") as reader:
        svg_content = reader.read()
    return svg_content
