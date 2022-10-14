""" GhettoRecorder config
settings.ini file
"""

import os
import configparser
from pathlib import Path as Pathlib_path


class GIni:
    """ config file for command line 'settings.ini'

    choice of radios can be made via list index number or name of the radio
    Dictionaries:
        radio_names_list = []  : list to search radio name via character
        radio_base_dir                : recorder parent dir
        settings_path                 : full path name of config file
        settings_dir                  : dir path of config file
        config_stations = {}          : radio, url pairs from [STATIONS] section
        config_global = {}            : extra infos from [GLOBAL] section, SAVE_TO_DIR = f:\2, BLACKLIST_ENABLE = True
        global_custom_path = ""       : custom parent directory for records elsewhere
        global_custom_blacklist = ""  : blacklist feature on/off

    Methods:
        show_items_ini_file() - show the content of the ini file to choose from, fill radio_names_list,radio_names_dict
        record_path_test()    - look if we can read the config file
        global_config_get(print_config=False) - extract GLOBAL section from settings.ini
        global_record_path_write(custom_path) - SAVE_TO_DIR = f:/2
        global_blacklist_enable_write(option) - BLACKLIST_ENABLE = True
     """

    radio_names_list = []       # search radio name via character
    radio_base_dir = "radios"
    this_module_path = os.path.dirname(os.path.abspath(__file__))
    settings_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "settings.ini")
    settings_dir = os.path.dirname(settings_path)
    config_stations = {}          # radio, url pairs
    config_global = {}            # extra infos like different path SAVE_TO_DIR = f:\2, BLACKLIST_ENABLE = True
    global_custom_path = settings_dir  # custom parent directory for records; via menu option set path or [GLOBAL] path
    global_custom_blacklist = ""  # blacklist feature on/off

    @staticmethod
    def show_items_ini_file():
        """ show the content of the ini file to choose from
        fill radio_names_list and radio_names_dict to later validate the choice
         """
        config = GIni.record_path_test()
        try:
            GIni.config_stations = dict(config.items('STATIONS'))
        except AttributeError:
            print("--> GIni.show_items_ini_file(), can not find configuration section [STATIONS] - proceed")
            return

        with open(os.path.join(GIni.this_module_path, "ghetto_recorder.ascii"), "r") as reader:
            print(reader.read())

        GIni.radio_names_list = []
        for name in dict(config.items('STATIONS')):
            GIni.radio_names_list.append(name)

        for index, name in enumerate(GIni.radio_names_list):
            print(f'\t{index} \t>> %-20s <<' % name)

        print(' \n Radio stations in your list. --> CHANGED: 42 to 12345')
        print(' Please use "Ctrl + C" to stop the app.\n')
        print('\tCopy/Paste a Radio from >> settings.ini <<, \n\tor type the leading number and press Enter\n')
        print("\t http://localhost:1242/" + " listen to local recorded stream (saves bandwidth)")
        print("\t If blacklist is ON, file: blacklist.json in the same folder as settings.ini")

        return

    @staticmethod
    def record_path_test():
        config = configparser.ConfigParser()  # imported library to work with .ini files
        try:
            config.read_file(open(GIni.settings_path))
            # print(f"OK, settings.ini found")
        except FileNotFoundError as error:
            print(f"--> no config found, \nExport 'Names and URLs' from database to create a settings.ini,\n  {error}")
            return False
        else:
            return config

    @staticmethod
    def global_config_get(print_config=False):
        """ extract GLOBAL section from settings.ini, if available
        GLOBAL can be: not there, empty, or with values (test case)

        Method:
            GIni.record_path_test() - exit if no path
        Raise:
            show that there is no config, but can proceed without (GIni.record_path_test(), ok)
        """
        config = GIni.record_path_test()
        if config:
            try:
                GIni.config_global = dict(config.items('GLOBAL'))
            except Exception as error:
                print(f'Config found, minor error: {error} - proceed')
                return True

            if len(GIni.config_global) == 0:
                print("--> section [GLOBAL] is empty. No blacklist, or record path set.")
                return True
            else:
                if print_config:
                    print(f'..settings.ini [GLOBAL] section: {GIni.config_global}')
                for key, val in GIni.config_global.items():
                    if key == "SAVE_TO_DIR".lower():
                        GIni.global_custom_path = val
                    if key == "BLACKLIST_ENABLE".lower():
                        GIni.global_custom_blacklist = val
                return True

    @staticmethod
    def global_record_path_write(custom_path):
        """ ini config write
        ["GLOBAL"]
        SAVE_TO_DIR = f:/2
        """
        config = configparser.ConfigParser()
        config.read_file(open(GIni.settings_path))
        config.sections()
        if "GLOBAL" not in config:
            config.add_section('GLOBAL')
        config.set('GLOBAL', 'SAVE_TO_DIR', str(Pathlib_path(custom_path)))  # help to write path for OS
        with open(GIni.settings_path, 'w') as configfile:
            config.write(configfile)

    @staticmethod
    def global_blacklist_enable_write(option):
        """ ini config write
        ["GLOBAL"]
        BLACKLIST_ENABLE = True
        """
        config = configparser.ConfigParser()
        config.read_file(open(GIni.settings_path))
        config.sections()
        if "GLOBAL" not in config:
            config.add_section('GLOBAL')
        config.set('GLOBAL', 'BLACKLIST_ENABLE', option)
        with open(GIni.settings_path, 'w') as configfile:
            config.write(configfile)

    @staticmethod
    def config_path_write(custom_path):
        """ find settings.ini and blacklist.json
        write the path variables
        used, if config file is not in the same folder as the main module (ghetto_recorder)
        Menu, 'Set path to config, settings.ini'
        """
        path = str(Pathlib_path(custom_path))
        GIni.settings_path = os.path.join(path, "settings.ini")
        GIni.global_custom_path = path
