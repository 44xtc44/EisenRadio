import threading
import time
from ghettorecorder import ghettoApi
from eisenradio.api import ghettoTest
from eisenradio.lib import ghetto_recorder as ghetto

radio_active = False
ghettoApi.init_radio_active(radio_active)
thread_killer = (False, False, False)
ghettoTest.init_test_thread_killer(thread_killer)


def start_watchdog_daemon():
    """path eishome.index_first_run()

    should never do any repair actions, only reporting (let it crash) so we know what to do next
    """
    threading.Thread(name="watchdog", target=run_watchdog, daemon=True).start()


def run_watchdog():
    while not ghettoApi.stop_blacklist_writer:
        # [print(f' {thread.name}') for thread in threading.enumerate()]
        report_active_radio_threads()
        # report_failed_thread_names()    # testing
        # rv = "True, radio connected." if rv else "No radio connected."

        # print(f'\n\t blacklist_enabled {ghettoApi.blacklist_enabled_global}\n')

        # [print(f'audio_stream_dict: {key}: {value}') for key, value in ghettoApi.ghetto_audio_stream_dict.items()]

        # [print(f'metadata_text: {key}: {value}') for key, value in ghettoApi.current_song_dict.items()]

        # [print(f'measure_dict: {key}: {value}') for key, value in ghettoApi.ghetto_measure_dict.items()]

        # for radio_name, blacklist in ghettoApi.all_blacklists_dict.items():
        #     print('\n')
        #     [print(f'bl: {radio_name[:3]}: {index} {value}') for index, value in enumerate(blacklist)]

        # [print(f'title_new: {key}: {value}') for key, value in ghettoApi.recorder_new_title_dict.items()]

        # disconnect browser to see filling and removal of queue items, buffer elements
        # [print(f'{key} queue len (max 4): {val.qsize()}') for key, val in ghettoApi.ghetto_audio_stream_dict.items()]

        # print(f"ghettoApi.all_blacklists_dict {ghettoApi.all_blacklists_dict}")

        for _ in range(10):
            # exit with the writer
            if ghettoApi.stop_blacklist_writer:
                break
            time.sleep(1)


def report_failed_thread_names():
    """write to error dict so js can write it to html

    For testing. If unlucky this guy can flood the html page with fake errors during station switching.
    A full crash of all radio threads at the same time can not be detected. omg
    rec. consists of three threads ["tail", "head", "meta"]
    meta - try to read metadata from radio
    head - clean up metadata string and build full path name for tail,
    tail - read/write the stream
    """
    record_desired_types = ["tail", "head", "meta"]
    listen_desired_types = ["tail", "meta"]

    all_threads_list = [thread.name for thread in threading.enumerate()]
    # classic_record_head, 12char 2nd part, (_record_head)  or (_listen_meta)
    active_rec_name_list = list(set([name[:len(name)-12] for name in all_threads_list if "_record_" in name]))
    active_lis_name_list = list(set([name[:len(name)-12] for name in all_threads_list if "_listen_" in name]))

    if len(active_rec_name_list) > 0:
        radio_rec_thread_dict = report_failed_thread_names_build_dict(active_rec_name_list, all_threads_list, "record")
        report_failed_thread_names_assert_dict(radio_rec_thread_dict, record_desired_types, "record")

    if len(active_lis_name_list) > 0:
        radio_lis_thread_dict = report_failed_thread_names_build_dict(active_lis_name_list, all_threads_list, "listen")
        report_failed_thread_names_assert_dict(radio_lis_thread_dict, listen_desired_types, "listen")


def report_failed_thread_names_assert_dict(radio_thread_dict, desired_thread_types, action):
    # compare the dict with the desired list

    for radio_name, thread_type_list in radio_thread_dict.items():
        for item in desired_thread_types:
            if item not in thread_type_list:
                message = f'{radio_name}: Error.{action}.Thread.{item} crashed.'
                ghetto.GNet.dict_error[radio_name] = message
                print(message)


def report_failed_thread_names_build_dict(name_list, all_threads_list, action):
    # fill a dict with {radio(n): ["tail", "head", "meta"]}
    rec_radio_thread_list_dict = {}
    for radio_name in name_list:
        thread_list = []
        rec_radio_thread_list_dict[radio_name] = thread_list
        for thread_name in all_threads_list:
            if radio_name in thread_name:
                thread_Type = thread_name[len(thread_name)-4:]
                thread_action = thread_name[len(thread_name)-11:len(thread_name)-5]
                if thread_action == action:
                    rec_radio_thread_list_dict[radio_name].append(thread_Type)

    return rec_radio_thread_list_dict


def report_active_radio_threads():
    """return True if (any) radio threads are active, write True to ghettoApi.radio_active

    shows an active internet connection, also during playing local files
    routes.delete_info() collects from ghettoApi.radio_active for js
    """
    search_list = ["record", "listen"]
    for thread in threading.enumerate():
        for string in search_list:
            if string in thread.name:
                ghettoApi.radio_active = True
                return True
    ghettoApi.radio_active = False
    return False


def scenario_kill_thread(name_action_type_tuple):
    """fill a tuple to kill a specific thread (thread ends itself on match)

    a_tuple = (name, action, type)
    ('classic', 'record', 'meta')
    type: tail, head, meta
    action: record   # listen
    name:
    test run can test error msg string in html input box
    test if recording works, if same name radio listen thread is dead
    test record writing if metadata crash
    """
    ghettoTest.thread_killer = name_action_type_tuple


# ###### run scenario commands
# scenario_kill_thread(('br24', 'listen', 'meta'))
# scenario_kill_thread(('classic', 'record', 'tail'))
