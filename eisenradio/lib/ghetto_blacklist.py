""" update a json dict file in intervals, like the eisenradio database
    Functions
    ---------
    start_ghetto_blacklist_writer_daemon() - run the thread for writing blacklists
    run_blacklist_writer()                 - loop to run 'update_radios_blacklists()'
    update_radios_blacklists()             - read blacklist file and update it if recorder got a new title
    skipped_in_session(radio)              - recorder refused to write blacklisted titles n-times

  interval of reading:     "recorder_new_title_dict[str_radio]" where recorder writes EVERY new title and
  recorder compare it with "ghettoApi.all_blacklists_dict[str_radio]"
  if new title is not found in 'all_blacklists_dict' on api, append title and dump the whole dict to disk
  if a title is 3min long, dump all 3min
 """
import time
import copy
import json
import threading
from eisenradio.api import ghettoApi


def start_ghetto_blacklist_writer_daemon():
    """get called to start a thread, "run_blacklist_writer()" runs until the end of app"""
    threading.Thread(name="ghetto_blacklist_writer", target=run_blacklist_writer, daemon=True).start()
    print(".. blacklist writer daemon started\n")


def run_blacklist_writer():
    """loop, read "recorder_new_title_dict" in api and update json dict file for next session plus
    'ghettoApi.all_blacklists_dict[str_radio]'
    """
    while not ghettoApi.stop_blacklist_writer:
        update_radios_blacklists()

        for _ in range(15):
            if ghettoApi.stop_blacklist_writer:
                break
            time.sleep(1)


def update_radios_blacklists():
    """
    * recorder_new_title_dict {radio(n): title}
    *     all_blacklists_dict {radio(n): [blacklist]}
    pseudo sample
    -------------
    recorder file dict :    recorder_new_title_dict['radio5'] = 'ASAP - I want to be part of the blacklist'
    recorder compares:          all_blacklists_dict['radio5'] = ['The Listies - I am on a list', 'OMG - Mee Too']
    comparison
    blacklist_writer: (is recorder_new_title_dict['radio5'] in all_blacklists_dict['radio5'] , table)
    write
    blacklist_writer: all_blacklists_dict['radio5'].append(recorder_new_title_dict['radio5'])
    """

    # make a copy of dict to prevent 'RuntimeError: dictionary changed size during iteration'
    recorder_dict_cp = copy.deepcopy(ghettoApi.recorder_new_title_dict)

    for radio, new_title in recorder_dict_cp.items():
        if new_title not in ghettoApi.all_blacklists_dict[radio]:
            ghettoApi.all_blacklists_dict[radio].append(new_title)
            print(f" -> blacklist {radio}: {new_title} [skipped {skipped_in_session(radio)}]")
    try:
        with open(ghettoApi.path_ghetto_blacklist, 'w') as writer:
            writer.write(json.dumps(ghettoApi.all_blacklists_dict, indent=4))  # no indent is one long line
    except OSError as error:
        msg = f"\n\t--->>> error in update_radios_blacklists(), can not create {error}"
        print(msg)


def skipped_in_session(radio):
    return len(ghettoApi.skipped_in_session_dict[radio])
