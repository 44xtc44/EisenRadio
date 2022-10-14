""" GhettoRecorder command line menu display,
        1: 'record',
        2: 'Change parent record path',
        3: 'Enable/disable blacklists',
settings.ini:
[GLOBAL]
SAVE_TO_DIR = f:\2
BLACKLIST_ENABLE = true
[STATIONS]
classic = http://37.251.146.169:8000/streamHD

Methods:
    menu_main()      - main menu
    menu_path()      - store custom path in config, default is recorder parent dir in config file folder
    menu_blacklist() - enable blacklist feature, store in config and create json dict file if not exists
    record()         - init all dicts in ghetto_ini.GIni, show the list of radios to choose from
    record_read_radios() - input prompt, get radio name or the choice (index) number of a radio list, create folder
    record_validate_input(radio_name) - True if choice in list, True if index of list is valid, False if not valid
    record_validate_radio_name(radio_name) - change the index number back to radio name, if index was the choice
    record_create_radio_url_dict(radio_name) - need radio name as thread and folder name, url to connect to network
    record_create_folder_radio_name(radio_name) - create parent folder and radio child folder
    terminal_record_parent_dir_get()  - return GIni.radio_base_dir, parent folder
    terminal_record_custom_path_get() - called by ghetto_recorder module, config is called at radio choice in main menu
    terminal_record_blacklist_enabled_get() - called by ghetto_recorder module, enable api variable
    terminal_record_settings_dir_get() - called by ghetto_recorder module to write blacklist beside settings.ini
    terminal_record_all_radios_get() - called by ghetto_recorder module to write blacklist beside settings.ini
    path_change() - call menu_path(), Change record parent path
    parent_record_path_change() - store path in [GLOBAL], test if path is writeable, init GIni.global_config_get()
    path_validate_input(custom_path) - return True if path is valid
    blacklist()                      - Enable/disable blacklists
    blacklist_is_enabled()           - Write a new blacklist option to settings.ini file
    blacklist_on()                   - write enabled to config file
    blacklist_off()                  - write disabled to config file
    remove_special_chars(str_name)   - clean radio name to create a folder
"""
import os
from eisenradio.lib.ghetto_ini import GIni


def menu_main():
    print('\tmenu \'Main\'')
    menu_options = {
        1: 'Record (local listen option)',
        2: 'Change parent record path',
        3: 'Enable/disable blacklists',
        4: 'Set path to config, settings.ini',
        5: 'Exit',
    }

    while 1:
        option = ""
        for key in menu_options.keys():
            print(key, '--', menu_options[key])

        try:
            option = int(input('Enter your choice: '))
        except ValueError:
            print('Invalid option. Please enter a number between 1 and 4.')
        if option == 1:
            record()
            break
        elif option == 2:
            path_change()
            break
        elif option == 3:
            blacklist()
        elif option == 4:
            config_path_change()

        elif option == 5:
            print('Thank you for using GhettoRecorder.')
            exit()
        else:
            print('Invalid option. Please enter a number between 1 and 5.')
    return


def menu_path():
    menu_options = {
        1: 'New parent path for recorded radios. Write to config.',
        2: 'Back to Main Menu',
    }

    while 1:
        option = ""
        for key in menu_options.keys():
            print(key, '--', menu_options[key])

        try:
            option = int(input('Enter your choice: '))
        except ValueError:
            print('Invalid option. Please enter a number between 1 and 2.')
        if option == 1:
            parent_record_path_change()
            break
        elif option == 2:
            menu_main()
            break
        else:
            print('Invalid option. Please enter a number between 1 and 2.')


def menu_blacklist():
    GIni.global_config_get(print_config=True)
    menu_options = {
        1: "blacklist on (don't write title if already downloaded)",
        2: 'blacklist off',
        3: 'Back to Main Menu',
    }

    while 1:
        option = ""
        for key in menu_options.keys():
            print(key, '--', menu_options[key])

        try:
            option = int(input('Enter your choice: '))
        except ValueError:
            print('Invalid option. Please enter a number between 1 and 3.')
        if option == 1:
            blacklist_on()
            break
        elif option == 2:
            blacklist_off()
            break
        elif option == 3:
            menu_main()
            break
        else:
            print('Invalid option. Please enter a number between 1 and 3.')


def menu_find_config():
    menu_options = {
        1: 'Path to "setting.ini" and "blacklist.json"',
        2: 'Back to Main Menu',
    }

    while 1:
        option = ""
        for key in menu_options.keys():
            print(key, '--', menu_options[key])

        try:
            option = int(input('Enter your choice: '))
        except ValueError:
            print('Invalid option. Please enter a number between 1 and 2.')
        if option == 1:
            config_path_change()
            break
        elif option == 2:
            menu_main()
            break
        else:
            print('Invalid option. Please enter a number between 1 and 2.')


def record():
    """ init all dicts in ghetto_ini.GIni, show the list of radios to choose from
    Functions
        GIni.record_path_test()    - test if configparser can read config file
        GIni.global_config_get(print_config=True) - fill path vars,
        GIni.show_items_ini_file() - show the main menu headline and description
    """
    print('\toption \'record\'')
    if record_path_get():
        GIni.global_config_get(print_config=True)
        GIni.show_items_ini_file()


def record_path_get():
    if not GIni.record_path_test():
        return False
    return True


def record_read_radios():
    """ return validated 'radio_url_dict' to ghetto_recorder module
    input on main menu:
        the list index number of a radio (prefix, [6 >> time_machine <<])
        name on the list in main menu

    target:
        write radio_url_dict[radioName] = URL
        recognize list index numbers to transform number into radio name

    Methods:
        record_validate_radio_name() - validate radio name or transform choice (index) number of a radio to name,
        record_create_radio_url_dict(valid_name) - return (name, url) tuple
        record_create_folder_radio_name(radio_dir_name) - create folder for validated radio

    return:
        'radio_url_dict'
    """
    radio_list = []  # fill a list, just to see if we get valid input
    radio_url_dict = {}  # return value of the function
    while True:
        line_input = input('Enter to record -->:')
        radio_name = line_input.strip()

        if line_input == str(12345):  # all
            for name in GIni.radio_names_list:
                name, url = record_create_radio_url_dict(name)
                radio_url_dict[name] = url
                print(f"12345...{name}")
                radio_dir_name = remove_special_chars(name)
                record_create_folder_radio_name(radio_dir_name)
            break

        elif (len(radio_list) == 0) and (len(radio_name) == 0):
            print("nothing to do, next try ...")
            menu_main()
        elif (len(radio_list) > 0) and (len(radio_name) == 0):
            # list is filled with valid inputs, record starts with empty input
            print(f".. got the radio list: {list(set(radio_list))}")
            break
        else:
            # True, if valid index was used, turn it in the radio name from list, else check name in choice list
            is_valid = record_validate_input(radio_name)
            if is_valid:
                # turn list index in element name, choice '0' to Blues_UK,
                valid_name = record_validate_radio_name(radio_name)
                name, url = record_create_radio_url_dict(valid_name)
                radio_url_dict[name] = url
                radio_dir_name = remove_special_chars(valid_name)
                record_create_folder_radio_name(radio_dir_name)
                radio_list.append(radio_dir_name)
                print(' Hit Enter <---| to RECORD, or paste next radio, write 12345 for all radios ')
    return radio_url_dict


def record_validate_input(radio_name) -> bool:
    """ return True if choice is name in list, return True for choice if index of list is a valid integer
    return False if not valid
     """
    if radio_name in GIni.radio_names_list:
        return True
    try:
        radio_index = abs(int(radio_name))  # 0000 and -1
    except ValueError:
        return False
    if len(GIni.radio_names_list) < radio_index:
        # input 100 if radio list has only 12 members
        return False
    if GIni.radio_names_list[radio_index]:
        return True


def record_validate_radio_name(radio_name):
    """ return radio name from 'radio_names_list', else return name by absolute number of index of 'radio_names_list'
    clean false input like 0000 to 0, -12 to 12
    GIni.radio_names_list[abs(int(12))] = 'nachtflug'
    """
    if radio_name in GIni.radio_names_list:
        return radio_name
    else:
        radio_id = radio_name
        return GIni.radio_names_list[abs(int(radio_id))]


def record_create_radio_url_dict(radio_name):
    """ return tuple radio name, url
    need radio name as thread name and folder name, url to connect to network
    clean the radio name from special chars to make folders
    """
    url = GIni.config_stations[radio_name]
    radio_spec = remove_special_chars(radio_name)
    radio_url_tuple = (radio_spec, url)
    return radio_url_tuple


def record_create_folder_radio_name(radio_name):
    """ create parent folder and radio child folder """
    parent_dir = GIni.radio_base_dir
    custom_dir = terminal_record_global_custom_path_get()
    path = os.path.join(custom_dir, parent_dir, radio_name)
    try:
        os.makedirs(path, exist_ok=True)
        print(f"\t{path}")
    except OSError:
        print(f"\t{radio_name} Directory {path} can not be created")


def terminal_record_radio_base_dir_get():
    """ return GIni.radio_base_dir """
    return GIni.radio_base_dir


def terminal_record_global_custom_path_get():
    """ called by ghetto_recorder module, config is called at radio choice in main menu """
    return GIni.global_custom_path


def terminal_record_blacklist_enabled_get():
    """ called by ghetto_recorder module, enable api variable """
    GIni.global_config_get()
    return GIni.global_custom_blacklist


def terminal_record_settings_dir_get():
    """ called by ghetto_recorder module to write blacklist beside settings.ini """
    GIni.global_config_get()
    return GIni.settings_dir


def terminal_record_all_radios_get():
    """ called by ghetto_recorder module to write blacklist beside settings.ini """
    GIni.global_config_get()
    return GIni.radio_names_list


def path_change():
    """ call menu_path(), Change record parent path """
    print('\toption \'Change record parent path\'')
    menu_path()


def parent_record_path_change():
    """ populate variables in GIni
     show old path, if any, write new one to GLOBAL section, create GLOBAL, if not exists
     test if path is writeable
     show new path, GIni.global_config_get
     Exception
        we crash, if config file is not in path, writing will fail
     """
    print('\n\tWrite a new path to store files')
    GIni.global_config_get(print_config=True)
    while True:
        line_input = input('Enter a new path, OS syntax (f:\\10 or /home ) -->:')
        custom_path = line_input.strip()  # to validate the name

        if len(custom_path) == 0:
            print("nothing to do ...")
            menu_main()
            break
        else:
            is_valid = path_validate_input(custom_path)
            if is_valid:
                try:
                    GIni.global_record_path_write(custom_path)
                except FileNotFoundError:
                    print("--> error, config file is not there or writeable (check path) - proceed")
                GIni.global_config_get(print_config=True)
                input('Hit Enter to leave -->:')
                break
            else:
                input_exit = input('Hit Enter to try again, or "E" to leave -->:')
                if (input_exit == "E") or (input_exit == "E".lower()):
                    break


def config_path_change():
    """ change the path to settings.ini and blacklist.json
     show old path, if any, write new one to GLOBAL section, create GLOBAL, if not exists
     test if path is writeable
     show new path, GIni.global_config_get()
     """
    print('\n\tWrite Path to settings.ini and blacklist.json file')
    GIni.global_config_get()
    while True:
        line_input = input('Enter a new path, OS syntax (f:\\10 or /home ) -->:')
        custom_path = line_input.strip()  # to validate the name

        if len(custom_path) == 0:
            print("nothing to do ...")
            menu_main()
            break
        else:
            is_valid = path_validate_input(custom_path)
            if is_valid:
                GIni.config_path_write(custom_path)
                GIni.global_config_get(print_config=True)
                input('Hit Enter to leave -->:')
                break
            else:
                input_exit = input('Hit Enter to try again, or "E" to leave -->:')
                if (input_exit == "E") or (input_exit == "E".lower()):
                    break


def path_validate_input(custom_path):
    """ return True if path is valid """
    try:
        os.makedirs(custom_path, exist_ok=True)
        print(f"\tcreated: {custom_path}")
    except OSError:
        print(f"\tDirectory {custom_path} can not be created")
        return False
    return True


def blacklist():
    """ Enable/disable blacklists """
    print('\toption \'Enable/disable blacklists\'')
    blacklist_is_enabled()


def blacklist_is_enabled():
    """ Write a new blacklist option to settings.ini file """
    print('\n\tWrite a new blacklist option to settings.ini file')
    menu_blacklist()


def blacklist_on():
    """ write enabled to config file """
    print('\n\tblacklist is ON: settings.ini file'
          '\n\tExisting titles are not recorded again and again.'
          '\nfile name is "blacklist.json" in the same folder as "settings.ini"')
    GIni.global_blacklist_enable_write("True")
    GIni.global_config_get(print_config=True)
    input('Hit Enter to leave -->:')


def blacklist_off():
    """ write disabled to config file """
    print('\n\tblacklist is OFF: settings.ini file')
    GIni.global_blacklist_enable_write("False")
    GIni.global_config_get(print_config=True)
    input('Hit Enter to leave -->:')


def remove_special_chars(str_name):
    ret_value = str_name.translate({ord(string): "" for string in '"!@#$%^*()[]{};:,./<>?\\|`~=+"""'})
    return ret_value
