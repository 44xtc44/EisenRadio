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
         'recontextualize next-generation vortals, engineer plug-and-play experiences, deploy dynamic action-items, '
         'synthesize transparent relationships, transition next-generation mindshare, morph dynamic paradigms, '
         'orchestrate end-to-end initiatives, incubate frictionless content, revolutionize efficient e-services, '
         'redefine impactful users, engage leading-edge eyeballs, envisioneer 24/365 deliverables, incentivize viral '
         'infomediaries, whiteboard clicks-and-mortar experiences, generate B2C e-commerce, envisioneer extensible '
         'convergence, morph 24/7 experiences, utilize customized e-services, strategize customized systems, '
         'scale proactive markets, exploit bleeding-edge partnerships, repurpose integrated infrastructures, '
         'seize cutting-edge relationships, brand enterprise e-services, morph value-added partnerships, '
         'recontextualize customized communities, enable magnetic web services, maximize cutting-edge relationships,'
         'integrate front-end synergies, embrace one-to-one supply-chains, leverage proactive functionalities',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-brown_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('PARTY VIBE RADIO',
         'http://94.130.242.5:8010/stream',
         save_parent_folder,
         'multiple streams at http://94.130.242.5:8010',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-black_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('audio_noir',
         'http://104.192.169.54:8000/noir',
         save_parent_folder,
         'usa - Classic Old Time Radio, Sci Fi, Comedy, Drama',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-blue_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('anime_jp',
         'http://streamingv2.shoutcast.com/japanimradio-tokyo',
         save_parent_folder,
         'sound tracks of japanese anime videos and games',
         "image/jpeg",
         convert_ascii(static_images + "mixer-tempelhof-airport.jpg"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('radio_pan_america',
         'http://51.222.8.101:8000/stream',
         save_parent_folder,
         '',
         "image/jpeg",
         convert_ascii(static_images + "mixer-reload.jpg"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('YeahMon',
         'http://c3.radioboss.fm:8095/autodj',
         save_parent_folder,
         '',
         "image/jpeg",
         convert_ascii(static_images + "mixer-construction-site.jpg"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('playUrban',
         'http://live.playradio.org:9090/UrbanHD',
         save_parent_folder,
         '',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-red_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('Nachtflug',
         'http://85.195.88.149:11810/sid=1',
         save_parent_folder,
         '',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-violet_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('hm',
         'https://hirschmilch.de:7001/prog-house.mp3',
         save_parent_folder,
         '',
         "image/png",
         convert_ascii(static_images + "radio3d-style-whiteneongelb_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('zenStyle',
         'https://radio4.cdm-radio.com:18004/stream-mp3-Zen',
         save_parent_folder,
         'recontextualize next-generation vortals, engineer plug-and-play experiences, deploy dynamic action-items, '
         'synthesize transparent relationships, transition next-generation mindshare, morph dynamic paradigms, '
         'orchestrate end-to-end initiatives, incubate frictionless content, revolutionize efficient e-services, '
         'redefine impactful users, engage leading-edge eyeballs, envisioneer 24/365 deliverables, incentivize viral '
         'infomediaries, whiteboard clicks-and-mortar experiences, generate B2C e-commerce, envisioneer extensible '
         'convergence, morph 24/7 experiences, utilize customized e-services, strategize customized systems, '
         'scale proactive markets, exploit bleeding-edge partnerships, repurpose integrated infrastructures, '
         'seize cutting-edge relationships, brand enterprise e-services, morph value-added partnerships, '
         'recontextualize customized communities, enable magnetic web services, maximize cutting-edge relationships,'
         'integrate front-end synergies, embrace one-to-one supply-chains, leverage proactive functionalities',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-white_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('Paloma',
         'https://pool.radiopaloma.de/RADIOPALOMA.mp3',
         save_parent_folder,
         'Berlin /Germany',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-brown_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('Bayern1',
         'https://streams.br.de/bayern1obb_2.m3u',
         save_parent_folder,
         '*m3u playlist server, redirect to first server in the list \n'
         'Bavaria / Germany \n',
         "image/png",
         convert_ascii(static_images + "radio3d-style-white-black_120x200.png"))
        )
    cur.execute(
        "INSERT INTO posts (title, content, download_path, pic_comment, pic_content_type, pic_data) VALUES (?, ?, ?, "
        "?, ?, ?)",
        ('Reggae',
         'http://hd.lagrosseradio.info:8000/lagrosseradio-reggae-192.mp3',
         save_parent_folder,
         'Paris / France \n\n'
         'recontextualize next-generation vortals  \n'
         'engineer plug-and-play experiences \n'
         'deploy dynamic action-items \n'
         'synthesize transparent relationships \n'
         'transition next-generation mindshare \n'
         'morph dynamic paradigms \n'
         'orchestrate end-to-end initiatives \n'
         'incubate frictionless content \n'
         'revolutionize efficient e-services \n'
         'redefine impactful users \n'
         'engage leading-edge eyeballs \n'
         'envisioneer 24/365 deliverables \n'
         'incentivize viral infomediaries \n'
         'generate B2C e-commerce \n'
         'envisioneer extensible convergence \n'
         'morph 24/7 experiences \n'
         'utilize customized e-services \n',
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
