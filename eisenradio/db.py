import base64
import os
import sqlite3

static_images = os.path.dirname(os.path.abspath(__file__)) + "/static/images/styles/small/"
# static_images = os.path.dirname(os.path.abspath(__file__)) + "/static/images/styles/small/"
save_parent_folder = "/storage/emulated/0/Music/EisenRadio"
script_path = os.path.dirname(__file__)


def convert_ascii(file_name):
    with open(file_name, "rb") as reader:
        img_bytes = reader.read()
        img_ascii = render_picture(img_bytes, 'encode')
    return img_ascii


def render_picture(byte_data, de_enc):
    render_pic = ''
    if de_enc == 'encode':
        render_pic = base64.b64encode(byte_data).decode('ascii')
    if de_enc == 'decode':
        render_pic = base64.b64decode(byte_data).decode('ascii')
    return render_pic


def make_db_from_schema(db_path):
    # # # # custom filled db # # #

    # connection = sqlite3.connect((os.path.join(script_path, 'database.db')))
    connection = sqlite3.connect(str(db_path))
    with open((os.path.join(script_path, 'schema.sql'))) as f:
        connection.executescript(f.read())

    cur = connection.cursor()
    cur.execute("INSERT INTO eisen_intern (browser_open,statistics,commercials) VALUES (?,?,?)", (str(1), 1, 1))

    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('classic',
         'http://37.251.146.169:8000/streamHD',
         save_parent_folder,
         'Stream HE-AAC @ 192 kbps, 44.1 kHz\n'
         '\n'
         'Listener Peak (limit):	200\n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-brown_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('PARTY-VIBE-RADIO',
         'http://94.130.242.5:8010/stream',
         save_parent_folder,
         'https://www.partyvibe.com/ \n'
         '\n'
         'multiple streams at \n'
         'http://94.130.242.5:8010 \n'
         '\n'
         'Radio station currently plays host to 10 channels of\n'
         'streaming audio covering the following musical styles:\n'
         '\n'
         'ambient, breakbeat, drum & bass, dubstep, \n'
         'pop, psychedelic trance, rap, reggae, rock and techno music.\n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-black_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('audio_noir',
         'http://104.192.169.54:8000/noir',
         save_parent_folder,
         'usa - Classic Old Time Radio, Sci Fi, Comedy, Drama \n'
         ' \n'
         'Use the URL from header to go to their page. \n'
         'They offer a download site and preview for the next 10 upcoming tracks. \n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-blue_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('lounge',
         'http://streamingv2.shoutcast.com/japanimradio-tokyo',
         save_parent_folder,
         'They send no header info for their Web page. \n'
         ' \n'
         'Search engine "Jamendo lounge" helps. \n'
         'Free tracks and playlists. \n',
         "image/jpeg",
         convert_ascii(static_images + "mixer-tempelhof-airport.jpg"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('radio_pan_america',
         'http://51.222.8.101:8000/stream',
         save_parent_folder,
         'Radio Panamericana, Lima - Peru \n'
         'Salsa \n'
         ' \n'
         'Big Web site. \n'
         'You can use "Edit" database to go to their Web site. \n'
         ' \n'
         'They have a user limit. \n',
         "image/jpeg",
         convert_ascii(static_images + "mixer-reload.jpg"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('YeahMon',
         'http://c3.radioboss.fm:8095/autodj',
         save_parent_folder,
         'Yeah Mon Radio \n'
         'Reggae, Soca, Afrobeats, RnB, Hip Hop, Pop \n'
         ' \n'
         'yeahmonradio@gmail.com \n'
         'Tel 678-778-3401 \n'
         ' \n'
         'Republic of Vanuatu, island country in Melanesia,\n'
         'located in the South Pacific Ocean.\n',
         "image/jpeg",
         convert_ascii(static_images + "mixer-construction-site.jpg"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('playUrban',
         'http://live.playradio.org:9090/UrbanHD',
         save_parent_folder,
         'Play urban, Romania \n'
         ' \n'
         'You can use "Edit" database to go to their Web site. \n'
         'They have multiple streams and a you can request a song. \n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-red_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('Nachtflug',
         'http://85.195.88.149:11810/sid=1',
         save_parent_folder,
         'Nachtflug, Germany \n'
         'Goth, Industrial, Electronic \n'
         ' \n'
         'They have a broadcast schedule and you can request a song. \n'
         'You can use "Edit" database to go to their Web site. \n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-violet_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('hm',
         'https://hirschmilch.de:7001/prog-house.mp3',
         save_parent_folder,
         'Hirschmilch Radio - hirschmilch.de \n'
         ' \n'
         'Radio Shows.'
         ' \n'
         'Hirschmilch Radio Channels \n'
         'Chillout, Electronic, Prog-House, Progressive, Psytrance, Techno \n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-whiteneongelb_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('zenStyle',
         'https://radio4.cdm-radio.com:18004/stream-mp3-Zen',
         save_parent_folder,
         'Radio Costa Del Mar \n'
         ' \n'
         'Channels: \n'
         'CHILLOUT, DEEP-HOUSE, SMOOTH, JAZZ, DANCE, FUNKY, ZEN \n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-white_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('Paloma',
         'https://pool.radiopaloma.de/RADIOPALOMA.mp3',
         save_parent_folder,
         'Berlin /Germany \n'
         'Schlager \n'
         ' \n'
         'You can use "Edit" database to go to their Web site. \n'
         'Some advertising. \n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-brown_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('Bayern1',
         'https://streams.br.de/bayern1obb_2.m3u',
         save_parent_folder,
         'Bayern Germany \n'
         'Pop \n'
         ' \n'
         'An example for a m3u playlist server. It sends a list of streams. \n'
         'EisenRadio will connect to the first listed radio station. \n'
         'https://streams.br.de/bayern1obb_2.m3u \n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-black_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('Reggae',
         'http://hd.lagrosseradio.info:8000/lagrosseradio-reggae-192.mp3',
         save_parent_folder,
         'Paris / France \n'
         'REGGAE \n'
         ' \n'
         '3 webradios et 3 webzines gratuits, militants et 100% indépendants \n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-neongreen_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('aacChill',
         'http://radio4.vip-radios.fm:8020/stream128k-AAC-Chill_autodj',
         save_parent_folder,
         'Radio Costa Del Mar \n'
         'chillout \n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-neongreen_120x200.png"))
        )
    connection.commit()
    connection.close()


def empty_db_from_schema():
    # # # # custom filled db # # #
    connection = ''
    is_snap_device = 'SNAP' in os.environ
    is_android_device = 'ANDROID_STORAGE' in os.environ

    if is_android_device:
        return
    if not is_snap_device:
        connection = sqlite3.connect((str(os.path.join(script_path, 'database.db'))))
    if is_snap_device:
        connection = sqlite3.connect((str(os.path.join(os.environ["SNAP_USER_COMMON"], 'pre_configured.db'))))

    with open((os.path.join(script_path, 'schema.sql'))) as f:
        connection.executescript(f.read())

    cur = connection.cursor()
    cur.execute("INSERT INTO eisen_intern (browser_open,statistics,commercials) VALUES (?,?,?)", (str(1), 1, 1))
    connection.commit()
    connection.close()
