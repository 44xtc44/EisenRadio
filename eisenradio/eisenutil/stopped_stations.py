import eisenradio.eisenutil.request_info as request_info
from ghettorecorder import ghettoApi


def inactive_id_read():
    """return the list of all inactive radio ids

    js clean html start page
    """
    radio_all_id_list = [radio_id for radio_id in ghettoApi.lis_btn_dict.keys()]
    active_id_list = request_info.active_buttons()
    inactive_id_list = [radio_id for radio_id in radio_all_id_list if radio_id not in active_id_list]

    return inactive_id_list
