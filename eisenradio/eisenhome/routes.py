from flask import Blueprint, render_template, request, flash, redirect, url_for, make_response, jsonify

import eisenradio.eisenhome.eishome as eisen_radio
from eisenradio.lib.eisdb import get_post, delete_radio, enum_radios
from eisenradio.api import ghettoApi

local_host_sound_route = "http://localhost:5050/sound/"


# Blueprint Configuration
eisenhome_bp = Blueprint(
    'eisenhome_bp', __name__,
    template_folder='bp_home_templates',
    static_folder='bp_home_static',
    static_url_path='/bp_home_static'
)


@eisenhome_bp.route('/', methods=('GET', 'POST'))
def index():
    global local_host_sound_route

    if eisen_radio.first_run_index:
        eisen_radio.check_write_protected()
    posts = enum_radios()
    eisen_radio.display_clean_titles()
    eisen_radio.index_first_run(posts)
    current_station, current_table_id = eisen_radio.curr_radio_listen()

    if request.method == 'POST':
        # print_request_values(request.form.values())
        post_request = request.form.to_dict()  # flat dict werkzeug doc
        json_post = eisen_radio.index_posts_clicked(post_request)
        if json_post:
            return json_post

    listen_last_url = ""
    if current_station:
        listen_last_url = local_host_sound_route + current_station

    return render_template('bp_home_index.html',
                           posts=posts,
                           combo_master_timer=eisen_radio.combo_master_timer,
                           status_listen_btn_dict=eisen_radio.status_listen_btn_dict,
                           status_record_btn_dict=eisen_radio.status_record_btn_dict,
                           current_station=current_station,
                           current_table_id=current_table_id,
                           # listen_last_url=eisen_radio.listen_last_url    # may not be internet - cors zeroes out
                           listen_last_url=listen_last_url)


@eisenhome_bp.route('/page_flash', methods=('GET', 'POST'))
def page_flash():
    eisen_radio.combo_master_timer = 0  # master timer recording
    eisen_radio.progress_master_percent = 0

    flash('Count down timer ended all activities. App restart recommended!', 'success')
    return render_template('bp_home_page_flash.html')


@eisenhome_bp.route('/<int:id>/delete', methods=['POST'])
def delete(id):
    if eisen_radio.status_listen_btn_dict[id] or eisen_radio.status_record_btn_dict[id]:
        flash('Radio is active. No deletion.', 'warning')
        return redirect(url_for('eisenhome_bp.index'))

    post = get_post(id)
    rv = delete_radio(id)
    if rv:
        flash('"{}" was successfully deleted!'.format(post['title']), 'success')
    if not rv:
        flash('"{}" was not deleted!'.format(post['title']), 'warning')
    return redirect(url_for('eisenhome_bp.index'))


@eisenhome_bp.route('/setcookiedark', methods=['GET', 'POST'])
def setcookiedark():
    resp = make_response("Eisenkekse sind die besten")
    resp.set_cookie('eisen-cookie', 'darkmode', max_age=60*60*24*365*2, secure=False, httponly=True)
    return resp


@eisenhome_bp.route('/getcookiedark', methods=['GET'])
def getcookiedark():
    mode = request.cookies.get('eisen-cookie', None)
    return jsonify({'darkmode': mode})


@eisenhome_bp.route('/delcookiedark', methods=['POST'])
def delcookiedark():
    resp = make_response("necesito nuevas cookies")
    resp.set_cookie('eisen-cookie', max_age=0)
    return resp


"""cookie radio station listen"""


@eisenhome_bp.route('/cookie_set_station', methods=['GET', 'POST'])
def cookie_set_station():
    resp = make_response("current radio station plays\nleave index page and return, restore info")

    post_req = request.form.to_dict()  # flat dict werkzeug doc
    try:
        current_station = post_req['station']
        current_table_id = str(post_req['station_id'])
        str_station = current_station + ',' + str(current_table_id)
        resp.set_cookie('eisen-cookie-play-station', str_station, max_age=60 * 60 * 24 * 365 * 2, secure=False,
                        httponly=True)
    except KeyError:
        # no button click evt args in java
        current_station, current_table_id = eisen_radio.curr_radio_listen()
        str_station = current_station + ',' + str(current_table_id)
        if current_station == ',':
            resp.set_cookie('eisen-cookie-play-station', max_age=0)
            return resp
        resp.set_cookie('eisen-cookie-play-station', str_station, max_age=60 * 60 * 24 * 365 * 2, secure=False,
                        httponly=True)
    return resp


@eisenhome_bp.route('/cookie_get_station', methods=['GET'])
def cookie_get_station():
    play_station = request.cookies.get('eisen-cookie-play-station', None)
    return jsonify({'play_station': play_station})


@eisenhome_bp.route('/cookie_del_station', methods=['POST'])
def cookie_del_station():
    resp = make_response("radio stations are overrated\nbye")
    resp.set_cookie('eisen-cookie-play-station', max_age=0)
    return resp


@eisenhome_bp.route('/cookie_set_streamer', methods=['GET', 'POST'])
def cookie_set_streamer():
    """streamer to permanent cache"""
    resp = make_response("set streamer")
    str_streamer = ''

    for rec_station, rec_station_id in eisen_radio.active_streamer_dict.items():
        str_streamer = str_streamer + rec_station + '=' + rec_station_id + ','

    if not str_streamer:
        str_streamer = str('empty_json')
    resp.set_cookie('eisen-cookie-streamer', str_streamer, max_age=60*60*24*365*2, secure=False, httponly=True)
    return resp


@eisenhome_bp.route('/cookie_get_streamer', methods=['GET'])
def cookie_get_streamer():
    str_streamer = request.cookies.get('eisen-cookie-streamer', None)
    return jsonify({'str_streamer': str_streamer})


@eisenhome_bp.route('/cookie_del_streamer', methods=['POST'])
def cookie_del_streamer():
    resp = make_response("bye\nbye")
    resp.set_cookie('eisen-cookie-streamer', max_age=-1)
    return resp


@eisenhome_bp.route('/cookie_set_show_visuals', methods=['GET', 'POST'])
def cookie_set_show_visuals():
    resp = make_response("disable visualisation")
    resp.set_cookie('eisen-cookie-visuals', 'show_visuals', max_age=60*60*24*365*2, secure=False, httponly=True)
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
    eisen_radio.combo_master_timer = request.form['timeRecordSelectAll']
    return eisen_radio.combo_master_timer


@eisenhome_bp.route('/index_posts_percent', methods=['POST'])
def index_posts_percent():
    return jsonify({'result': eisen_radio.progress_master_percent})


@eisenhome_bp.route('/display_info', methods=['GET'])
def display_info():
    """updateDisplay() ajax"""
    if request.method == "GET":
        id_text_dict = {}
        try:
            for radio_name, radio_text in ghettoApi.ghetto_radios_metadata_text.items():
                for radio_db_id, radio_title in ghettoApi.radios_in_view_dict.items():
                    if radio_name == radio_title:
                        if len(radio_text) > 0:
                            id_text_dict[str(radio_db_id)] = str(radio_text)

            for radio_name, radio_error in ghettoApi.ghetto_dict_error.items():
                for radio_db_id, radio_title in ghettoApi.radios_in_view_dict.items():
                    if radio_name == radio_title:
                        id_text_dict[str(radio_db_id)] = str(radio_error)
        except Exception as error:
            print(f'display_info: {error}')

        return jsonify({"result": id_text_dict})
