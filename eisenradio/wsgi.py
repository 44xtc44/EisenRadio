import sys
from os import path
from eisenradio import create_app

this_dir = path.abspath(path.join(path.dirname(__file__)))
api_dir = path.abspath(path.join(path.dirname(__file__), 'api'))
home_dir = path.abspath(path.join(path.dirname(__file__), 'eisenhome'))
utils_dir = path.abspath(path.join(path.dirname(__file__), 'eisenutils'))
instance_dir = path.abspath(path.join(path.dirname(__file__), 'instance'))
lib_dir = path.abspath(path.join(path.dirname(__file__), 'lib'))
sys.path.append(path.abspath(this_dir))
sys.path.append(path.abspath(api_dir))
sys.path.append(path.abspath(home_dir))
sys.path.append(path.abspath(utils_dir))
sys.path.append(path.abspath(instance_dir))
sys.path.append(path.abspath(lib_dir))

port = 5050


def wsgi_app(a_port):
    """
    PROD
    import this def, make multiple instances of flask app on various ports
    tell flask app the port num, so all functions are happy
    """
    app = create_app(a_port)
    return app


if __name__ == "__main__":
    wsgi_app(port).run(host='localhost', port=port)
