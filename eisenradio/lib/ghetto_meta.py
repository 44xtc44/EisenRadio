
import ssl
import time
import certifi
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from eisenradio.api import ghettoApi
context_ssl = ssl.create_default_context(cafile=certifi.where())


class GMeta:
    """

    Dictionaries:
        ghetto_measure = {}     - header information dump and request time measure
        ghettoApi.init_ghetto_measurements(ghetto_measure)
        current_song_dict = {}  - each thread writes the new title to the station key name {station : title}
        ghettoApi.init_current_song_dict(current_song_dict)

    Methods:
        metadata_request(url) - pull the metadata by telling server {'Icy-MetaData' "is" '1'}, get binary data content
        metadata_header_info(request, str_radio, request_time) - fill dict with header information to display values
        metadata_icy_info(request, str_radio) - return raw byte code metadata from radio
        metadata_get_display_extract(icy_info) - return cleaned up metadata tile
        metadata_get_display_info(icy_info) - extract readable title data to show it on html page
     """
    ghetto_measure = {}  # header information dump and request time measure
    ghettoApi.init_ghetto_measurements(ghetto_measure)
    current_song_dict = {}  # each thread writes the new title to the station key name {station : title}
    ghettoApi.init_current_song_dict(current_song_dict)

    @staticmethod
    def metadata_request(url):
        """ pull the metadata by telling server request.add_header('Icy-MetaData', '1'),
        get binary data block with metadata content
        """
        request = Request(url)
        request.add_header('Icy-MetaData', '1')
        response = urlopen(request, timeout=15, context=context_ssl)
        return response

    @staticmethod
    def metadata_header_info(request, str_radio, request_time):
        """ fill dict with header information to display values/information about radio on html page
        'GRecorder.ghetto_measure[str_radio + ',request_time']'
        """
        try:
            GMeta.ghetto_measure[str_radio + ',request_time'] = request_time
        except KeyError:
            pass
        try:
            GMeta.ghetto_measure[str_radio + ',suffix'] = request.headers['content-type']
        except KeyError:
            pass
        try:
            GMeta.ghetto_measure[str_radio + ",icy_br"] = request.headers["icy-br"]
        except KeyError:
            pass
        try:
            GMeta.ghetto_measure[str_radio + ",icy_name"] = request.headers["icy-name"]
        except KeyError:
            pass
        try:
            GMeta.ghetto_measure[str_radio + ",icy_genre"] = request.headers["icy-genre"]
        except KeyError:
            pass
        try:
            GMeta.ghetto_measure[str_radio + ",icy_url"] = request.headers["icy-url"]
        except KeyError:
            pass

    @staticmethod
    def metadata_icy_info(request, str_radio):
        """ returns raw byte code metadata from radio

        find start byte, convert to int, find out bytes to read, read block of bytes
        return a byte code error message on unknown error
        """
        try:
            icy_meta_int = int(request.headers['icy-metaint'])
            request.read(icy_meta_int)
            start_byte = request.read(1)
            start_int = ord(start_byte)
            num_of_bytes = start_int * 16
            metadata_content = request.read(num_of_bytes)
            return metadata_content
        except Exception as error:
            message = f'metadata_icy_info(), {str_radio}: no or false metadata; {error}'
            print(message)
            # caller expects byte
            return b"StreamTitle='GhettoRecorder module info\n" \
                   b"radio returns no or false metadata including title and stream url\n" \
                   b"radio service is active on url and port, since I am not crashed, check url part after port\n" \
                   b"recording without titles if stream is active at all';StreamUrl='';\x00\x00"

    @staticmethod
    def metadata_get_display_extract(icy_info):
        """ return cleaned up metadata tile """
        # StreamTitle='X-Dream - Panic In Paradise * anima.sknt.ru';StreamUrl='';
        try:
            title_list = icy_info.split(";")
            if not len(title_list) > 1 or title_list is None:
                return  # empty list
            title_list = title_list[0].split("=")
            title = str(title_list[1])
            title = GMeta.remove_special_chars(title)
            if title is not None:
                return title
        except IndexError:
            pass
        except OSError:
            pass
        return

    @staticmethod
    def metadata_get_display_info(icy_info):
        """ extract readable title data to show it on html page """
        # <class 'bytes'> decode to <class 'str'> actually b''
        try:
            title = GMeta.metadata_get_display_extract(icy_info.decode('utf-8'))
            if not title:
                return
            if title:
                return title
        except AttributeError:
            """AttributeError: Server sends no metadata; bool value instead"""
            return
        except Exception as error:
            print(f' Exception in metadata_get_display_info: {error}')
            return

    @staticmethod
    def metadata_stream_get(url, str_radio):
        """ return nothing, from request to clean current_song_dict, recorder "head" can build path with title now

        measures time of response to show network access time
        "metadata_header_info(response, str_radio, request_time)" - header info to show them on html page
        "metadata_icy_info(response, str_radio)"                    - call extraction of current title
        "metadata_get_display_info" - filters out title from unreliable and wrong metadata responses
        "current_song_dict[str_radio]" - cleaned current title stored in dict for radio as value
        """
        icy_info = ''
        try:
            start_time = time.perf_counter()
            response = GMeta.metadata_request(url)
            request_time = round((time.perf_counter() - start_time) * 1000)
            GMeta.metadata_header_info(response, str_radio, request_time)
            icy_info = GMeta.metadata_icy_info(response, str_radio)

        except HTTPError:
            pass
        except URLError:
            """url was checked in is_server_alive. assume short conn error"""
            pass
        except Exception as error:
            print(f' ---> metadata_main {str_radio}, exception info: {error} , {url}')
            pass

        title = GMeta.metadata_get_display_info(icy_info)
        if title:
            try:
                if title[0] == "'" and title[-1] == "'":
                    ghettoApi.current_song_dict[str_radio] = title[1:-1]  # |sequence, ex 0 and last char |0 |1 |²2
                else:
                    ghettoApi.current_song_dict[str_radio] = title
            except KeyError:
                pass
            except Exception as error:
                print(f' ---> metadata_get_display_info {str_radio}, exception info: {error} , {url}')
                pass

    @staticmethod
    def remove_special_chars(str_name):
        """ remove special characters for writing to file system """
        ret_value = str_name.translate({ord(string): "" for string in '"!@#$%^*()[]{};:,./<>?\\|`~=+"""'})
        return ret_value
