""" helper for python package to container, to user deployment
this module hits, if the user calls the container
docker container
snap container, snapcraft setup for linux

Functions
---------
    container_setup_use()                        - if a container set record parent dir for Snap or Docker
    container_parent_dir(container)              - called by 'container_setup_use()'
    container_copy_settings(source_ini, dst_ini) - called by 'container_setup_use()' copy 'settings.ini' to parent dir
"""
import os
import shutil
import getpass
import eisenradio.lib.ghetto_ini as ghetto_ini


def container_setup_use():
    """ prepare containerized GhettoRecorder package for usage
    change the default parent record path
    copy settings.ini to that location
    """
    is_container = False
    try:
        if os.environ["SNAP"]:
            print('Snap Container')
            container_parent_dir('SNAP')
            is_container = True
            return is_container, container_parent_dir
    except KeyError:
        pass

    try:
        if os.environ["DOCKER"]:
            print('Docker Container')  # must set a var in Dockerfile to work, DOCKER=True
            container_parent_dir('DOCKER')
            is_container = True
            return is_container, container_parent_dir
    except KeyError:
        pass
    return is_container, container_parent_dir


def container_parent_dir(container):
    """ get user: create dir under home folder for snap
    create parent record folder
    write new path
    update radio_base_dir in GIni (central update point for default path in terminal mode)
    copy settings.ini to that folder
     """
    username = getpass.getuser()
    print('Hello, ' + username)

    if container == 'SNAP':                      # SNAP
        ghetto_folder = os.path.join('home', username, 'GhettoRecorder')
    else:
        ghetto_folder = '//tmp//GhettoRecorder'  # DOCKER

    try:
        os.makedirs(ghetto_folder, exist_ok=True)
        print(f"\tOK: {ghetto_folder}")
    except OSError:
        print(f"\tDirectory {ghetto_folder} can not be created")
        return False

    ghetto_ini.GIni.radio_base_dir = ghetto_folder

    source_ini = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'settings.ini')
    dst_ini = os.path.join(ghetto_folder, 'settings.ini')
    container_copy_settings(source_ini, dst_ini)


def container_copy_settings(source_ini, dst_ini):
    """ copy settings.ini from package container to
     snap user home/GhettoRecorder or
     docker tmp/GhettoRecorder
     never overwrite a user customized settings.ini
     """
    try:
        if not os.path.exists(dst_ini):
            shutil.copyfile(source_ini, dst_ini)
    except FileExistsError:
        pass
