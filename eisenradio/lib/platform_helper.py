import os
import webbrowser
from eisenradio.lib.eisdb import status_read_status_set


def get_env_snap():
    print('Eisenradio App runs in Ubuntu Snap Container, check environment:\n')
    print('SNAP_USER_COMMON (your Database lives here, backup if you like): ' + os.environ["SNAP_USER_COMMON"])
    print('SNAP_LIBRARY_PATH: ' + os.environ["SNAP_LIBRARY_PATH"])
    print('SNAP_COMMON: ' + os.environ["SNAP_COMMON"])
    print('SNAP_USER_DATA: ' + os.environ["SNAP_USER_DATA"])
    print('SNAP_DATA: ' + os.environ["SNAP_DATA"])
    print('SNAP_REVISION: ' + os.environ["SNAP_REVISION"])
    print('SNAP_NAME: ' + os.environ["SNAP_NAME"])
    print('SNAP_ARCH: ' + os.environ["SNAP_ARCH"])
    print('SNAP_VERSION: ' + os.environ["SNAP_VERSION"])
    print('SNAP: ' + os.environ["SNAP"])


def get_env_docker():
    print('\n\tEisenRadio App in Docker Container\n')
    print('\tUse url "http://localhost:5050/" to connect your Browser.\n')


def open_browser():
    print('\n\t---> Use url "http://localhost:5050/" to connect your Browser. <---\n')

    is_enabled = status_read_status_set(False, 'eisen_intern', 'browser_open', '1')
    if is_enabled:
        print(f' Browser auto start: Enabled\n')
        webbrowser.open('http://localhost:5050', new=2)
    if not is_enabled:
        print(f' Browser auto start: Disabled\n')


def main():
    is_snap_device = 'SNAP' in os.environ
    is_docker_device = 'DOCKER' in os.environ
    is_android_device = 'ANDROID_STORAGE' in os.environ

    if is_snap_device:
        get_env_snap()
    if is_docker_device:
        get_env_docker()
    if not is_android_device or not is_docker_device:
        open_browser()
