import os
import threading
from time import sleep
from flask import jsonify, request, flash, redirect, url_for

from eisenradio.eisenhome import watchdog
from eisenradio.eisenutil import monitor_records, config_html
from eisenradio.lib.eisdb import get_db_connection, status_read_status_set, get_download_dir
from eisenradio.api import eisenApi
from ghettorecorder import ghettoApi
import ghettorecorder.ghetto_recorder as ghetto

first_run_index = True
first_run_audio_activated = False

status_listen_btn_dict = {}  # {table id 15: 1 } on
status_record_btn_dict = {}
radio_id_name_dict = {}
eisenApi.init_lis_btn_dict(status_listen_btn_dict)
eisenApi.init_rec_btn_dict(status_record_btn_dict)
eisenApi.init_radio_id_name_dict(radio_id_name_dict)
stop_blacklist_writer = False
ghettoApi.init_ghetto_stop_blacklist_writer(stop_blacklist_writer)
# the drop-down dialog of active recorder in console to jump to the recorder stations
active_streamer_dict = {}

last_btn_id_global = None  # current button pressed, or btn predecessor
combo_master_timer = 0
progress_master_percent = 0


def index_first_run(posts):
    """startup

    :params: posts: dump of table posts
    """
    global first_run_index
    if first_run_index:
        first_run_index = False
        check_write_protected()
        start_progress_timer_daemon()
        monitor_records.start_blacklist_writer_daemon()
        watchdog.start_watchdog_daemon()

        feed_status_btn_dicts(posts)
        feed_radio_id_name_dict(posts)
        config_html.tools_feature_settings_get_rows()


def feed_status_btn_dicts(posts):
    """reset all button tracker dicts to zero {table_id: button off}

    :params: posts: db dump of table posts
    """
    for row in posts:
        # init btn not pressed
        status_listen_btn_dict[row['id']] = 0
        status_record_btn_dict[row['id']] = 0


def clear_listen_btn_dict():
    """"""


def clear_record_btn_dict():
    """"""


def feed_radio_id_name_dict(posts):
    """dict for resolving {id: radio_name} without open db connection everytime

    :params: posts: db dump of table posts
    """
    for row in posts:
        # api
        radio_id_name_dict[row['id']] = status_read_status_set(False, 'posts', 'title', row['id'])


def curr_radio_listen():
    """active radio todo remove

    :returns: tuple of two, active listening radio id and name for page refresh
    """
    current_station, current_id = "", ""
    # for table_id, btn_down in status_listen_btn_dict.items():
    #     if btn_down:
    #         current_station = radio_id_name_dict[table_id]
    #         current_id = table_id
    #         break
    return current_station, current_id


def index_posts_clicked(post_request):
    """if rec return index_posts_record(),

    if listen return index_posts_clicked_already or return index_posts_clicked_new()
    first separation of action flow for rec and listen
    return False, deactivate btn of a newly created radio to introduce no source of error
    simplify reading, got either clicked new or already clicked listen btn
    """
    table_id = post_request['table_id']
    action = post_request['action']
    message = 'app restart required to use a new radio'

    if action == 'Record':
        if int(table_id) not in status_record_btn_dict.keys():
            print(message)
            return False

        return index_posts_record(table_id)

    if action == 'Listen':
        if int(table_id) not in status_listen_btn_dict.keys():
            print(message)
            return False

        radio_name = status_read_status_set(False, 'posts', 'title', table_id)
        if status_listen_btn_dict[int(table_id)]:  # 1, hello auto clicker; or on/off press
            return index_posts_clicked_already(table_id, radio_name)
        else:
            return index_posts_clicked_new(table_id, radio_name)


def index_posts_clicked_new(table_id, radio_name):
    """set global var last_btn_id_global, activate js auto clicker, announce sound endpoint for radio name

    | fresh listen button press
    | activate auto clicker to reset abandoned btn status (color)
    | JavaScript module gets sound endpoint url with current port number for html audio element
    | vars
    | 'sound_endpoint': "http://localhost:" + eisenApi.work_port + "/sound/"  - js audio connect to port number url
    """
    global last_btn_id_global

    status_listen_btn_dict[int(table_id)] = 1  # button down
    dispatch_master(int(table_id), 'Listen', 1)

    # last_btn_id_global init None, first radio not trigger click
    btn_to_switch = last_btn_id_global  # feed js auto clicker
    button_id = 'Listen_' + btn_to_switch if btn_to_switch is not None else None

    last_btn_id_global = table_id
    return jsonify(
        {'result': 'activate_audio',
         'button_to_switch': button_id,
         'radio_name': radio_name,
         'radio_id': table_id,
         'sound_endpoint': "http://localhost:" + str(eisenApi.work_port) + "/sound/"
         })


def index_posts_clicked_already(table_id, radio_name):
    """if js auto clicker send table_id for radio;
    if self pressed on/off, fill global var last_btn_id_global and deactivate audio --> better store it in api

    This thing here is about pressed LISTEN buttons.
    If listen button pressed, java auto clicker event is possible and change the button type (color).
    Auto clicker launches the whole event $("button").click(function () {} from $(document).ready(function () {
    AFTER the original button was pressed.
    Two scenarios for a 1 in status_listen_btn_dict[int(table_id)]:
    1) auto clicker
    2) same listen button was pressed on/off (twice)

    autoclicker vars
    'autoClicker': table_id
    self pressed btn vars
    'result': 'deactivate_audio',
    'radio_name': radio_name,
    'radio_id': "noId"         // tell all functions there is no listener active,
    'last_listen_id': table_id // but the style function must run to create a (minimal) record style, if active
    """
    global last_btn_id_global

    status_listen_btn_dict[int(table_id)] = 0
    dispatch_master(int(table_id), 'Listen', 0)
    # to make it clear 'button_to_switch' auto clicker var from index_posts_clicked_new is for NEW btn down evt
    if not last_btn_id_global == table_id:  # js press abandoned btn, not the same btn id, call style funct to reset var
        return jsonify({'autoClicker': table_id})    # to enable only minimal display if record in on
    else:
        last_btn_id_global = None  # same id, twice pressed, reset var
        return jsonify(
            {'result': 'deactivate_audio',
             'radio_name': radio_name,
             'radio_id': "noId",
             'last_listen_id': table_id
             })


def index_posts_record(table_id):
    """ call dispatch_master( id record on/off)
     | return names and table ids of all streamer to js
     | and id of current activated/deactivated rec
     | make a combo box with anchor to jump to the rec radio from console
     | vars
     | 'streamer': json_streamer - write name to the stream watcher drop-down dialog in console
    """
    conn = get_db_connection()
    radio_name = status_read_status_set(False, 'posts', 'title', table_id)
    conn.close()

    if status_record_btn_dict[int(table_id)]:
        del active_streamer_dict[radio_name]
        status_record_btn_dict[int(table_id)] = 0
        dispatch_master(int(table_id), 'Record', 0)
    else:
        active_streamer_dict[radio_name] = str(table_id)
        status_record_btn_dict[int(table_id)] = 1
        dispatch_master(int(table_id), 'Record', 1)

    # make combo box with anchor jumper from active_streamer_dict
    json_streamer = ''
    for streamer_name, streamer_id in active_streamer_dict.items():
        json_streamer = json_streamer + str(streamer_name) + '=' + str(streamer_id) + ','
    if not json_streamer:
        json_streamer = str('empty_json')

    return jsonify({'streamer': json_streamer, 'streamerId': table_id})


def query_radio_url(table_id):
    """return streaming url of radio"""
    radio_url = status_read_status_set(False, 'posts', 'content', table_id)
    return radio_url


def set_radio_path(table_id):
    """overwrite default path of ghetto_recorder.GBase.radio_base_dir with
    parent download_path
    create child dir with radio name

    GhettoRecorder stores streams by default under the current directory of settings.ini
    """
    parent_dir = status_read_status_set(False, 'posts', 'download_path', table_id)
    radio_name = status_read_status_set(False, 'posts', 'title', table_id)
    ghetto.GBase.radio_base_dir = parent_dir
    child_dir = os.path.join(parent_dir, radio_name)
    ghetto.GBase.make_directory(child_dir)


def dispatch_master(table_id, button, btn_status):
    """divide action for listen and rec, returns nothing

    prepare writing to dicts with radio name as key
    btn_status is 0 or 1, off or on
    """
    set_radio_path(table_id)
    radio_name = status_read_status_set(False, 'posts', 'title', table_id)

    if button == 'Listen':
        dispatch_listen_btn(radio_name, table_id, btn_status)

    if button == 'Record':
        dispatch_record_btn(radio_name, table_id, btn_status)


def dispatch_listen_btn(radio_name, table_id, lis_btn_pressed):
    """calls dispatch_record_start() if btn pressed, del from active dict if btn released, returns nothing

    write into listen activ dict if listen btn down or not
    tells the recorder dispatcher to start threads with listen action string
    """
    if lis_btn_pressed:
        ghetto.GRecorder.listen_active_dict[radio_name] = True
        # if status_record_btn_dict[table_id] == 0:  # rec btn not pressed
        #     ghetto.GRecorder.record_active_dict[radio_name] = False  # rec not active
        dispatch_record_start(table_id, 'listen')

    if not lis_btn_pressed:
        ghetto.GRecorder.listen_active_dict[radio_name] = False


def dispatch_record_btn(radio_name, table_id, rec_btn_pressed):
    """calls dispatch_record_start() if btn pressed, del from active dict if btn released, returns nothing

    write into record_active_dict if radio shall be active rec or not
    check if listen btn is down and writes status to listen active dict
    recorder dispatcher shall start threads with record action string
    """
    if rec_btn_pressed:
        ghetto.GRecorder.record_active_dict[radio_name] = True
        # if not status_listen_btn_dict[table_id]:  # listen btn not pressed
        #     ghetto.GRecorder.listen_active_dict[radio_name] = False

        dispatch_record_start(table_id, 'record')

    if not rec_btn_pressed:
        ghetto.GRecorder.record_active_dict[radio_name] = False  # rec thread stops, parameter action 'record'


def dispatch_record_start(table_id, action):
    """call dispatch_record_is_alive(), if alive check is playlist & start radio else write error dict, returns nothing

    test if server is alive, writes dict_error entry if url had failed
    if target server address is a playlist url m3u or pls,
    must read the playlist url first and extract radio url
    start threads with either listen or record action string to stop 'em separate if both listen and rec are active
    """
    radio_name = status_read_status_set(False, 'posts', 'title', table_id)
    radio_url = status_read_status_set(False, 'posts', 'content', table_id)

    playlist_url = dispatch_record_is_alive(radio_name, radio_url)
    if playlist_url is not None:
        radio_url = playlist_url

    if radio_name not in ghetto.GNet.dict_error.keys():
        ghetto.record(radio_name, radio_url, action)
    else:
        print(ghetto.GNet.dict_error[radio_name])
        ghetto.GBase.dict_exit[radio_name] = True  # end all threads of a failed radio; if any


def dispatch_record_is_alive(radio_name, radio_url):
    """call is_radio_online(), return url of first server in playlist, or return None

    test if server is alive, if not writes in error dict, later display msg in html
    if url is a playlist, it grabs the first url from playlist, mostly the best quality
    https://streams.br.de/bayern1obb_2.m3u
    """
    radio_url = ghetto.is_radio_online(radio_name, radio_url)
    if radio_url:
        return radio_url
    return


def start_progress_timer_daemon():
    """run progress_timer()"""
    threading.Thread(name="progress_timer", target=progress_timer, daemon=True).start()


def tear_down_after_timer_hit():
    """clean up to not confuse (buttons pressed, show online ...) if return to start page after timer hit"""
    ghettoApi.stop_blacklist_writer = True
    if len(ghetto.GBase.dict_exit) > 0:
        for recorder in ghetto.GBase.dict_exit:
            ghetto.GBase.dict_exit[recorder] = True
    for table_id in status_listen_btn_dict.keys():
        status_listen_btn_dict[table_id] = 0
    for table_id in status_record_btn_dict.keys():
        status_record_btn_dict[table_id] = 0
    active_streamer_dict.clear()


def progress_timer():
    """calculate remaining time until full stop of app, returns nothing

    stops ALL radio threads by writing ghetto.GBase.dict_exit[radio name] = True
    combo_master_timer -- val from browser in hours (default 0), -1 stops def, last loop
    progress_master_percent -- calculates percent of passed seconds (default 0)

    feed progress_master_percent global for route endpoint response to ajax updateMasterProgress()
    """
    global combo_master_timer  # combo in Tk/Tcl for drop-down dialog on ghetto_recorder package, the first GUI
    global progress_master_percent  # separate for future use; go to single timer for each radio

    up_count_timer = 0
    while 1:
        if combo_master_timer:
            if int(combo_master_timer) <= -1:
                seconds_to_run = 1  # must get more than 100 in percent calc, may not divide by zero; init exit
            else:
                seconds_to_run = (int(combo_master_timer) * 60 * 60)  # * 60
            percent = progress_bar_percent(up_count_timer, seconds_to_run)
            if percent:
                progress_master_percent = percent
            else:
                progress_master_percent = 0
                up_count_timer = 0

            if percent >= 100:
                tear_down_after_timer_hit()

        if not combo_master_timer:
            up_count_timer = 0
            progress_master_percent = 0

        up_count_timer += 1
        sleep(1)


def progress_bar_percent(up_count_timer, seconds_to_run):
    """calculate percent from passed by seconds and seconds to run, return float percent value

    return if zero is argument, because of division
    float for pytest type, since it could be sometimes int
    """
    if not seconds_to_run:
        return False
    # doing some math, p = (P * 100) / G, percent = (math.percentage value * 100) / base
    cur_percent = round((up_count_timer * 100) / seconds_to_run, 4)  # 0,0001 for 24h reaction to show in html
    return float(cur_percent)


def print_request_values(values):
    """helper to get all possible info printed from request"""
    for val in values:
        print(' -- start print --')
        print(f'\tval in request.form.values(): {val}')
        print(f'\trequest.data {request.data}')
        print(f'\trequest.form {request.form}')
        print(f'\trequest.values {request.values}')
        print(f'\trequest.form.to_dict() {request.form.to_dict()}')
        print(' -- end print --')


def check_write_protected():
    """write test b"\x03".hex() = 03, flash message if ok or not, redirect to start page

    to inform user if download directory is not writeable

    download_dir can be None, no DB entry after all radios deleted
    Recorder package is not able to push a message to the user.
    """
    download_dir = None
    try:
        download_dir = os.path.abspath(get_download_dir())
    except TypeError:
        write_protected_fail()
    if download_dir is None or not download_dir:
        write_protected_fail()

    if download_dir:
        test_file = os.path.join(download_dir, "eisen_write_test")
        rec_stream = b"\x03"
        try:
            with open(test_file, 'wb') as record_file:
                record_file.write(rec_stream)
            os.remove(test_file)
        except OSError:  # master of desaster
            flash('Start some recorder to check write access ' + download_dir, 'danger')
            flash('Use SAVE menu option to change recorder parent folder.', 'warning')
            return redirect(url_for('eisenhome_bp.index'))


def write_protected_fail():
    flash('Can not write to folder! No folder specified.', 'danger')
    flash('Use SAVE menu option to change recorder parent folder.', 'warning')
    return redirect(url_for('eisenhome_bp.index'))
