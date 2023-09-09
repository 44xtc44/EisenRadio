"""FLASK server on port 5050.
Get a good observation of html connections.
WAITRESS wsgi server can run on a random port - wsgi.py.
"""
import sys
import socket
import eisenradio
from os import path

# flask wants its config
instance_dir = path.abspath(path.join(path.dirname(__file__), 'instance'))
sys.path.append(path.abspath(instance_dir))
port = 5050


def is_port_occupied(srv_port: int) -> bool:
    """The error indicator is 0 if the operation succeeded, otherwise return the value of the errno variable.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', srv_port)) == 0


def main():
    global port
    while 1:
        if not is_port_occupied(port):
            app = eisenradio.create_app(port)  # transfer port num info to flask (audio endpoint ...:5050/sound/starFM)
            app.run('localhost', port)
            break
        else:
            print(f'Port in use: {port} \n\tadd one to port number')
            port += 1


if __name__ == "__main__":
    main()
