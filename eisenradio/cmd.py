""" console module,
imports ghetto_recorder and calls ghetto_recorder.terminal_main()
entry point in pyproject.toml
[project.scripts]
eisen-console = "eisenradio.cmd:main"
console command is 'eisen-console'
"""
import sys
from os import path
from eisenradio.lib import ghetto_recorder
# load standard path set
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


def main():
    # command line version; write:python ghetto_recorder.py
    ghetto_recorder.terminal_main()


if __name__ == '__main__':
    main()
