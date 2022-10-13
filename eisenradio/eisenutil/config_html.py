"""module description config_html

    target: remove front-end settings: style, animations for low-end devices
    - feature row id:
    1 browser autostart,
    2 blacklist,
    3 html animation,
    4 html style
    5 inflated animals
    6 animated balloon
    7 animated speaker
    8 cpu utilisation used for animation to switch of most animations on the fly
    - row 2 must be created first, since its existence is not sure
    - keep app usable on low-end devices (70 mb RAM used with two or three connections)
    - endpoint response is a log list to show user what is in the box

    each feature has a checkbox to toggle status
    tools_feature_settings_get_rows(): call on startup to write all rows on version upgrade, value 1 except blacklist 0
"""
import eisenradio.lib.eisdb as eisen_db

enabled = 1
disabled = 0

# names must match the list and represent database row id
row_browser_autostart = 1
row_blacklist = 2
row_html_animation = 3
row_html_style = 4
row_html_front_pigs = 5
row_html_balloon = 6
row_html_speaker = 7
row_html_cpu = 8

feature_list = [
    row_browser_autostart,
    row_blacklist,
    row_html_animation,
    row_html_style,
    row_html_front_pigs,
    row_html_balloon,
    row_html_speaker,
    row_html_cpu,
]


def tools_feature_status_in_db(row_number):
    """return sql row object if exists or none / workaround if status[0] is 0, false """
    conn = eisen_db.get_db_connection()
    status = conn.execute('SELECT browser_open FROM eisen_intern WHERE id =' + str(row_number) + ';').fetchone()
    conn.close()
    if status:
        return status
    return


def tools_feature_on_off_state_in_db(row_number):
    """return (0,1) off/on or none"""
    conn = eisen_db.get_db_connection()
    content = conn.execute('SELECT browser_open FROM eisen_intern WHERE id =' + str(row_number) + ';').fetchone()
    conn.close()
    if content:
        return content[0]
    return


def tools_feature_settings_create_default(feature_without_row):
    """ set all features to ON, except blacklist """
    conn = eisen_db.get_db_connection()
    for row_number in feature_without_row:
        default_value = 0 if row_number == row_blacklist else 1
        conn.execute('INSERT INTO eisen_intern (id, browser_open) VALUES (?,?);', (row_number, default_value))
    conn.commit()
    conn.close()


def tools_feature_settings_get_rows():
    """ called on startup to write all rows on version upgrade
    row id 4 val 1, row id 5 val 0 and so on
    """
    feature_without_row = [row_num for row_num in feature_list if not tools_feature_status_in_db(str(row_num))]
    if len(feature_without_row) > 0:
        tools_feature_settings_create_default(feature_without_row)


def tools_feature_toggle_show_html_config(status, row):
    """ toggle html settings """
    is_on = 1 if status else 0
    conn = eisen_db.get_db_connection()
    conn.execute('UPDATE eisen_intern SET browser_open = ? WHERE id = ?;', (is_on, str(row)))
    conn.commit()
    conn.close()
    return is_on
