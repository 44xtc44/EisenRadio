""" production server with random port assignment """
import sys
import random
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

port = random.randint(12488, 12974)    # random between two integers
app = wsgi.wsgi_app(port)

print('\n Python WSGI "Waitress" serves flask\n')


def main():
    serve(app, host='localhost', port=port)


if __name__ == "__main__":
    main()
