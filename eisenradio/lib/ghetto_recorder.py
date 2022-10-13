# 0.1.2a
##################################################################################
#   MIT License
#
#   Copyright (c) [2021] [René Horn]
#
#   Permission is hereby granted, free of charge, to any person obtaining a copy
#   of this software and associated documentation files (the "Software"), to deal
#   in the Software without restriction, including without limitation the rights
#   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#   copies of the Software, and to permit persons to whom the Software is
#   furnished to do so, subject to the following conditions:
#
#   The above copyright notice and this permission notice shall be included in all
#   copies or substantial portions of the Software.
#
#   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#   FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
#   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
#   SOFTWARE.
###################################################################################
"""
connections:
url is tested before the "real" connection to write error messages to a dict and html frontend
  content type, bitrate and playlist (some url may deliver only a playlist with real urls)
for every connection (rec or listen) is a second connection opened to ask every few seconds for metadata, aka title
asking for metadata in one stream leads to blocks of metadata in the datastream; digital noise and audio jumps
if a listen connection is opened and recording is activated a second connection is opened
this is four connections in sum for the radio, two streams, two metadata
buttons:
button status is written to dicts in Python,
url requests:
use urllib with certify and ssl imports plus ssl.create_default_context(cafile=certifi.where())
to avoid ssl errors on android and mac
"""
import io
import os
import ssl
import sys
import json
import queue
import shutil
import signal
import certifi
import threading
import socketserver
import urllib.parse
import urllib.request
import concurrent.futures
from time import sleep, strftime
from pathlib import Path as Pathlib_path
from urllib.request import urlopen, Request
from eisenradio.api import ghettoApi
from eisenradio.lib.ghetto_net import GNet
from eisenradio.lib.ghetto_meta import GMeta
import eisenradio.lib.ghetto_menu as ghetto_menu
import eisenradio.lib.ghetto_http_srv as ghetto_http_srv
import eisenradio.lib.ghetto_container as ghetto_container
import eisenradio.lib.ghetto_blacklist as ghetto_blacklist

# android ssl fix, mac seems to have same fun; used by urllib request functions
os.environ['SSL_CERT_FILE'] = certifi.where()   # used in flask __init__.py; worked in Android, but black box
context_ssl = ssl.create_default_context(cafile=certifi.where())   # works in Android for sure if used with urllib

# logging.basicConfig(level=logging.DEBUG, format='[%(levelname)s] (%(threadName)-10s) %(message)s',)
# logging.basicConfig(level=logging.INFO, format='[%(levelname)s] (%(threadName)-10s) %(message)s',)

version = '2.4'
print(f'ghettorecorder {version} (an Eisenradio module)')


class GBase:
    """base class attributes and utils methods,
    prefix <terminal_> is exclusively used for command line version (running ghetto_recorder.py)
    Attributes
    ----------
        terminal_radio_list = []  # all radios in settings.ini
        terminal_blacklist_name = "blacklist.json" - name blacklist
        terminal_http_server_avail_flag = True  - one thread may create the http server instance than switch off, False
        terminal_http_server_thread_name = ""    - name of the thread that owns the terminal_http_server_avail_flag
        terminal_run = False  - thread can look if we run in a terminal window, set in "terminal_main()"
        dict_exit = {}  - radio listen, record, metadata threads stop, html timer can also call {goa: true,...}
        radio_base_dir = ""  - html, eishome.set_radio_path(); terminal version set in ghetto_ini.py (circular import)

    Methods
    -------
        make_directory(path)            - make parent and subdirectories at once
        remove_special_chars(str_name)  - remove special characters for writing to file system
        this_time()                     - mark a recorded title if no metadata are available

    """
    # class attribute
    terminal_radio_list = []  # all radios in settings.ini "ghetto_menu.terminal_record_all_radios_get()"
    terminal_blacklist_name = "blacklist.json"
    # simple http server instance for terminal radio listening is created in g"_recorder_rec()" in one thread only
    terminal_http_server_avail_flag = True  # one thread may create the http server instance than switch off, False
    terminal_http_server_thread_name = ""  # name of the thread that owns the terminal_http_server_avail_flag
    terminal_run = False  # thread can look if we run in a terminal window, set in "terminal_main()"
    dict_exit = {}  # radio listen, record, metadata threads stop if listed, html timer can also call {goa: true,...}

    radio_base_dir = ""  # html, eishome.set_radio_path(); terminal version set it in ghetto_ini.py (circular import)

    def __init__(self, radio_base_dir=None, settings_path=None):
        self.instance_attr_time = 0
        self.trigger = False
        self.radio_base_dir = radio_base_dir
        self.settings_path = settings_path

    @staticmethod
    def make_directory(path):
        """ make parent and subdirectories at once

        Exception
        ---------
        make write error public
        """
        try:
            os.makedirs(path, exist_ok=True)
            print(f"Directory {path} created successfully.")
        except OSError as error:
            print(f"Directory {path} can not be created {error}.")

    @staticmethod
    def remove_special_chars(str_name):
        """ remove special characters for writing to file system """
        ret_value = str_name.translate({ord(string): "" for string in '"!@#$%^*()[]{};:,./<>?\\|`~=+"""'})
        return ret_value

    @staticmethod
    def this_time():
        """ mark a recorded title if no metadata are available """
        time_val = strftime("_%Y_%m_%d_%H.%M.%S")
        return time_val


class GRecorder:
    """ recorder
    Dictionaries:
        path_record_dict = {}    - {radio : //home//box/Download//hr3//Mittelstandskinder ohne Strom - kalt [Rmx]}
        start_write_command = {} - recorder head thread set command to start recording
        record_active_dict = {}  - button press true/false record / command line version writes also here
        listen_active_dict = {}  - button press true/false listen
        ghettoApi.init_ghetto_listen_active_dict(listen_active_dict) - transfer dict to api
        audio_stream_queue_dict = {} - chunks of data written to a radio key as value {radioB2: queue.Queue}
        # each radio has {key:val}; means {goa _audio: queue.Queue(maxsize=5), goa _audio_2: queue.Queue(maxsize=5)}
        # for later use if multiple streams from same radio server are loaded, needs interaction with naming the files
        ghettoApi.init_ghetto_audio_stream(audio_stream_queue_dict)
        recorder_new_title_dict = {}  - recorder splits path to get the clean title to compare with blacklist
        ghettoApi.init_ghetto_recorder_new_title(recorder_new_title_dict)
        skipped_in_session_dict = {}  - blacklist feature for html, shows skipped titles during recording session
        ghettoApi.init_ghetto_skipped_in_session_dict(skipped_in_session_dict)


    Methods:
        move to external module? = m;
        g_recorder_head(...) - thread loop, clean metadata from problematic chars, create file name and path for "tail"
        g_recorder_await_head(str_radio)         - g_recorder_tail() must wait to get first path/file name
        g_recorder_path_transfer_test(str_radio) - return if no valid path can be presented by 'g_recorder_await_head()'
        g_recorder_cache_the_file(str_radio, full_file_path, record_file, ghetto_recorder, stream_request_size):
        g_recorder_reset_file_offset(record_file) - seek(0) and truncate recorder file to start new record
        g_recorder_copy_file(full_file_path, ghetto_recorder, stream_request_size) - copy new recorded file
        g_recorder_remove_file(full_file_path, record_file) - del old if new file must be copied, no blacklist active
        g_recorder_record_trace(str_radio, full_file_path) - extract title from path, add to recorder_new_title_dict
        g_recorder_teardown(...) - close the recorder file and reset it to not abandon 100mb
        g_recorder_empty_queue(str_radio) - drain Html audio element, it will switch faster
        g_recorder_write_queue(str_radio, chunk) - listen endpoint queue, empty the Queue if full and write new
      m g_recorder_ask_bit_rate(url) - return bitrate from header
      m urllib.request.urlopen(url, timeout=15, context=context_ssl) - only for requesting the bitrate
      m g_recorder_calc_chunk_size(url) - return bitrate from header info of radio to adapt buffer size
        http_srv_object_create(str_radio) - return instance of 'TerminalRequestHandler', create a mini http server
        g_recorder_rec(...) - recorder loop return nothing
        record_write_first(chunk, record_file, suffix) - return first cleaned aac chunk after a title change
        record_write_last(chunk, record_file, suffix) - have to fix aac file end (clean cut) so title not stuck
      m record_acp_fff1_sync_word_tail(chunk) - aac repair clean cut at the end
      m record_acp_fff1_sync_word_header(chunk) - aac repair
      m g_recorder_request(url) - return the request object of the url, or False
        g_recorder_tail(...) - thread, dispatch record and listen action
        metadata_main(url, str_radio, str_action, str_type) - main function for metadata, title extract
      m playlist_m3u(str_radio, str_url) - return the first server of the playlist
        record_start_radio(...) - start threads for one radio daemon style, assign names for debugging
        record(str_radio, url, str_action) - return nothing, prepare environment for start of radio threads and start
        terminal_feed_record(radio_dict) - return nothing, start recording all radios that passed the online test
        resolve_playlist(str_radio, str_url) - return first url from a playlist 'GRecorder.playlist_m3u(str_radio, ...)'
        is_radio_online(str_radio, str_url) - return url if asked url was a play list, returns False if normal server
        terminal_main_thread_loop() - loop keeps main thread alive, killed via 'signal_handler()' strg+c
        terminal_custom_record_path_get() - return parent record dir if custom path is set, take it, else default
        terminal_test_record_server(str_radio, str_url) - return radio url, return nothing if offline
        terminal_remove_offline_radios(radio_terminal_dict) - delete offline radios from dict of desired radios
        terminal_write_blacklist(bl_path, bl_name) - write blacklist if not exists, else update it with new radio names
        terminal_populate_new_blacklist(path) - return True if first time populate the blacklist with empty lists
        terminal_update_blacklist(path) - return True if update existing blacklist json, read, load in dict
        terminal_blacklist_enable(blacklist_name) - prepare env for blacklist writer module to start and work easily
      m signal_handler(sig, frame) - Terminal: catch Keyboard Interrupt ctrl + c, "signal.signal()" instances listen

    need to make more use of ghettoApi to get this guy smaller and more readable; perhaps split api
    """
    path_record_dict = {}  # current title attached to the record path {station : file path}
    start_write_command = {}  # recorder head thread set command to start recording
    record_active_dict = {}  # button press true/false
    listen_active_dict = {}
    ghettoApi.init_ghetto_listen_active_dict(listen_active_dict)
    audio_stream_queue_dict = {}  # chunks of data written to a radio key as value {radioB2: queue.Queue} for endpoint
    # each radio can have {key:val}; means {goa _audio: queue.Queue(maxsize=5), goa _audio_2: queue.Queue(maxsize=5)}
    # for later use if multiple streams from same radio server are loaded, needs interaction with naming the files
    ghettoApi.init_ghetto_audio_stream(audio_stream_queue_dict)
    recorder_new_title_dict = {}  # recorder splits path to get the clean title to compare with blacklist
    ghettoApi.init_ghetto_recorder_new_title(recorder_new_title_dict)
    skipped_in_session_dict = {}  # blacklist feature for html, shows skipped titles during recording session
    ghettoApi.init_ghetto_skipped_in_session_dict(skipped_in_session_dict)

    @staticmethod
    def g_recorder_head(directory_save, stream_suffix, str_radio, str_action):
        """ return nothing, loop
        clean metadata from problematic characters for writing to file system, hopefully caught all
        create file name and path from current metadata for recorder (tail)
        create _incomplete string to mark first and last incomplete file
        """
        if str_action == "listen":
            return

        sleep(3)  # chance to get stream meta info, some radios do not send metadata or send garbage
        first_record = True

        display_info = ""
        while GRecorder.record_active_dict[str_radio] or not GBase.dict_exit[str_radio]:
            stream_info = ghettoApi.current_song_dict[str_radio]  # unknown_title, can be garbage

            if not display_info == stream_info:
                if not stream_info == "":
                    display_info = stream_info
                    stripped_info = GBase.remove_special_chars(stream_info)

                    if first_record:
                        fresh_file_path = os.path.join(directory_save, '_incomplete_' + stripped_info + stream_suffix)
                        GRecorder.path_record_dict[str_radio] = fresh_file_path
                        GRecorder.start_write_command[str_radio] = True
                        first_record = False
                    else:
                        fresh_file_path = os.path.join(directory_save, stripped_info + stream_suffix)
                        GRecorder.path_record_dict[str_radio] = fresh_file_path  # NEW PATH ... ... ...

            if not GRecorder.record_active_dict[str_radio] or GBase.dict_exit[str_radio]:
                break

            sleep(.1)

    @staticmethod
    def g_recorder_await_head(str_radio):
        """ recorder tail must wait to get file, path name from recorder head function """
        while not GBase.dict_exit[str_radio]:
            if GRecorder.start_write_command[str_radio]:
                break
            sleep(.1)

    @staticmethod
    def g_recorder_path_transfer_test(str_radio):
        """ called by recorder tail, recorder head function put path in dict, if path is not there for key, exit
        Raise:
            inform user on html, error occurred
            kill all radio threads to not introduce strange behaviour
        """
        try:
            file_path = GRecorder.path_record_dict[str_radio]
            return file_path
        except KeyError:
            ghettoApi.current_song_dict[str_radio] = '[{-_-}] ZZZzz zz z... Recorder Failure!'
            GBase.dict_exit[str_radio] = True  # all str_radio threads stop, major problem
            return False

    @staticmethod
    def g_recorder_cache_the_file(str_radio, full_file_path, record_file, ghetto_recorder, stream_request_size):
        """ recorder write to disk function
        blacklist enabled:
            skip writing, if title found in blacklist

        no blacklist:
            delete file and write new, if exists
        """
        # extract title from path and write to "recorder_new_title_dict"
        title = GRecorder.g_recorder_record_trace(str_radio, full_file_path)
        if ghettoApi.blacklist_enabled_global:
            if title not in ghettoApi.all_blacklists_dict[str_radio]:
                GRecorder.g_recorder_remove_file(full_file_path, record_file)
                GRecorder.g_recorder_copy_file(full_file_path, ghetto_recorder, stream_request_size)
                print(f'\n-WRITE->>> {str_radio}: {title}\n')
            else:
                print(f'\n-SKIP->>> {str_radio}: {title}\n')
                GRecorder.skipped_in_session_dict[str_radio].append(title)
        else:
            GRecorder.g_recorder_remove_file(full_file_path, record_file)
            GRecorder.g_recorder_copy_file(full_file_path, ghetto_recorder, stream_request_size)
            print(f'\n-write--> {str_radio}: {title}\n')

    @staticmethod
    def g_recorder_reset_file_offset(record_file):
        record_file.seek(0)
        record_file.truncate()

    @staticmethod
    def g_recorder_copy_file(full_file_path, ghetto_recorder, stream_request_size):
        """ copy recorder file to user file if file is bigger than one chunk of radio stream
        Raise:
            OSError on disk fail or folder not writeable
         """
        ghetto_size = os.path.getsize(ghetto_recorder)
        if int(ghetto_size) >= int(stream_request_size):
            try:
                shutil.copyfile(ghetto_recorder, full_file_path)
            except OSError as error:
                message = f' Exception in g_recorder_copy_file; error: {error}'
                print(message)
        else:
            print('Skip file - size is too small.')

    @staticmethod
    def g_recorder_remove_file(full_file_path, record_file):
        if os.path.exists(full_file_path):
            os.remove(full_file_path)
        record_file.flush()

    @staticmethod
    def g_recorder_record_trace(str_radio, full_file_path):
        """extract the clean file name (path build in recorder 'head') from path string,

        remove file extension (.suffix), keep name
        add to recorder_new_title_dict[radio], blacklist writer can compare existing titles with this one
        """
        head, tail = os.path.split(full_file_path)
        tail_list = tail.split('.')
        title = tail_list[0]

        GRecorder.recorder_new_title_dict[str_radio] = title
        return title

    @staticmethod
    def g_recorder_teardown(str_radio, record_file, ghetto_recorder):
        """ return nothing, try a graceful copy, mark files incomplete
        low level file action to close the recorder file and reset it, to not abandon 100mb

        Args:
            str_radio       : radio name
            ghetto_recorder : name of the recorder file in OS syntax, needed in if clause to copy to physical path
            record_file     : alias of with statement for writing to recorder file

        OSError on disk fail or folder not writeable
        """
        head, tail = os.path.split(GRecorder.path_record_dict[str_radio])
        incomplete_title = "_incomplete_" + tail
        last_title = os.path.join(head, incomplete_title)
        try:
            shutil.copyfile(ghetto_recorder, last_title)
        except OSError:
            pass
        print(f" ..%-10s\t last file: {last_title}" % str_radio)

        record_file.seek(0)
        record_file.truncate()
        record_file.flush()
        record_file.close()

    @staticmethod
    def g_recorder_empty_queue(str_radio):
        """ try draining the Html audio element, it will switch faster, I guess, I wish ;) """
        while not GRecorder.audio_stream_queue_dict[str_radio + ',audio'].empty():
            GRecorder.audio_stream_queue_dict[str_radio + ',audio'].get()

    @staticmethod
    def g_recorder_write_queue(str_radio, chunk):
        """empty the Queue if full and write

        queue runs full if browser leaves page and html audio element no longer pulls audio chunks
        less digital noise on reconnect
        """
        if GRecorder.audio_stream_queue_dict[str_radio + ',audio'].full():
            GRecorder.g_recorder_empty_queue(str_radio)
        GRecorder.audio_stream_queue_dict[str_radio + ',audio'].put(chunk)

    @staticmethod
    def g_recorder_ask_bit_rate(url):
        """ return bitrate from header
        Method:
            urllib.request.urlopen(url, timeout=15, context=context_ssl) - only for requesting the bitrate

        Raise:
            correct mis configured values
            if all goes wrong, return a predefined value
        """
        try:
            with urllib.request.urlopen(url, timeout=15, context=context_ssl) as response:
                bit_rate = response.getheader('icy-br')
                try:
                    if int(bit_rate) % 1 == 0:
                        return bit_rate
                except ValueError:
                    # got server with '128, 128' and 64, 64 http://live02.rfi.fr/rfienvietnamien-64.mp3
                    print(f'g_recorder_ask_bit_rate ValueError: {bit_rate} {url}')
                    try:
                        bit_rate_list = bit_rate.split(',')
                        this_rate = bit_rate_list[0].strip()
                        if int(this_rate) % 1 == 0:
                            print(f'g_recorder_ask_bit_rate use: {this_rate} for {url}')
                            return this_rate
                    except Exception as error:
                        message = f'use fallback rate 128, error {error}'
                        print(message)
                        return 128
        except Exception as ex:
            print(ex)
            return 128

    @staticmethod
    def g_recorder_calc_chunk_size(url):
        """ return bitrate from header info of radio to adapt buffer size

        avoid digital noise, delays and connection breaks
        buffer too small introduces stops, buffer too big endless delay on radio connect (fill buffer)
        """
        stream_chunk_size = io.DEFAULT_BUFFER_SIZE * 4  # 8KB * x; HQ audio 320kB/s
        if GRecorder.g_recorder_ask_bit_rate(url):
            bit_rate = int(GRecorder.g_recorder_ask_bit_rate(url))
            if bit_rate <= 80:
                stream_chunk_size = io.DEFAULT_BUFFER_SIZE
            if (bit_rate > 80) and (bit_rate <= 160):
                stream_chunk_size = io.DEFAULT_BUFFER_SIZE * 2
            if (bit_rate > 160) and (bit_rate <= 240):
                stream_chunk_size = io.DEFAULT_BUFFER_SIZE * 3
        return stream_chunk_size

    @staticmethod
    def http_srv_object_create(str_radio):
        """ return instance of 'TerminalRequestHandler', create a mini http server
        only in command line mode

        grab the instance and set GBase.terminal_http_server_avail_flag = False
        GBase.terminal_run = False  recorder thread can look if we run in a terminal window
        all threads try to capture the flag, winner should be the first radio selected in menu
        """
        handler_http_srv_object = ""
        if GBase.terminal_run:
            if GBase.terminal_http_server_avail_flag:
                # we are first, take the flag, create the http server instance and deliver
                GBase.terminal_http_server_avail_flag = False
                GBase.terminal_http_server_thread_name = str_radio
                # Create http server thread for local listening from record stream for "ONE" recorder, first one
                # set the handler = instance
                handler_http_srv_object = ghetto_http_srv.TerminalRequestHandler  # class name of the server
                port = 1242
                handler_http_srv_object.port = port
                terminal_radio_server = socketserver.TCPServer(("", port), handler_http_srv_object)
                threading.Thread(target=terminal_radio_server.serve_forever, name="mr_friendly", daemon=True).start()
                handler_http_srv_object.content_type = GNet.content_type_dict[str_radio]
                print(f"local HTTP server instance loaded. Content-Type {GNet.content_type_dict[str_radio]} "
                      f"\nlisten {str_radio} on http://localhost:{port}")
            return handler_http_srv_object

    @staticmethod
    def g_recorder_rec(request, str_radio,
                       ghetto_recorder, stream_chunk_size,
                       full_file_path, suffix):
        """ recorder loop return nothing

        must recognize change in metadata to work on header and tail of aac file datastructure, is cut out of the stream
        Functions
        ---------
        handler_http_srv_object - "try" to create an instance of GRecorder.http_srv_object_create(str_radio)

            on title change
            ---------------
            GRecorder.record_write_last            - last chunk of title must be cleaned if aac file
            GRecorder.g_recorder_cache_the_file    - store the concatenated chunks since last title change, copy
            GRecorder.g_recorder_reset_file_offset - cleanup of recorder file, reset seek(), file to zero bytes
            full_file_path = GRecorder.path_record_dict[str_radio] - set new file path to copy title (file name)

            title grabbing
            --------------
             new_chunk = request.read(stream_chunk_size) - store the current chunk in var to copy to recorder and http
             record_file.write(new_chunk)                                 - write to recorder file
             handler_http_srv_object.fifo_http_chunk_queue.put(new_chunk) - feed http server buffer

             loop exit
             ---------
             GRecorder.g_recorder_teardown(str_radio, record_file, ghetto_recorder)
               clean up, mark and copy incomplete file, reset recorder file to zero

             Exception
             ---------
             Network errors occurred in reality,
             prepare for temporary local network card failure
             write message to analyze
        """
        handler_http_srv_object = GRecorder.http_srv_object_create(str_radio)
        new_chunk = ""
        with open(ghetto_recorder, 'wb') as record_file:
            while 1:

                if not full_file_path == GRecorder.path_record_dict[str_radio]:
                    # new file found, clean old aac file tail, is blacklisted?, reset recorder file, clean new aac head
                    GRecorder.record_write_last(request.read(stream_chunk_size), record_file, suffix)
                    GRecorder.g_recorder_cache_the_file(str_radio,
                                                        full_file_path,
                                                        record_file,
                                                        ghetto_recorder,
                                                        stream_chunk_size)
                    GRecorder.g_recorder_reset_file_offset(record_file)
                    try:
                        GRecorder.record_write_first(request.read(stream_chunk_size), record_file, suffix)
                    except (ConnectionResetError, OSError) as error:
                        msg = f"{str_radio} g_recorder_rec() {error}"
                        print(msg)
                    except Exception as error:
                        msg = f"{str_radio} g_recorder_rec() {error}"
                        print(msg)
                    full_file_path = GRecorder.path_record_dict[str_radio]
                else:
                    # chunk via urllib
                    try:
                        new_chunk = request.read(stream_chunk_size)
                    except (ConnectionResetError, OSError) as error:
                        msg = f"{str_radio} g_recorder_rec() {error}"
                        print(msg)
                    except Exception as error:
                        msg = f"{str_radio} g_recorder_rec() {error}"
                        print(msg)
                    # fill current file, write chunk to it
                    record_file.write(new_chunk)
                    # if we are owner of the http server
                    if GBase.terminal_http_server_thread_name == str_radio:
                        # chunk to http server, if buffer full remove one segment and put new, else server can stop
                        if handler_http_srv_object.fifo_http_chunk_queue.full():
                            handler_http_srv_object.fifo_http_chunk_queue.get()
                        handler_http_srv_object.fifo_http_chunk_queue.put(new_chunk)

                if not GRecorder.record_active_dict[str_radio] or GBase.dict_exit[str_radio]:  # timer dict_exit
                    GRecorder.g_recorder_teardown(str_radio, record_file, ghetto_recorder)
                    break

    @staticmethod
    def record_write_first(chunk, record_file, suffix):
        """ return first head cleaned aac chunk after a title change, else first dirty normal chunk """
        if suffix == ".aacp" or suffix == ".aac":
            acp_header = GRecorder.record_acp_fff1_sync_word_header(chunk)
            if acp_header is not None:
                record_file.write(acp_header)
        else:
            # ('write first chunk of new file')
            record_file.write(chunk)

    @staticmethod
    def record_write_last(chunk, record_file, suffix):
        """have to fix aac file end (clean cut) so title not stuck in a playlist"""
        if suffix == ".aacp" or suffix == ".aac":
            # ('write cleaned file tail')
            acp_tail = GRecorder.record_acp_fff1_sync_word_tail(chunk)
            if acp_tail is not None:
                record_file.write(acp_tail)
        else:
            # ('last normal chunk of current file')
            record_file.write(chunk)

    @staticmethod
    def record_acp_fff1_sync_word_tail(chunk):
        """clean cut at the end, cut out the last bytes starting with ff f1 (if not, result is a defective payload),

        so browser do not stop with silent error and will play next file
        Exception
        ---------
        real world error occurred (ValueError: non-hexadecimal number found in fromhex() arg at position 64805)
        work against it, to not break the flow
        """
        hex_chunk = chunk.hex()
        start, end = -1, -5
        search_string = "fff1"
        while 1:
            if end < -(len(hex_chunk)):
                break
            if hex_chunk[end:start] == search_string:
                # return bytes before end variable
                try:
                    return bytes.fromhex(hex_chunk[:end])
                # ValueError: non-hexadecimal number found in fromhex() arg at position 64805
                except ValueError:
                    return
                except Exception as error:
                    message = f'unknown error in record_acp_fff1_sync_word_tail(), {error} ignore it.'
                    print(message)
                    return
            start -= 1
            end -= 1
        return

    @staticmethod
    def record_acp_fff1_sync_word_header(chunk):
        """cut files out of the stream on metadata change, so the end of a file is not likely the correct start for new

        search aacp (acp plus) frame start sequence to clean the file so browser do not stop with silent error
        convert byte stream to hex, search ff f1 index_of_chunk[0] to index_of_chunk[4]
        shift the search frame in hex to right, cut out from start and return as bytes
        Exception
        ---------
        error occurred in Tail, but be prepared
        real world error occurred (ValueError: non-hexadecimal number found in fromhex() arg at position 64805)
        work against it, to not break the flow
        """
        hex_chunk = chunk.hex()
        start, end = 0, 4
        search_string = "fff1"
        while 1:
            if end > len(hex_chunk):
                break
            if hex_chunk[start:end] == search_string:
                # return bytes slice from shifted start to the end of chunk
                try:
                    return bytes.fromhex(hex_chunk[start:])
                except ValueError:
                    return
                except Exception as error:
                    message = f'unknown error in record_acp_fff1_sync_word_header(), {error} ignore it.'
                    print(message)
                    return
            start += 1
            end += 1
        return

    @staticmethod
    def g_recorder_request(url):
        """" return the request object of the url, or False
        url was tested in Gnet with "urllib" and context (SSL) manager
        Exception
        ---------
        this is the main request to 'dock' to the radio server
        we want to know why and when the connection was broken
        """""
        try:
            request = urllib.request.urlopen(url, timeout=3000, context=context_ssl)
            return request
        except Exception as error:
            print(error)
            return False

    @staticmethod
    def g_recorder_tail(url, str_radio, path_to_save, suffix, str_action):
        """ return nothing,  dispatch record and listen action
        Functions
        ---------
            GRecorder.g_recorder_request(url) - open the radio data connection and return the response object
            record
            ------
                GRecorder.g_recorder_await_head(str_radio)          - rec head function gives start for rec tail, this
                GRecorder.g_recorder_path_transfer_test(str_radio)  - exit if head can not get a valid path, fail
                GRecorder.g_recorder_rec(... )                      - call the recorder and present the response object
            listen
            ------
                loop
                GRecorder.g_recorder_write_queue(...) - feed the buffer dictionary for html audio element endpoints
                break
                -----
                    GRecorder.g_recorder_empty_queue(str_radio) - remove all buffer from queue to drain audio element
        """
        audio_stream_queue = queue.Queue(maxsize=5)  # for safety if listen and browser disconnects (no get - pull)
        stream_chunk_size = GRecorder.g_recorder_calc_chunk_size(url)

        GRecorder.audio_stream_queue_dict[str_radio + ',audio'] = audio_stream_queue
        ghetto_recorder = os.path.join(path_to_save, '__ghetto_recorder' + str(suffix))
        request = GRecorder.g_recorder_request(url)

        if str_action == "record":
            GRecorder.g_recorder_await_head(str_radio)
            full_file_path = GRecorder.g_recorder_path_transfer_test(str_radio)
            if not full_file_path:
                print(f'{str_radio} Recorder can not get filepath')
                return

            GRecorder.g_recorder_rec(request,
                                     str_radio,
                                     ghetto_recorder,
                                     stream_chunk_size,
                                     full_file_path,
                                     suffix)

        if str_action == "listen":
            while 1:
                GRecorder.g_recorder_write_queue(str_radio, request.read(stream_chunk_size))

                if not GRecorder.listen_active_dict[str_radio] or GBase.dict_exit[str_radio]:
                    GRecorder.g_recorder_empty_queue(str_radio)
                    break

    @staticmethod
    def metadata_main(url, str_radio, str_action):
        """ return nothing, main function for metadata, title extraction
         """
        while 1:
            GMeta.metadata_stream_get(url, str_radio)
            for sec in range(2):
                if str_action == "listen":
                    if GBase.dict_exit[str_radio] or not GRecorder.listen_active_dict[str_radio]:
                        break
                if str_action == "record":
                    if GBase.dict_exit[str_radio] or not GRecorder.record_active_dict[str_radio]:
                        break
                sleep(1)

    @staticmethod
    def playlist_m3u(str_radio, str_url):
        """ return the first server of the playlist
        Raise:
            we want to know why and when the connection was broken
        """
        try:
            request = Request(str_url)
            response = urlopen(request, timeout=15, context=context_ssl)

        except Exception as ex:
            print(ex)
        else:
            file = response.read().decode('utf-8')

            m3u_lines = file.split("\n")
            # print(' \n    m3u_lines    ' + file)
            m3u_lines = list(filter(None, m3u_lines))  # remove empty rows
            m3u_streams = []
            for row_url in m3u_lines:
                if row_url[0:4].lower() == 'http'.lower():
                    m3u_streams.append(row_url)  # not to lower, double hit :)

            if len(m3u_streams) > 1:
                print(f' {str_radio} Have more than one server in playlist_m3u. !!! Take first stream available.')
                play_server = m3u_streams[0]
                return play_server
            if m3u_streams:
                print(f' {str_radio} - one server found in playlist_m3u')
                play_server = m3u_streams[0]
                return play_server
            if not m3u_streams:
                print(f' {str_radio} - no Server found in playlist_m3u!')
                return False


def record_start_radio(str_radio, url, stream_suffix, dir_save, str_action):
    """ return nothing, start threads for one radio daemon style, assign names for debugging
    if listen action, thread for "head" will exit on first run, not needed
    """
    threading.Thread(name=str_radio + '_' + str_action + "_head", target=GRecorder.g_recorder_head,
                     args=(dir_save, stream_suffix, str_radio, str_action),
                     daemon=True).start()
    threading.Thread(name=str_radio + '_' + str_action + "_tail", target=GRecorder.g_recorder_tail,
                     args=(url, str_radio, dir_save, stream_suffix, str_action),
                     daemon=True).start()
    threading.Thread(name=str_radio + '_' + str_action + "_meta", target=GRecorder.metadata_main,
                     args=(url, str_radio, str_action),
                     daemon=True).start()


def record(str_radio, url, str_action):
    """ return nothing, prepare environment for start of radio threads and start 'em

    server was tested alive, but network errors are common
    Methods
    -------
        GNet.stream_filetype_url(url, str_radio) - return file type of stream, exit the radio on error

    Dictionaries
    ------------
        GRecorder.current_song_dict[str_radio]       - rec, "unknown_title" first file name; listen, "" first title
        GRecorder.start_write_command[str_radio]     - if recorder "head" is ready set True
        GRecorder.skipped_in_session_dict[str_radio] - skipped titles during session for EisenRadio html info
        GBase.dict_exit[str_radio]                   - True for thread exit its loop

        Exception
        ---------
        a radio changed the endpoint, responded ok but without content-type, no problem
        next radio send bool value, raised TypeError
        do a clean exit
     """
    GNet.bit_rate_url(url, str_radio)                         # bit rate stored in a dict, GNet.bit_rate_dict
    stream_suffix = GNet.stream_filetype_url(url, str_radio)  # server was tested alive but this is only half true
    try:
        if not stream_suffix:
            print(f"\n---> error {str_radio}: record(), no content-type {stream_suffix}"
                  f"\nServer alive but wrong endpoint\nCheck URL! - Exit")
            return
    except TypeError as error:
        print(f"\n---> error {str_radio}: record(), no content-type {error} - Exit")
        return
    if str_action == "record":
        ghettoApi.current_song_dict[str_radio] = 'unknown_title' + GBase.this_time()
        GRecorder.start_write_command[str_radio] = False
        GRecorder.skipped_in_session_dict[str_radio] = []  # blacklist must be enabled to work
    if str_action == "listen":
        ghettoApi.current_song_dict[str_radio] = ""

    GBase.dict_exit[str_radio] = False
    # GBase.radio_base_dir set for html in eishome.set_radio_path(), and here terminal, if active
    if GBase.terminal_run:
        GBase.radio_base_dir = terminal_custom_record_path_get()
    dir_save = os.path.join(GBase.radio_base_dir, str_radio)
    record_start_radio(str_radio, url, stream_suffix, dir_save, str_action)
    print(f".. run .. {str_radio}  {url} [{GNet.bit_rate_dict[str_radio]} kB/s]")


def terminal_feed_record(radio_dict):
    """ return nothing, start recording all radios that passed the online test

     GRecorder.record_active_dict[str_radio] = True, Eisenradio package write recorder button down, so we do
     GRecorder.record_active_dict[str_radio] = False, recorder use it as one of the termination events
     call record(str_radio, str_url, "record") with "record" action, Eisenradio uses also "listen" action
     """
    for str_radio, str_url in radio_dict.items():
        if str_radio not in GNet.dict_error.keys():
            GRecorder.record_active_dict[str_radio] = True
            record(str_radio, str_url, "record")


def resolve_playlist(str_radio, str_url):
    """ return first url from a playlist 'GRecorder.playlist_m3u(str_radio, str_url)' """
    url = GRecorder.playlist_m3u(str_radio, str_url)
    return url


def is_radio_online(str_radio, str_url):
    """return url, if input url was a play list; return False if server offline, https://streams.br.de/bayern1obb_2.m3u

    delete errors from dict to write new if any
    GNet.is_server_alive() writes in error dict "GNet.dict_error[str_radio]" if server fails
    called by eishome.dispatch_record_is_alive
    """
    if str_radio in GNet.dict_error.keys():
        del GNet.dict_error[str_radio]

    if str_url[-4:] == '.m3u' or str_url[-4:] == '.pls':  # or url[-5:] == '.m3u8' or url[-5:] == '.xspf':
        resolved_url = resolve_playlist(str_radio, str_url)
        str_url = resolved_url

    if GNet.is_server_alive(str_url, str_radio):
        return str_url
    return False


def terminal_main_thread_loop():
    """ loop keeps main thread alive, killed via 'signal_handler()' strg+c"""
    while 1:
        sleep(1)


def terminal_custom_record_path_get():
    """ return a path for parent record dir
     If a custom path is set take it, else use default path
     """
    custom_path = ghetto_menu.terminal_record_global_custom_path_get()
    if not custom_path:
        path = ghetto_menu.terminal_record_radio_base_dir_get()
    else:
        path = custom_path
    return path


def terminal_test_record_server(str_radio, str_url):
    """ return radio url, return nothing if offline
     input url is playlist, download file and convert url to first playlist url
     a True returns always a normal url
    """
    radio_url = is_radio_online(str_radio, str_url)
    if radio_url:
        return radio_url
    return


def terminal_remove_offline_radios(radio_terminal_dict):
    """ return nothing, delete offline radios from dict of desired radios

    prepare lists as arguments for map()
      threaded execution with argument list in correct order,
      execution time is only dependent on max timeout of request, if timeout is 15, the list needs 15s to return +-

    the argument dict may contain playlist urls, which must be resolved to one normal url
    "url_online_list" contains only resolved urls, update the argument dict with those
    delete key:value pairs from argument dict where "None" (radio offline) is found in url_online_list
    """
    radio_list = [radio_name for radio_name in radio_terminal_dict.keys()]
    url_list = [url for url in radio_terminal_dict.values()]

    with concurrent.futures.ThreadPoolExecutor() as executor:
        url_online_list = list(executor.map(terminal_test_record_server, radio_list, url_list))

    # rewrite values in radio_terminal_dict, because playlist server have now real urls
    for i, name in enumerate(radio_list):
        radio_terminal_dict[name] = url_online_list[i]

    offline_list = []
    for i, name in enumerate(url_online_list):
        if name is None:
            # from list of radios of dictionary for map()
            radio = radio_list[i]
            offline_list.append(radio)

    for offline_radio in offline_list:
        del radio_terminal_dict[offline_radio]


def terminal_write_blacklist(bl_path, bl_name):
    """ return True on success,
    write blacklist if not exists, else update it with new radio names
    """
    path = os.path.join(bl_path, bl_name)
    if not Pathlib_path(path).is_file():
        if terminal_populate_new_blacklist(path):
            return True
        return False
    else:
        if terminal_update_blacklist(path):
            return True
        return False


def terminal_populate_new_blacklist(path):
    """ return True if first time populate the blacklist with empty lists
    add new radios to the list, if list already exists

    Exception
    ---------
    make write error public
    """
    actual_radio_list = ghetto_menu.terminal_record_all_radios_get()
    first_key = 'GhettoRecorder message'
    first_msg = 'A json formatted dictionary. Remove titles you want again.'
    radio_bl_dict = {first_key: [first_msg]}
    for name in actual_radio_list:
        radio = GBase.remove_special_chars(name)
        radio_bl_dict[radio] = ['GhettoRecorder - ¿qué pasa?']
    try:
        with open(path, 'w') as writer:
            writer.write(json.dumps(radio_bl_dict, indent=4))  # no indent is one long line
    except OSError as error:
        msg = f"\n\t--->>> error in terminal_populate_new_blacklist(), can not create {error}"
        print(msg)
        return False
    return True


def terminal_update_blacklist(path):
    """ return True if update existing blacklist json
    read, load in dict, compare with actual settings.ini,
    update loaded dict, write dict

    Exception
    ---------
    make write error public
    """
    actual_radio_list = ghetto_menu.terminal_record_all_radios_get()
    with open(os.path.join(path), "r") as reader:
        bl_json_dict = reader.read()
    loaded_dict = json.loads(bl_json_dict)
    for name in actual_radio_list:
        if name not in loaded_dict.keys():
            radio = GBase.remove_special_chars(name)
            loaded_dict[radio] = ['GhettoRecorder - ¿qué pasa?']
    try:
        with open(path, 'w') as writer:
            writer.write(json.dumps(loaded_dict, indent=4))  # no indent is one long line
    except OSError as error:
        msg = f"\n\t--->>> error in terminal_update_blacklist(), can not create {error}"
        print(msg)
        return False
    return True


def terminal_blacklist_enable(blacklist_name):
    """ prepare env for blacklist writer module to start and work easily

     get directory of config file to put blacklist in the same directory
     call to write a new or update an existing blacklist with radios from config file
     loads the reader json string from written file into the blacklist dictionary
     writes the blacklist file name to the api, blacklist writer can update file
     starts the blacklist writer daemon
     """
    settings_dir = ghetto_menu.terminal_record_settings_dir_get()
    blacklist_written = terminal_write_blacklist(settings_dir, blacklist_name)
    if blacklist_written:
        # return also ok if file exists
        with open(os.path.join(settings_dir, blacklist_name), "r") as reader:
            bl_json_dict = reader.read()
        # write dict to api, each recorder can compare titles of its radio, convert string to dict
        ghettoApi.all_blacklists_dict = json.loads(bl_json_dict)
        ghettoApi.init_path_ghetto_blacklist(os.path.join(settings_dir, blacklist_name))
        ghetto_blacklist.start_ghetto_blacklist_writer_daemon()
    return


def signal_handler(sig, frame):
    """ Terminal: catch Keyboard Interrupt ctrl + c, "signal.signal()" instances listen
     fill the exit dict for the threads to end their loops itself (they look all few sec in this dict)
     GBase.dict_exit[str_radio]
     GRecorder.record_active_dict[radio]
     """
    for radio in GBase.terminal_radio_list:
        GRecorder.record_active_dict[radio] = False
        GBase.dict_exit[radio] = True
    ghettoApi.stop_blacklist_writer = True
    print(' <<>> Stop recording in a few seconds, cleanup ...')
    sleep(5)
    print('\nThank you for using the GhettoRecorder module.')
    sys.exit(0)


signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)


def terminal_main():
    """ terminal version (GhettoRecorder package) with a menu, settings.ini and blacklist, no database
    functions for command line start with <terminal_>

    Modules for terminal command line, THE GhettoRecorder:
    -------
    ghetto_blacklist.py - blacklist writer updates json file and ghettoApi for recorder to find old titles'
    ghetto_container.py - prepare for user interaction in container env
    ghetto_help.py      - ?, want to push all help to "readthedocs" website
    ghetto_ini.py       - reads, updates sections ([GLOBAL]) in settings.ini config file
    ghetto_menu.py      - display config file content, calls ghetto_ini to update settings for path and blacklist
    ghetto_recorder.py  - main module, GBase.radio_base_dir pulled from ghetto_ini to avoid circular import
    ghettoApi           - reuse methods of Eisenradio to avoid import problems, push blacklist name ..., __init__.py
    settings.ini        - configuration file

    Container:
    ----------
    the Python package is already deployed in a docker or snap container, prepare for user interaction

    Threads:
    --------
    metadata thread extracts titles in intervals,
    head, cleans' metadata, adds timestamp if no metadata, provides the full path, gives recorder start command,
    tail, recorder feeds http server, cleans aac/aacp segments and writes stream segments as a file

    Blacklist:
    ----------
    Name, "blacklist.json", a json dictionary
    "ghettoApi.all_blacklists_dict[str_radio]" - update_radios_blacklists()" feeds api with the blacklist for each radio
    "ghettoApi.blacklist_enabled_global" - blacklist_enabled, is set in terminal_main(), if set recorder refuses to copy

    Info:
    -----
    Recorder "g_recorder_cache_the_file()" (copy file, reset seek recorder file) looks if blacklist feature is enabled
    "ghettoApi.blacklist_enabled_global"
    then it looks if title is not in its blacklist
    "ghettoApi.all_blacklists_dict[str_radio]" {'goa_psy': ['_incomplete_Midi Rico - Explosions Wackier animaskntru'],}
    """
    radio_terminal_dict = {}
    GBase.terminal_run = True  # we run in a terminal window
    blacklist_dict = GBase.terminal_blacklist_name
    is_container, default_path = ghetto_container.container_setup_use()
    if is_container:
        print(f"..created default record path for container,"
              f"\ncopied settings.ini to that path {default_path}")
    # show main menu and collect radios or update config file, if record is selected we proceed
    ghetto_menu.menu_main()
    radio_terminal_dict = ghetto_menu.record_read_radios()
    terminal_remove_offline_radios(radio_terminal_dict)

    record_with_blacklist = ghetto_menu.terminal_record_blacklist_enabled_get()
    blacklist_enabled = True if record_with_blacklist.lower() == "true" else False
    ghettoApi.blacklist_enabled_global = True if blacklist_enabled else False
    if blacklist_enabled:
        terminal_blacklist_enable(blacklist_dict)

    # radio_base_dir for terminal mode set in record()
    terminal_feed_record(radio_terminal_dict)
    terminal_main_thread_loop()


if __name__ == '__main__':
    # command line version; write:python ghetto_recorder.py
    terminal_main()
