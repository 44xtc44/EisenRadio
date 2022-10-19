from flask import Blueprint, render_template, request, flash, redirect, url_for, make_response, jsonify

import eisenradio.eisenhome.eishome as eis_home
from eisenradio.lib.eisdb import get_post, delete_radio, enum_radios, get_db_connection
from eisenradio.eisenutil import config_html
from ghettorecorder import ghettoApi

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
    local_host_sound_route = "http://localhost:" + ghettoApi.work_port + "/sound/"
    listen_last_url = ""

    posts = enum_radios()
    eis_home.index_first_run(posts)
    # first call returns None
    current_station, current_table_id = eis_home.curr_radio_listen()

    if request.method == 'POST':
        # print_request_values(request.form.values())
        post_request = request.form.to_dict()  # flat dict werkzeug doc
        # $("button").click(function () {}, ajax /
        json_post = eis_home.index_posts_clicked(post_request)
        # returns False on error to deactivate buttons for newly created radios, app restart required
        if json_post:
            return json_post

    # for page reload, connect to last sound endpoint again
    if current_station:
        listen_last_url = local_host_sound_route + current_station

    return render_template('bp_home_index.html',
                           posts=posts,

                           combo_master_timer=eis_home.combo_master_timer,
                           status_listen_btn_dict=eis_home.status_listen_btn_dict,
                           status_record_btn_dict=eis_home.status_record_btn_dict,
                           current_station=current_station,
                           current_table_id=current_table_id,
                           listen_last_url=listen_last_url)


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


@eisenhome_bp.route('/degrade_animation_level_set', methods=['POST'])
def degrade_animation_level_set():
    """ degrade_animation_level_set() and degrade_animation_level_get() called on radio button change to
    write the js animationsAllowedDict new, so animation can see if run is allowed

    write the animation level status for CPU to db, high is 1 (default in db), low is 0
    ---> can only use 1 and 0 values since db writer uses on/off style, default is 1
    config_html.tools_feature_settings_get_rows() compares actual rows number in db with rows hardcoded as a list
        it calls tools_feature_settings_create_default(feature_without_row) to create the rows with default value
    config_html.tools_feature_settings_get_rows is called on startup to write new rows if version upgrade of package
    database row 8 for html_cpu
    """
    on = 1
    off = 0
    row_html_cpu = 8
    conn = get_db_connection()
    status = conn.execute('SELECT browser_open FROM eisen_intern WHERE id =' + str(row_html_cpu) + ';').fetchone()
    conn.close()
    toggle = off if status[0] else on
    config_html.tools_feature_toggle_show_html_config(toggle, row_html_cpu)
    return jsonify({"degradeAnimationsSet": "Elvis lebt!"})


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


@eisenhome_bp.route('/<int:id>/delete', methods=['POST'])
def delete(id):
    """delete a radio only if it is not active, return a flash of ok or not, redirect to start page"""
    if eis_home.status_listen_btn_dict[id] or eis_home.status_record_btn_dict[id]:
        flash('Radio is active. No deletion.', 'warning')
        return redirect(url_for('eisenhome_bp.index'))

    post = get_post(id)
    rv = delete_radio(id)
    if rv:
        flash('"{}" was successfully deleted!'.format(post['title']), 'success')
    if not rv:
        flash('"{}" was not deleted!'.format(post['title']), 'warning')
    return redirect(url_for('eisenhome_bp.index'))


@eisenhome_bp.route('/cookie_set_dark', methods=['GET', 'POST'])
def cookie_set_dark():
    """darkmode cookie

    secure=False for http and https
    localhost is an inner Network of the computer used by Eisenradio server and browser, therefore a save place
    secure=True without external signed ssl certs will NOT rise security nor let disappear dev console errors in IEx
    """
    resp = make_response("Eisenkekse sind die besten")
    resp.set_cookie('eisen-cookie', 'darkmode', max_age=60 * 60 * 24 * 365 * 2, secure=False, httponly=True)
    return resp


@eisenhome_bp.route('/cookie_get_dark', methods=['GET'])
def cookie_get_dark():
    """return color style of startpage AND id of listener button if any"""
    listener_id = None
    for radio, listening in ghettoApi.listen_active_dict.items():
        if listening:
            for r_id, name in ghettoApi.radios_in_view_dict.items():
                if name == radio:
                    listener_id = r_id
                    break
    mode = request.cookies.get('eisen-cookie', None)
    return jsonify({"darkmode": mode,
                    "listenerId": listener_id
                    })


@eisenhome_bp.route('/cookie_del_dark', methods=['POST'])
def cookie_del_dark():
    resp = make_response("necesito nuevas cookies")
    resp.set_cookie('eisen-cookie', max_age=0)
    return resp


@eisenhome_bp.route('/station_get', methods=['GET'])
def station_get():
    """return json dict {radio: id}

    curr_radio_listen() get button down name and id
    rebuild console after page refresh
    empty dict if no listen, else send name and db table id
    """
    listen_dict = {}
    current_station, current_table_id = eis_home.curr_radio_listen()
    if len(current_station) > 0:
        listen_dict[current_station] = current_table_id
    return jsonify({'stationGet': listen_dict})


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


@eisenhome_bp.route('/cookie_set_show_visuals', methods=['GET', 'POST'])
def cookie_set_show_visuals():
    """spectrum analyser cookie

    standard cookie
    """
    resp = make_response("disable visualisation")
    resp.set_cookie('eisen-cookie-visuals', 'show_visuals', max_age=60 * 60 * 24 * 365 * 2, secure=False, httponly=True)
    ghettoApi.init_ghetto_show_analyser(False)
    return resp


@eisenhome_bp.route('/cookie_get_show_visuals', methods=['GET'])
def cookie_get_show_visuals():
    rv = request.cookies.get('eisen-cookie-visuals', None)

    if rv == 'show_visuals':
        return jsonify({'str_visuals': 'show_visuals'})
    if not rv:
        return jsonify({'str_visuals': '-empty-'})


@eisenhome_bp.route('/cookie_del_show_visuals', methods=['POST'])
def cookie_del_show_visuals():
    resp = make_response("bye\neisen-cookie-visuals")
    resp.set_cookie('eisen-cookie-visuals', max_age=-1)
    ghettoApi.init_ghetto_show_analyser(True)
    return resp


@eisenhome_bp.route('/index_posts_combo', methods=['POST'])
def index_posts_combo():
    """set hours for timer, return read val for test"""
    eis_home.combo_master_timer = request.form['timeRecordSelectAll']
    return eis_home.combo_master_timer


@eisenhome_bp.route('/index_posts_percent', methods=['GET'])
def index_posts_percent():
    """return percent of timer to js"""
    return jsonify({'result': eis_home.progress_master_percent})


@eisenhome_bp.route('/display_info', methods=['GET'])
def display_info():
    """return a dict with radio {id: message},

    message is either the currently played title in the radio or an error message
    JS writes message to html element with radio id
    updateDisplay() ajax call
    """
    if request.method == "GET":
        id_text_dict = {}
        try:
            for radio_name, radio_text in ghettoApi.current_song_dict.items():
                for radio_db_id, radio_title in ghettoApi.radios_in_view_dict.items():
                    if radio_name == radio_title:
                        if len(radio_text) > 0:
                            id_text_dict[str(radio_db_id)] = str(radio_text)

            for radio_name, radio_error in ghettoApi.ghetto_dict_error.items():
                for radio_db_id, radio_title in ghettoApi.radios_in_view_dict.items():
                    if radio_name == radio_title:
                        id_text_dict[str(radio_db_id)] = str(radio_error)
        except Exception as error:
            print(f'display_info(): {error}')

        return jsonify({"updateDisplay": id_text_dict})


@eisenhome_bp.route('/all_radio_table_ids_and_names_get', methods=['GET'])
def all_radio_table_ids_and_names_get():
    """returns a dict with all radio {id: name, id2: name2},

    build js style instance for each radio
    """
    return jsonify({"eisenRadioCreateStyleInstances": ghettoApi.radios_in_view_dict})
