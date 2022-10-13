
import queue
import http.server


class TerminalRequestHandler(http.server.SimpleHTTPRequestHandler):
    """ tiny http server for command line, local data feed, run on localhost network
    showcase target:
        send any stream to a localhost port, buffer copy, content_type must be set, could be video (raw stream of jpeg)
        only one instance per port
        queue too small leads to short stops, too big to connection delay (time to fill the buffer, queue)
    """
    fifo_http_chunk_queue = queue.Queue(maxsize=7)
    content_type = "audio/mpeg"  # instance, will overwrite
    port = ""
    # port 1242 - 1270 free

    def do_GET(self):

        self.send_response(200)
        self.send_header("Content-type", self.content_type)  # instance will write its own
        self.send_header("Cache-Control", "no-cache, no-store")  # receiver must not buffer, nor store (up to browser)
        # browser accepts connection in localhost network without ssl (https)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        # this will be shown if a browser connects to us
        print('\t HTTP connection established.')
        if self.fifo_http_chunk_queue.full():
            print('\t Buffer queue filled max.')
        while 1:
            try:
                self.wfile.write(self.fifo_http_chunk_queue.get())
            except ConnectionAbortedError:
                # print(' \tlocal host connection aborted')
                self.close_connection = True
                break
            except Exception as e:
                print(e)
                self.close_connection = True
                break
            else:
                pass
