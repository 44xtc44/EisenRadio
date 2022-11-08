""" monitor_records module description

    Info
        read all database blacklists from all radios into 'all_blacklists_dict'
        radio writes new title in 'recorder_new_title_dict[radio]'
        blacklist_writer updates all_blacklists_dict and updates the blacklist of each radio in db

        Case
           normal behavior - recorder copies new file (delete existing file)
           monitored - recorder compares title with all_blacklists_dict[radio] list,
           copy new file only if title is not found in blacklist

    Feature
       route endpoints added to utils route to create an DB entry for blacklist feature, can check status from java
       ghettoApi got a variable to break the run_blacklist_writer() loop, if timer is set
       Tools menu got Export/Import options
       Tools Export/Import menus are displayed or hidden Html Div elements (bp_utils.js)
"""
import copy
import json
import threading
import time

import eisenradio.lib.eisdb as eisen_db
from ghettorecorder import ghettoApi


all_blacklists_dict = {}
ghettoApi.init_ghetto_all_blacklists_dict(all_blacklists_dict)


def start_blacklist_writer_daemon():
    """runs run_blacklist_writer() thread until the end of app"""
    threading.Thread(name="blacklist_writer", target=run_blacklist_writer, daemon=True).start()


def run_blacklist_writer():
    """loop read feature db status and reflect it in api var for recorders, update radios blacklists with new titles

    each radio has its own blacklist
    loop ends if timer on start page is set
    """
    first_run = True
    while not ghettoApi.stop_blacklist_writer:
        if first_run:
            enabled = status_db_blacklist_get()
            status_api_blacklist_set(enabled)
            feed_api_radios_blacklists()
            first_run = False

        if ghettoApi.blacklist_enable:
            update_radios_blacklists()

        for _ in range(5):
            if ghettoApi.stop_blacklist_writer:
                break
            time.sleep(1)


def status_db_blacklist_get():
    """return (0,1) off/on

    "misused" column, cause older db's don't have extra columns
    called by
    @eisenutil_bp.route('/tools'
    @eisenutil_bp.route('/tools_radio_blacklist_set'
    """
    conn = eisen_db.get_db_connection()
    status = conn.execute('SELECT browser_open FROM eisen_intern WHERE id = 2').fetchone()
    conn.close()
    if status:
        return status
    return


def status_api_blacklist_set(status):
    """switch status update api, return nothing"""
    if not status:
        # not enabled at all, no insert added a new row 2
        ghettoApi.blacklist_enable = False
    if status:
        if int(status[0]) == 0:
            ghettoApi.blacklist_enable = False
        if int(status[0]) == 1:
            ghettoApi.blacklist_enable = True


def blacklist_enabled_button_outfit_get(is_enabled):
    """read status feature enabled, return if enabled or not

    change btn color in Tools menu Monitor Records to reflect status
    called by @eisenutil_bp.route('/tools'
    """
    enabled = False
    if not is_enabled:
        enabled = False
    if is_enabled:
        if int(is_enabled[0]) == 0:
            enabled = False
        if int(is_enabled[0]) == 1:
            enabled = True
    return enabled


def update_radios_blacklists():
    """for loop to update blacklists for all currently active recorder

    pseudo sample
       recorder file dict -    recorder_new_title_dict['radio5'] = 'ASAP - I want to be part of the blacklist'
       recorder compares  -        all_blacklists_dict['radio5'] = ['The Listies - I am on a list', 'OMG - Mee Too']
       comparison
       blacklist_writer: if recorder_new_title_dict['radio5'] value NOT in all_blacklists_dict['radio5'] list
       then
       blacklist_writer: all_blacklists_dict['radio5'].append(recorder_new_title_dict['radio5'] value)
    """
    # make a copy of dict to prevent 'RuntimeError: dictionary changed size during iteration'
    recorder_new_cp = copy.deepcopy(ghettoApi.recorder_new_title_dict)

    for radio, new_title in recorder_new_cp.items():
        if new_title not in ghettoApi.all_blacklists_dict[radio]:
            conn = eisen_db.get_db_connection()
            blacklist = ghettoApi.all_blacklists_dict[radio]
            blacklist.append(new_title)
            conn.execute('UPDATE posts SET display = ? WHERE title = ?;', (json.dumps(blacklist), radio))
            conn.commit()
            conn.close()


def feed_api_radios_blacklists():
    """for each radio write blacklist from db to api for comparison

    recorder can check if record (title) is in the list and skip writing it
    """
    conn = eisen_db.get_db_connection()
    radios_list = conn.execute('SELECT title FROM posts').fetchall()

    if radios_list:
        for row in radios_list:
            radio = row[0]
            # table column 'display' was used to store current title for displaying, now in api; reuse for list
            known_files = conn.execute('SELECT display FROM posts WHERE title = ?;', (radio,)).fetchone()

            blacklist = json_loads_blacklist(known_files, radio)
            ghettoApi.all_blacklists_dict[radio] = blacklist
    conn.close()


def dump_radio_blacklist_from_col(radio):
    """call json_loads_blacklist() return blacklist as list"""
    conn = eisen_db.get_db_connection()
    known_files = conn.execute('SELECT display FROM posts WHERE title = ?;', (radio,)).fetchone()
    conn.close()

    blacklist = json_loads_blacklist(known_files, radio)
    return blacklist


def json_loads_blacklist(known_files, radio):
    """json.loads(sqlite row object) to list, return the blacklist, [] list on exception if json can not read db"""
    blacklist = []
    if known_files:
        if known_files[0]:
            try:
                blacklist = json.loads(known_files[0])
            except Exception as error:
                message = f'minor error in json_loads_blacklist(), {radio} {error}, can proceed with an empty list'
                print(message)
    return blacklist


def sort_dictionary_by_value(blacklist):
    """enum blacklist, sort output to tuples, make a sorted_dict from sorted tuples, return value sorted dict

    sorted_dict for display, route endpoint shows it in Html for editing and deletion
    sorted_dict to store index numbers of blacklist (list) to delete index numbers later without value comparison, to
    prevent a possible introduction of a source of error
    """
    sorted_dict = {}
    if not len(blacklist):
        return sorted_dict

    unsorted_dict = {index: value for index, value in enumerate(blacklist)}
    # Create a list of tuples sorted by value, value[1] is value field in dict/ value[0] mimics "key"
    sorted_tuples = sorted(unsorted_dict.items(), key=lambda value: value[1])
    sorted_dict = {elem[0]: elem[1] for elem in sorted_tuples}
    return sorted_dict


def delete_blacklist(radio):
    """delete a blacklist from db, returns nothing

    delete a radio blacklist from db and the all_blacklists_dict, via ajax request or delete_all_blacklists() call
    """
    message = f'replace blacklist {radio} with an empty list!! '
    lst = [message]
    print(message)
    blacklist = []
    conn = eisen_db.get_db_connection()
    conn.execute('UPDATE posts SET display = ? WHERE title = ?;', (json.dumps(blacklist), radio))
    conn.commit()
    conn.close()
    ghettoApi.all_blacklists_dict[radio] = []
    return lst


def del_single_title_master(radio, request_dict):
    """return log, take radio blacklist and sort indexes to delete, call deletion function, write updated blacklist

    del individual items from a radios blacklist, ajax delivers list of title indexes for deletion in request_dict
    avoid comparing values
    1 sort del indexes in ascending list,
    2 del a title and subtract one from original index in each loop
    sorted values in new ordered list; sort to later remove items via index in a foreseen manner
    """
    log_list = []
    blacklist = dump_radio_blacklist_from_col(radio)
    if not blacklist:
        return

    for item in blacklist:
        message = f'idx^{blacklist.index(item)}^ {item}'
        print(message)
        log_list.append(message)

    message = "\n --> Delete titles from blacklist \n"
    print(message)

    unsorted_del_idx = del_single_title_get_del_indexes(request_dict)
    sorted_del_idx = sorted(unsorted_del_idx)

    altered_blacklist, log_idx_list = del_single_title_del_indexes(sorted_del_idx, blacklist, radio)
    del_single_title_write(altered_blacklist, radio)

    log_idx_list.extend(log_list)    # reverse to have the del idx at first and mark 'em in the list
    return log_idx_list


def del_single_title_write(altered_blacklist, radio):
    """json.dumps(altered_blacklist), to the radio in db, returns nothing"""
    conn = eisen_db.get_db_connection()
    conn.execute('UPDATE posts SET display = ? WHERE title = ?;', (json.dumps(altered_blacklist), radio))
    conn.commit()


def del_single_title_del_indexes(asc_ord_del_idx, blacklist, radio):
    """list of indexes to delete from a radio blacklist, return the updated blacklist

    remove title(s) from list by deleting their indexes, no value compare
    list with indexes to delete is ordered ascending [7,23,467] (same as the blacklist[0] to blacklist[999])
    index deletion means -1 index number for all successors of the deleted element vs org. list
    returns updated blacklist
    """
    log_list = ["--> index delete:"]
    print(asc_ord_del_idx)

    for count, idx in enumerate(asc_ord_del_idx):
        message = f'index:{idx}: {blacklist[idx + count]} [{idx + count}: index in altered list]'
        print(message)
        log_list.append(message)
        del ghettoApi.all_blacklists_dict[radio][idx + count]
        del blacklist[idx + count]

    log_list.append("--> from this list:")
    return blacklist, log_list


def del_single_title_get_del_indexes(request_dict):
    """return the extracted, unsorted list with indexes to delete

    the request dict transports not only indexes via ajax
    pull del indexes from request
    """
    unsorted_indexes = []

    for key, value in request_dict.items():
        if (not key == 'radio_name') and (not key == 'delAll'):
            unsorted_indexes.append(int(value))
    return unsorted_indexes


def delete_all_blacklists(feature_enabled):
    """delete blacklist of each radio if feature was disabled in 'Tools Monitor Records', returns nothing

    caller @eisenutil_bp.route('/radio_blacklist_set'
    delete all collected filenames from all radios if feature switch to disabled
    """
    if not feature_enabled:
        conn = eisen_db.get_db_connection()
        radios = conn.execute('SELECT title FROM posts;').fetchall()
        conn.close()

        if radios is not None:
            for row in radios:
                radio = row[0]
                delete_blacklist(radio)


def feature_blacklist_switch_status(status):
    """enables feature if status is None (no db table cell) or switch status if bool, writes status, return new status

    first run ever creates db entry for the feature,
    then switch and returns on or off
    """
    enabled = False
    first_run = False
    if status is None:
        enabled = True
        ghettoApi.blacklist_enable = enabled
        first_run = True
    if status is not None:
        blacklist_on = int(status[0])
        if not blacklist_on:
            enabled = True
            ghettoApi.blacklist_enable = enabled
        if blacklist_on:
            enabled = False
            ghettoApi.blacklist_enable = enabled

    if first_run:
        feature_blacklist_insert_row(enabled)
    if not first_run:
        feature_blacklist_update_row(enabled)
    return enabled


def feature_blacklist_insert_row(enabled):
    conn = eisen_db.get_db_connection()
    conn.execute('INSERT INTO eisen_intern (browser_open) VALUES (?);', (enabled,))
    conn.commit()
    conn.close()


def feature_blacklist_update_row(enabled):
    conn = eisen_db.get_db_connection()
    conn.execute('UPDATE eisen_intern SET browser_open = ? WHERE id = ?;', (enabled, 2))
    conn.commit()
    conn.close()


def fill_radio_display_col():
    """mocking the db entries for dev and test"""

    # call it in eishome.index_first_run()
    classic = ['Aurèle Marthan Rafaël Angster Guillaume Begni Philibert Perrine & Amaury Viduvier - Quintet in E-Flat '
               'Major K 452 III Allegretto', 'Vladimir Ashkenazy - Nocturne No 20 in C sharp Minor Op posth']
    goa_psi = ['Electric Universe - Activate  animaskntru', 'Bafoomay - Monosonicum Miles Away Mix  animaskntru']
    time_machine = ['Murder at Midnight - 12 The Man Who Died Yesterday', "The Adventures of Philip Marlowe - The "
                                                                          "Fox's Tail"]
    nerd_sound_tracks = ['Lyn - Autonomy', 'Takayuki Iwai Yuki Iwai Isao Abe Hideki Okugawa Tetsuya Shibata - Active '
                                           'Red Theme of Ken']  # nerd-sound-tracks
    BLUES_UK = ['Nothing But The Devil', 'Henrik - Schlader band']
    relax = ['Mission Brown - Another Beginning', 'Neil Davidge - Sensor Melo Remix']
    Nachtflug = ['Helium Vola - Selig', 'Kite - Hand Out the Drugs']
    hm = ['E-Spectro - Dawn On Sunset Vla DSound Rem', "Alex O'Rion - Komodo"]
    Boradio = ['AutoDJ - Various']
    B2 = ['Hör auf Dein Herz wwwSchlagerRadiode', 'Beatrice Egli - Verrückt Nach Dir']

    radio_dict = {
        'classic': classic,
        'goa_psi': goa_psi,
        'time_machine': time_machine,
        'nerd-sound-tracks': nerd_sound_tracks,
        'BLUES_UK': BLUES_UK,
        'relax': relax,
        'Nachtflug': Nachtflug,
        'hm': hm,
        'Boradio': Boradio,
        'B2': B2
    }

    conn = eisen_db.get_db_connection()

    for radio, blacklist in radio_dict.items():
        # json.dumps() to string, json.loads() to object
        conn.execute('UPDATE posts SET display = ? WHERE title = ?;', (json.dumps(blacklist), radio))
        conn.commit()

    conn.close()
