import os
import eisenradio.eisenutil.eisutil as eis_util
import eisenradio.eisenutil.browser_stream as browser_stream
import eisenradio.eisenutil.stopped_stations as stopped_stations
from aacrepair import AacRepair
from ghettorecorder import ghettoApi
from flask import Blueprint, render_template, request, url_for, flash, redirect, make_response, jsonify, Response
from eisenradio.eisenutil import request_info
from eisenradio.eisenutil import tools as util_tools
from eisenradio.lib import eisdb as lib_eisdb
from eisenradio.api import api, eisenApi
from eisenradio.eisenutil import monitor_records as mon_rec
from eisenradio.eisenutil import config_html

blacklist_enabled_global = False
ghettoApi.init_ghetto_blacklist_enabled_global(blacklist_enabled_global)
aac_repair_log = []
ghettoApi.init_aac_repair_log(aac_repair_log)

# Blueprint Configuration
eisenutil_bp = Blueprint(
    'eisenutil_bp', __name__,
    template_folder='bp_util_templates',
    static_folder='bp_util_static',
    static_url_path='/bp_util_static'
)


@eisenutil_bp.route('/tools_transparent_image_load', methods=['POST'])
def tools_transparent_image_load():
    """ return list to JS div list maker, replace standard random pic with a translucent one """
    request_dict = request.form.to_dict()
    radio_name = request_dict['radioName']
    eisenApi.init_radio_id_dict()
    util_tools.radio_transparent_image_db(eisenApi.radio_id_dict[radio_name])
    msg_list = ["Radio got a beautiful transparent image."]
    return jsonify({"transparentImageLoad": msg_list})


@eisenutil_bp.route('/tools_radio_html_settings', methods=['POST'])
def tools_radio_html_settings():
    """ update front-end settings, css style and animations in database
    send a message log to JS

    show_html_animation:
       show/hide all animations

    show_html_style:
       show/hide css style

    show_html_front_pigs:
       not actually pigs, but penguin, bear and tiger

    show_html_ballon:
        show/hide all aircraft related animations, balloon, parachute drop

    show_html_speaker:
       remove speaker animation

    return:
       list of messages for each config item to allow easy loop in js with list made from divs
    """
    on = 1
    off = 0
    show_html_animation = 1
    show_html_style = 1
    show_html_front_pigs = 1
    show_html_ballon = 1
    show_html_speaker = 1

    row_db_html_animation = 3
    row_db_html_style = 4
    row_db_html_front_pigs = 5
    row_db_html_balloon = 6
    row_db_html_speaker = 7

    request_dict = request.form.to_dict()
    config_animation = True
    msg_no_style_needed = ""
    for key, value in request_dict.items():
        if key == "checkboxConfigAnimation" and value == "true":
            show_html_animation = config_html.tools_feature_toggle_show_html_config(on, row_db_html_animation)
        if key == "checkboxConfigAnimation" and value == "false":
            show_html_animation = config_html.tools_feature_toggle_show_html_config(off, row_db_html_animation)
            config_animation = False
        if key == "checkboxConfigStyle" and value == "true":
            # if no animation is selected the style is senseless
            if not config_animation:
                msg_no_style_needed = "--> no animation at all, deactivate style too"
                show_html_style = config_html.tools_feature_toggle_show_html_config(off, row_db_html_style)
            else:
                show_html_style = config_html.tools_feature_toggle_show_html_config(on, row_db_html_style)
        if key == "checkboxConfigStyle" and value == "false":
            show_html_style = config_html.tools_feature_toggle_show_html_config(off, row_db_html_style)
        if key == "checkboxConfigFrontPigs" and value == "true":
            show_html_front_pigs = config_html.tools_feature_toggle_show_html_config(on, row_db_html_front_pigs)
        if key == "checkboxConfigFrontPigs" and value == "false":
            show_html_front_pigs = config_html.tools_feature_toggle_show_html_config(off, row_db_html_front_pigs)
        if key == "checkboxConfigBalloon" and value == "true":
            show_html_ballon = config_html.tools_feature_toggle_show_html_config(on, row_db_html_balloon)
        if key == "checkboxConfigBalloon" and value == "false":
            show_html_ballon = config_html.tools_feature_toggle_show_html_config(off, row_db_html_balloon)
        if key == "checkboxConfigFlatSpeaker" and value == "true":
            show_html_speaker = config_html.tools_feature_toggle_show_html_config(on, row_db_html_speaker)
        if key == "checkboxConfigFlatSpeaker" and value == "false":
            show_html_speaker = config_html.tools_feature_toggle_show_html_config(off, row_db_html_speaker)

    # msg implemented as fake list, each list item gets a div to make coloring and font styling easy, if wanted
    msg_animation_value = "enabled" if show_html_animation else "disabled"
    msg_style_value = "enabled" if show_html_style else "disabled"
    msg_animals_value = "enabled" if show_html_front_pigs else "disabled"
    msg_balloon_value = "enabled" if show_html_ballon else "disabled"
    msg_speaker_value = "enabled" if show_html_speaker else "disabled"

    msg = [".", "Hello, here your HTML settings:", ".",
           f"Style {msg_style_value}",
           f"Animation {msg_animation_value}",
           f"inflated animals {msg_animals_value}",
           f"animated balloon {msg_balloon_value}",
           f"animated speaker {msg_speaker_value}",
           msg_no_style_needed,
           ]
    return jsonify({"configEisenradioUpdate": msg})


@eisenutil_bp.route('/tools_aacp_repair_log', methods=['GET'])
def tools_aacp_repair_log():
    """ return log to JS, where related lines are colored """
    repair_log = ghettoApi.aac_repair_log
    ghettoApi.aac_repair_log = []
    return jsonify({"aacRepairPullLog": repair_log})


@eisenutil_bp.route('/tools_aacp_repair', methods=['POST'])
def tools_aacp_repair():
    """return flash warning if no aac file else create dict with file name and bytes content, redirect to start page

    sort out non aac files, call tool_aacp_repair(), threaded, so can not use flash to show the numbers, use log file
    flash the path to the written log file
    write acp dict with files to work on, convert file.storage object f.read() to bytes {file(n).aac: bytes(content)}
    """
    files = request.files.getlist('fileUploadAcpRepair')

    name_list = [f.filename for f in files if f.filename[-5:] == ".aacp" or f.filename[-4:] == ".aac"]
    if len(name_list) == 0:
        flash("No aac files.", 'warning')
        return render_template('bp_util_aac_repair.html')

    f_dict = {f.filename: f.read() if f.filename[-5:] == ".aacp" or f.filename[-4:] == ".aac" else None for f in files}
    export_path = lib_eisdb.get_download_dir()
    aac_rep = AacRepair(export_path, f_dict)
    aac_rep.repair()
    ghettoApi.aac_repair_log.clear()
    ghettoApi.aac_repair_log = aac_rep.log_list
    return render_template('bp_util_aac_repair.html')


@eisenutil_bp.route('/tools_radio_blacklist_set', methods=['GET'])
def tools_radio_blacklist_set():
    """enable blacklist first time, then switch status, return flash enabled/disabled, redirect to start page

    a call to this endpoint will change the value in db and delete all lists of all radios in db
    button is fashioned in tools()
    """
    is_enabled = mon_rec.status_db_blacklist_get()
    enabled = mon_rec.feature_blacklist_switch_status(is_enabled)
    mon_rec.delete_all_blacklists(enabled)
    if enabled:
        flash('Monitoring of records enabled.', 'success')
    else:
        flash('Monitoring of records disabled', 'warning')
    return redirect(url_for('eisenhome_bp.index'))


@eisenutil_bp.route('/<string:radio_name>/tools_blacklist_skipped', methods=['GET'])
def tools_blacklist_skipped(radio_name):
    """html page show the count of skipped titles per session and a list with their names

    add link to return to radio on start page
    vars
    radio_start_page_url -  to return directly to correct formatted page with radio on top of page
    radio_name
    skiplist - user info, list of title names skipped during session, can contain many duplicates if radio is info radio
    skip_count - user info how often titles of this radio were skipped during session because of using blacklist feature
    """
    radio_start_page_url = eis_util.radio_start_page_url_get(radio_name)

    skiplist, skip_count = '', 0
    try:
        skiplist = ghettoApi.skipped_in_session_dict[radio_name]
        skip_count = len(skiplist)
    except KeyError:
        pass
    return render_template('bp_util_skip_blacklist.html',
                           radio_start_page_url=radio_start_page_url,
                           radio_name=radio_name,
                           skiplist=skiplist,
                           skip_count=skip_count)


@eisenutil_bp.route('/tools_blacklist_overview', methods=['GET'])
def tools_blacklist_overview():
    """creates a html page with buttons for every radio to go to the blacklists edit page, returns vars for page build

    vars
    radios_dict - all radios loaded if start page is drawn ghettoApi.radios_in_view_dict
    streamer_name_list - change btn color for radios with active rec
    skip_count - user info how often titles of this radio were skipped during session because of using blacklist feature
    radio_blacklist_count = shows the count of blacklisted titles
    """

    skip_count = 0
    view_dict = ghettoApi.radios_in_view_dict  # key db id: val name
    skip_title_dict = ghettoApi.skipped_in_session_dict  # key radio: val title list
    blacklist_dict = ghettoApi.all_blacklists_dict
    streamer_name_list = []
    radio_blacklist_count = {}

    for db_id, btn_pressed in ghettoApi.rec_btn_dict.items():
        if btn_pressed:
            streamer_name_list.append(view_dict[db_id])
    for title_list in skip_title_dict.values():
        if title_list is not None:
            for _ in title_list:
                skip_count += 1
    for radio, title in blacklist_dict.items():
        blacklist_count = 0
        if title is not None:
            for _ in title:
                blacklist_count += 1
            radio_blacklist_count[radio] = blacklist_count

    return render_template('bp_util_radio_all_blacklist.html',
                           radios_dict=view_dict,
                           streamer_name_list=streamer_name_list,
                           skip_count=skip_count,
                           radio_blacklist_count=radio_blacklist_count)


@eisenutil_bp.route('/<string:radio_name>/tools_radio_blacklist', methods=['GET'])
def tools_radio_blacklist(radio_name):
    """on click render html page for a blacklist of one radio, returns vars to build the list

    vars
    radio_start_page_url - to return directly to correct formatted page with radio on top of page
    len(blacklist) - write number of blacklist items in the list beneath the radio name
    sorted_title_dict - to show titles asc. sorted and remember index nums of org list for title deletion in org list
    skip_count - user info how often titles of this radio were skipped during session because of using blacklist feature
    radio_name
    """
    radio_start_page_url = eis_util.radio_start_page_url_get(radio_name)

    blacklist = mon_rec.dump_radio_blacklist_from_col(radio_name)
    sorted_title_dict = mon_rec.sort_dictionary_by_value(blacklist)
    skip_count = 0
    try:
        skip_count = len(ghettoApi.skipped_in_session_dict[radio_name])
    except KeyError:
        pass
    return render_template('bp_util_radio_blacklist.html',
                           radio_start_page_url=radio_start_page_url,
                           counter=len(blacklist),
                           sorted_title_dict=sorted_title_dict,
                           skip_count=skip_count,
                           radio_name=radio_name)


@eisenutil_bp.route('/tools_radio_blacklist_del_from_list', methods=['POST'])
def tools_radio_blacklist_del_from_list():
    """from html blacklist page delete one or more title from the list, or delete the whole list

    click java: delFromBlacklist(), html: bp_util_radio_blacklist.html
    """
    log = "-empty-"
    if request.method == 'POST':
        request_dict = request.form.to_dict()
        radio_name = request_dict['radio_name']
        delete_list = request_dict['delAll']
        # java
        if delete_list == 'false':
            log = mon_rec.del_single_title_master(radio_name, request_dict)
        if delete_list == 'true':
            log = mon_rec.delete_blacklist(radio_name)
        msg = "_ok_"
        return jsonify({'delFromBlacklist': msg,
                        'logFileDeleteFromBlackList': log})


@eisenutil_bp.route('/tools_export_blacklists', methods=['POST'])
def tools_export_blacklists():
    """call dump_radio_blacklist() export blacklists and return flash message if ok or not

    confirm with flask flash template, java popup kills selenium tests
    """
    rv = util_tools.dump_radio_blacklist()
    if rv:
        flash('Successfully exported!', 'success')
        return render_template('bp_util_flash.html')
    else:
        flash('Something went wrong, write protected?', 'warning')
        return render_template('bp_util_flash.html')


@eisenutil_bp.route('/tools_upload_blacklists', methods=['POST'])
def tools_upload_blacklists():
    """ call upload_blacklists to upload blacklists to server db

    Return
       flash message if ok or not, except on error, restore the blacklists from json file
    """
    file = request.files['fileUploadBlackLists']
    try:
        json_file = file.read()
        rv, count = util_tools.upload_blacklists(json_file)
    except Exception as error:
        print(error)
        return f'Something went wrong. error :: {error}'
    if rv:
        status = "Monitor Records is ON" if ghettoApi.blacklist_enabled_global else "Monitor Records is OFF"
        flash(f'{count} unwanted titles imported! Lists are loaded. {status}', 'success')
        return render_template('bp_util_flash.html')
    else:
        flash('Something went wrong, use "Tools" Menu to go back! Wrong text utf-format? Wrong file? \nRead terminal '
              'messages, please. If possible', 'warning')
        return render_template('bp_util_flash.html')


@eisenutil_bp.route('/tools_delete_all', methods=['POST'])
def tools_delete_all():
    """delete all radios from db, return flash if ok or not

    used to restore from ini file with preferred radios and urls afterwards
    """
    rv = util_tools.delete_all_radios()
    if rv:
        flash('Successfully deleted! Restart App', 'success')
        return render_template('bp_util_flash.html')
    else:
        flash('Some were not deleted! Restart App', 'warning')
        return render_template('bp_util_flash.html')


@eisenutil_bp.route('/tools_export_ini', methods=['POST'])
def tools_export_ini():
    """call export_radios() to dump radio urls to ini file, return flash if ok or not"""
    rv = util_tools.export_radios()
    if rv:
        flash('Successfully exported!', 'success')
        return render_template('bp_util_flash.html')
    else:
        flash('Something went wrong, write protected?', 'warning')
        return render_template('bp_util_flash.html')


@eisenutil_bp.route('/tools_upload_ini', methods=['POST'])
def tools_upload_ini():
    """call upload_radios() to restore radio in db, return a flash message if ok or not"""
    file = request.files['fileUploadUrls']
    print(f' name {file.name} content-type {file.content_type}')
    try:
        settings_ini = file.read()
        rv, counter = util_tools.upload_radios(settings_ini.decode('ascii'))
    except Exception as error:
        print(error)
        return f'Something went wrong. error :: {error}'
    if rv:
        num_radios_added = "No new names imported!" if not counter else f"{counter} radios imported! Restart the App!"
        flash(f' {num_radios_added}', 'success')
        return render_template('bp_util_flash.html')
    else:
        flash('Something went wrong, use "Tools" Menu to go back! Wrong text utf-format? Wrong file? \nRead terminal '
              'messages, please. If possible', 'warning')
        return render_template('bp_util_flash.html')


@eisenutil_bp.route('/tools', methods=('GET', 'POST'))
def tools():
    """ render TOOLS page

    Info
       html config status switch checkboxes
       button to switch blacklist feature on/off
       blacklist_check_box_off is the digit part of a deselected checkbox unicode symbol
       in html hardcoded is & and # since I can not transfer those characters (don't know why)
       display path for exported files (same as parent download path)

    vars
       export_path - parent directory of radio folders
       button_label - blacklist feature button text
       button_message - blacklist feature info
       enabled - blacklist feature on or off
    """
    html_animation_row = 3
    html_style_row = 4
    html_front_pigs_row = 5
    html_balloon_row = 6
    html_speaker_row = 7

    anim_on = config_html.tools_feature_on_off_state_in_db(html_animation_row)
    animation_check_box_checked = 'checked' if anim_on else ' '
    animation_check_box_msg = "Stop all animations." if anim_on else "Enable animations. (required)"

    front_pigs_on = config_html.tools_feature_on_off_state_in_db(html_front_pigs_row)
    front_pigs_check_box_checked = 'checked' if front_pigs_on else ' '
    fp_msg = "Deselect a black bird show." if front_pigs_on else "Check out an exiting bird show."
    front_pigs_check_box_msg = fp_msg

    balloon_on = config_html.tools_feature_on_off_state_in_db(html_balloon_row)
    balloon_check_box_checked = 'checked' if balloon_on else ' '
    balloon_check_box_msg = "Deselect music animated air show." if balloon_on else "Check out a balloon animation."

    speaker_on = config_html.tools_feature_on_off_state_in_db(html_speaker_row)
    speaker_check_box_checked = 'checked' if speaker_on else ' '
    speaker_check_box_msg = "Deselect music animated speaker." if speaker_on else "Check out a music animated speaker."

    style_on = config_html.tools_feature_on_off_state_in_db(html_style_row)
    style_check_box_checked = 'checked' if style_on else ' '
    style_check_box_msg = "Deselect for simplistic style." if style_on else "Check out for brightly colored style."

    blacklist_check_box_off = "9744"
    blacklist_check_box_on = "9989"
    blacklist_is_enabled = mon_rec.status_db_blacklist_get()
    blacklist = mon_rec.blacklist_enabled_button_outfit_get(blacklist_is_enabled)
    blacklist_button_label = ' ON' if blacklist else 'OFF'
    blacklist_btn_msg = "OFF, erase blacklists." if blacklist else "ON, start monitoring."
    blacklist_check_box_info = blacklist_check_box_on if blacklist else blacklist_check_box_off
    export_path = util_tools.get_export_path()
    return render_template('bp_util_tools.html',
                           export_path=export_path,
                           button_label=blacklist_button_label,
                           button_message=blacklist_btn_msg,
                           enabled=blacklist,
                           blacklist_check_box_info=blacklist_check_box_info,
                           animation_check_box_checked=animation_check_box_checked,
                           animation_check_box_msg=animation_check_box_msg,
                           style_check_box_checked=style_check_box_checked,
                           style_check_box_msg=style_check_box_msg,
                           front_pigs_on=front_pigs_on,
                           front_pigs_check_box_checked=front_pigs_check_box_checked,
                           front_pigs_check_box_msg=front_pigs_check_box_msg,
                           balloon_on=balloon_on,
                           balloon_check_box_checked=balloon_check_box_checked,
                           balloon_check_box_msg=balloon_check_box_msg,
                           speaker_on=speaker_on,
                           speaker_check_box_checked=speaker_check_box_checked,
                           speaker_check_box_msg=speaker_check_box_msg)


@eisenutil_bp.route('/about', methods=('GET', 'POST'))
def about():
    """ render ABOUT page

    POST
       switch browser autostart val (0,1) in db, redirect to refresh the page with updated btn value

    GET
       called from menu, returns var to show download and db path on page

    vars
       is_browser_on - reflect db entry for autostart on btn value
       download_path - parent directory of radio folders
       db_path - location of eisenradio database
    """
    if request.method == 'POST':
        if request.form['browser']:
            lib_eisdb.status_read_status_set(True, 'eisen_intern', 'browser_open', '1')
            return redirect(url_for('eisenutil_bp.about'))

    is_browser_on = lib_eisdb.status_read_status_set(False, 'eisen_intern', 'browser_open', '1')
    download_path = lib_eisdb.get_download_dir()
    db_path = api.config['DATABASE']
    return render_template('bp_util_about.html',
                           is_browser_on=is_browser_on,
                           download_path=download_path,
                           db_path=db_path)


@eisenutil_bp.route('/create', methods=('GET', 'POST'))
def create():
    """"render "New" radio page"""
    if request.method == 'POST':
        rv_req = request.form['title']

        title = eis_util.remove_blank(rv_req)
        name_in_db = eis_util.is_in_db_view(title)
        content = request.form['content']
        radio_image = None
        content_type = None

        if not title:
            flash('Name is required!', 'warning')
            return render_template('bp_util_create.html')
        if name_in_db:
            flash('Name is already used!', 'warning')
            return render_template('bp_util_create.html')
        if not content:
            flash('URL is required!', 'warning')
            return render_template('bp_util_create.html')

        # Image
        if request.files['inputFile']:
            file = request.files['inputFile']
            content_type = file.content_type
            print(f' name {file.name} content-type {file.content_type}')

            try:
                db_img = file.read()
                radio_image = lib_eisdb.render_picture(db_img, 'encode')
            except Exception as e:
                print(e)
                radio_image = None
                content_type = None

        else:
            if not name_in_db:
                radio_image, content_type = util_tools.radio_spare_image()

        if request.form['text']:
            text = request.form['text']
        else:
            text = None

        conn = lib_eisdb.get_db_connection()
        posts = conn.execute('SELECT * FROM posts').fetchall()
        # if we later want extra save folders for each radio
        try:
            request_path = posts[0]["download_path"]
        except Exception as e:
            print(e)
            print(' looks like the first radio to create, no save to path set')
            conn.execute('INSERT INTO posts (title, content) VALUES (?, ?)',
                         (title, content))
        else:
            conn.execute('INSERT INTO posts (title, content, download_path, pic_data, pic_content_type, pic_comment) '
                         'VALUES (?, ?, ?, ?, ?, ?)',
                         (title, content, request_path, radio_image, content_type, text))

        conn.commit()
        conn.close()
        return redirect(url_for('eisenhome_bp.index'))

    return render_template('bp_util_create.html')


@eisenutil_bp.route('/save', methods=('GET', 'POST'))
def save():
    """render SAVE page, send fail flash message if db empty"""
    if request.method == 'GET':
        try:
            os.path.abspath(lib_eisdb.get_download_dir())
        except TypeError:
            return render_template('bp_util_save.html', save_to='no-directory-found')
        return render_template('bp_util_save.html', save_to=os.path.abspath(lib_eisdb.get_download_dir()))

    if request.method == 'POST':
        request_path = os.path.abspath(request.form['Path_Save_To'])

        if not request_path:
            flash('A folder is required!', 'warning')
            try:
                os.path.abspath(lib_eisdb.get_download_dir())
            except TypeError:
                return render_template('bp_util_save.html', save_to='no-directory-found')
            return render_template('bp_util_save.html', save_to=os.path.abspath(lib_eisdb.get_download_dir()))

        if request_path:
            made_it = eis_util.make_folder(request_path)
            if not made_it:
                flash('No folder created! exists or denied', 'warning')
                return render_template('bp_util_save.html', save_to=os.path.abspath(lib_eisdb.get_download_dir()))

            conn = lib_eisdb.get_db_connection()
            records = conn.execute('select id from posts').fetchall()
            if not records:
                flash('Noting in Database!', 'warning')
                try:
                    return render_template('bp_util_save.html', save_to=os.path.abspath(lib_eisdb.get_download_dir()))
                except TypeError:
                    return render_template('bp_util_save.html', save_to='no-row-in-table-create-a-radio')
            for id_num in records:
                # print("Radio Id:", id_num[0])
                conn.execute('UPDATE posts SET download_path = ? WHERE id = ?', (request_path, id_num[0]))
            conn.commit()
            conn.close()

            flash(('Save files to: ' + request_path), "success")
            return redirect(url_for('eisenhome_bp.index'))

        return render_template('bp_util_save.html', save_to=os.path.abspath(lib_eisdb.get_download_dir()))


@eisenutil_bp.route('/<int:id>/edit', methods=('GET', 'POST'))
def edit(id):
    """render Edit page"""
    post = lib_eisdb.get_post(id)

    if request.method == 'POST':
        rv_req = request.form['title']

        title = rv_req.replace(" ", "")
        content = request.form['content']
        print(request.form)
        if not title:
            flash('Title is required!', 'warning')
        # Image, if empty keep db entry as it is
        if request.files['inputFile']:
            file = request.files['inputFile']
            content_type = file.content_type
            print(f' name {file.name} content-type {file.content_type}')
            try:
                db_img = file.read()
                image = lib_eisdb.render_picture(db_img, 'encode')
            except Exception as e:
                print(e)
                image = None
                content_type = None

        else:
            image = None
            content_type = None

        if request.form['text']:
            text = request.form['text']
            if text == 'None':
                text = ' '
        else:
            text = ' '

        conn = lib_eisdb.get_db_connection()
        if image:
            conn.execute('UPDATE posts SET title = ?, content = ?, pic_data = ?, pic_content_type = ?, '
                         'pic_comment = ? WHERE id = ?',
                         (title, content, image, content_type, text, id))
        else:
            conn.execute('UPDATE posts SET title = ?, content = ?, pic_comment = ?  WHERE id = ?',
                         (title, content, text, id))

        conn.commit()
        conn.close()
        return redirect(url_for('eisenhome_bp.index'))

    return render_template('bp_util_edit.html', post=post)


@eisenutil_bp.route('/<int:post_id>')
def post(post_id):
    """draw a page (after clicked on radio picture) to go to radio directory (shout-/icecast) if possible"""
    post = lib_eisdb.get_post(post_id)
    url_port = eis_util.parse_url_simple_url(post["content"])
    pass
    return render_template('bp_util_post.html',
                           post=post,
                           url_port=url_port)


@eisenutil_bp.route('/sw')
def stream_watcher():
    """return the name of a VIP"""
    resp = make_response("stream watcher    (ಠ_ಠ)")
    return resp


@eisenutil_bp.route('/header_info', methods=['GET'])
def header_info():
    """call header_data_read(),return a json list of radio stream header info  [name, bit rate, website, ...]"""
    json_lists = request_info.header_data_read()
    if len(json_lists) == 0:
        json_lists = '-empty-'
    return jsonify({"header_result": json_lists})


@eisenutil_bp.route('/delete_info', methods=['GET'])
def delete_info():
    """call inactive_id_read(), return a json list of all inactive radio ids to clean html page

   json_is_data_transfer true if a radio is online (watchdog feeds)
    """
    json_stop_list = stopped_stations.inactive_id_read()
    json_is_data_transfer = ghettoApi.radio_active
    return jsonify({"stopped_result": json_stop_list, 'is_data_transfer': json_is_data_transfer})


@eisenutil_bp.route('/listen_info', methods=['GET'])
def listen_info():
    """return complete id of current pressed listen button, js displayLocalPlayListEnableDeactivateListenBtn()

    {listen_btn_id: Listen_17}
    """
    json_listen_btn_id = eis_util.radio_listen_button_get()
    return jsonify({"listen_btn_id": json_listen_btn_id})


@eisenutil_bp.route('/sound/<radio_name>', methods=['GET'])
def sound(radio_name):
    """streams to html audio element

    get_stream_content_type() make an environment variable {radio name: content type} to not read internet header again
    inform browser about mime type, cache control and access control type for connection
    local audio via javascript (use upload functionality)
    add headers
    ['Cache-Control'] = 'no-store'  - forbid browser caching parts of the stream chunks
    ['Access-Control-Allow-Origin'] = '*'   - disable CORS, works only on localhost, not internet
    """
    name = str(radio_name)

    try:
        content_type = os.environ[name]
    except KeyError:
        content_type = browser_stream.get_stream_content_type(name)

    audio_chunks = browser_stream.stream_audio_feed(name)

    response = Response(audio_chunks, mimetype=content_type)
    response.headers['Cache-Control'] = 'no-store'
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
