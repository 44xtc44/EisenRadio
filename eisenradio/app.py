import sys
from os import path
from eisenradio import wsgi
from waitress import serve

this_dir = path.abspath(path.join(path.dirname("__file__")))
api_dir = path.abspath(path.join(path.dirname("__file__"),   'eisenradio/api'))
home_dir = path.abspath(path.join(path.dirname("__file__"),  'eisenradio/eisenhome'))
utils_dir = path.abspath(path.join(path.dirname("__file__"), 'eisenradio/eisenutils'))
instance_dir = path.abspath(path.join(path.dirname("__file__"), 'eisenradio/instance'))
lib_dir = path.abspath(path.join(path.dirname("__file__"),   'eisenradio/lib'))
sys.path.append(path.abspath(this_dir))
sys.path.append(path.abspath(api_dir))
sys.path.append(path.abspath(home_dir))
sys.path.append(path.abspath(utils_dir))
sys.path.append(path.abspath(instance_dir))
sys.path.append(path.abspath(lib_dir))

app = wsgi.app
print('\n Python WSGI "Waitress" serves flask\n')
if __name__ == "__main__":
    serve(app, host='localhost', port=5050)
