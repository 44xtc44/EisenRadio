""" production server with random port assignment """
import sys
import socket
# import random
from os import path
from waitress import serve
from eisenradio import wsgi

this_dir = path.abspath(path.join(path.dirname(__file__)))
api_dir = path.abspath(path.join(path.dirname(__file__),   'api'))
home_dir = path.abspath(path.join(path.dirname(__file__),  'eisenhome'))
utils_dir = path.abspath(path.join(path.dirname(__file__), 'eisenutils'))
instance_dir = path.abspath(path.join(path.dirname(__file__), 'instance'))
lib_dir = path.abspath(path.join(path.dirname(__file__),   'lib'))
sys.path.append(path.abspath(this_dir))
sys.path.append(path.abspath(api_dir))
sys.path.append(path.abspath(home_dir))
sys.path.append(path.abspath(utils_dir))
sys.path.append(path.abspath(instance_dir))
sys.path.append(path.abspath(lib_dir))

# port = random.randint(12488, 12974)    # random between two integers
port = 5050
print('\n Python WSGI "Waitress" serves flask\n')


def is_port_occupied(srv_port: int) -> bool:
    """The error indicator is 0 if the operation succeeded, otherwise return the value of the errno variable.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', srv_port)) == 0


def main():
    global port

    while 1:
        if not is_port_occupied(port):
            app = wsgi.wsgi_app(port)  # transfer port num info to flask (for audio endpoint ...:5050/sound/starFM)
            serve(app, host='localhost', port=port)
            break
        else:
            print(f'serverPort in use {port}')
            print('\n\tadd one to port number')
            port += 1


if __name__ == "__main__":
    main()
