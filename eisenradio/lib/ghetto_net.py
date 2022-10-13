import ssl
import certifi
import urllib.request
from urllib.error import URLError, HTTPError
from eisenradio.api import ghettoApi

context_ssl = ssl.create_default_context(cafile=certifi.where())


class GNet:
    """ network test, content_type check
    Dictionaries:
        dict_error = {}  : display connection errors
        ghettoApi.init_ghetto_dict_error(dict_error)  : transfer information to api
        content_type_dict = {}  : a thread that holds the http server instance informs that server about file type
        bit_rate_dict = {} : bitrate from header, show that rate on startup for each radio beside the URL

    Methods:
        is_server_alive(url, str_radio) - filter out not responding server by calling 'load_url(url)'
        load_url(url)                   - returns status 200 if alive and ok
        stream_filetype_url(url, str_radio) - content-type for server is mapped to file suffix
    """
    dict_error = {}  # display connection errors in terminal and html
    ghettoApi.init_ghetto_dict_error(dict_error)  # transfer information to api (avoid circular imports) for html
    content_type_dict = {}  # a thread can review its content_type, not the suffix like mp3 {goa: "audio/mpeg"}
    bit_rate_dict = {}      # show bit rate on start, perhaps choose another, better stream

    @staticmethod
    def is_server_alive(url, str_radio):
        """ return True if server alive
        don't delete - urllib3 timeout=5, placebo, we have server up, but content not presented - zombie
        now use for all connections urllib
        """
        try:
            GNet.load_url(url)
        except HTTPError as error:
            print(f' ---> {str_radio} server failed: {error} , {url}')
            GNet.dict_error[str_radio] = f'{str_radio} radio: {error} {url}'
            return True
        except URLError as error:  # <urlopen error timed out>
            print(f' ---> {str_radio} server failed: {error} , {url}')
            GNet.dict_error[str_radio] = f'{str_radio} radio: {error} {url}'
            return False
        except Exception as error:
            print(f' ---> {str_radio} server exception: {error} , {url}')
            GNet.dict_error[str_radio] = f'{str_radio} radio: {error} {url}'
            return False
        return True

    @staticmethod
    def load_url(url):
        """returns status code 200 if ok, conn.getcode()
        use urllib, urllib3 causes response to wait "forever", timeout is not working on dead server
        """
        with urllib.request.urlopen(url, timeout=15, context=context_ssl) as response:
            return response.getcode()

    @staticmethod
    def stream_filetype_url(url, str_radio):
        """ return file suffix of the stream mapped from content-type
        GNet.content_type_dict[str_radio] stores the content-type, thread informs local http server which stream
        not called if the server failed before
        """
        try:
            with urllib.request.urlopen(url, timeout=15, context=context_ssl) as response:
                header_content = response.getheader('Content-Type')
        except Exception as ex:
            print(ex)
            return False

        stream_suffix = ''
        if header_content == 'audio/aacp' or header_content == 'application/aacp':
            stream_suffix = '.aacp'
        if header_content == 'audio/aac':
            stream_suffix = '.aac'
        if header_content == 'audio/ogg' or header_content == 'application/ogg':
            stream_suffix = '.ogg'
        if header_content == 'audio/mpeg':
            stream_suffix = '.mp3'
        if header_content == 'audio/x-mpegurl' or header_content == 'text/html':
            stream_suffix = '.m3u'
        # application/x-winamp-playlist , audio/scpls , audio/x-scpls ,  audio/x-mpegurl

        GNet.content_type_dict[str_radio] = header_content
        return stream_suffix

    @staticmethod
    def bit_rate_url(url, str_radio):
        """
        """
        try:
            with urllib.request.urlopen(url, timeout=15, context=context_ssl) as response:
                header_br = response.getheader('icy-br')
        except Exception as ex:
            print(ex)
            return False

        GNet.bit_rate_dict[str_radio] = header_br
        pass
        return header_br
