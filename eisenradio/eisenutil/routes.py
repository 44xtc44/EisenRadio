import os
import eisenradio.lib.ghetto_recorder as ghetto

from flask import Blueprint, render_template, request, url_for, flash, redirect, make_response, jsonify, Response
from eisenradio.eisenutil.browser_stream import stream_audio_feed, get_stream_content_type
from eisenradio.eisenutil.eisutil import make_folder, is_in_db_view, remove_blank
from eisenradio.eisenutil.measure import measure_meta, stopped_stations
from eisenradio.eisenutil.tools import delete_all_radios, export_radios, radio_spare_image, \
    upload_radios, get_export_path
from eisenradio.lib.eisdb import get_db_connection, status_read_status_set, render_picture, get_download_dir, \
    get_post, get_db_path

# Blueprint Configuration
eisenutil_bp = Blueprint(
    'eisenutil_bp', __name__,
    template_folder='bp_util_templates',
    static_folder='bp_util_static',
    static_url_path='/bp_util_static'
)


@eisenutil_bp.after_request
def add_header(response):
    """ only internal traffic, route available internal, browser connection to route is internal """
    """ Allow-Origin header plus localhost is ok for browser to disable cors restrictions, could change .. """
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response


@eisenutil_bp.route('/tools_delete_all', methods=['POST'])
def tools_delete_all():
    rv = delete_all_radios()
    if rv:
        flash('Successfully deleted! Restart App', 'success')
    if not rv:
        flash('Some were not deleted! Restart App', 'warning')

    export_path = get_export_path()
    return render_template('bp_util_tools.html',
                           export_path=export_path)


@eisenutil_bp.route('/tools_export_ini', methods=['POST'])
def tools_export_ini():
    rv = export_radios()
    if rv:
        flash('Successfully exported!', 'success')
    if not rv:
        flash('Something went wrong', 'warning')

    export_path = get_export_path()
    return render_template('bp_util_tools.html',
                           export_path=export_path)


@eisenutil_bp.route('/tools_upload_ini', methods=['POST'])
def tools_upload_ini():
    export_path = get_export_path()
    file = request.files['inputFile']
    print(f' name {file.name} content-type {file.content_type}')
    try:
        settings_ini = file.read()
        rv = upload_radios(settings_ini.decode('ascii'))
    except Exception as e:
        print(e)
        return render_template('bp_util_tools.html',
                               export_path=export_path)
    if rv:
        flash('Successfully imported! Restart App', 'success')
    if not rv:
        flash('Something went wrong, text utf-format?', 'warning')

    return render_template('bp_util_tools.html',
                           export_path=export_path)


@eisenutil_bp.route('/tools', methods=('GET', 'POST'))
def tools():
    export_path = get_export_path()
    return render_template('bp_util_tools.html',
                           export_path=export_path)


@eisenutil_bp.route('/about', methods=('GET', 'POST'))
def about():
    if request.method == 'POST':
        if request.form['browser']:
            status_read_status_set(True, 'eisen_intern', 'browser_open', '1')
            return redirect(url_for('eisenutil_bp.about'))

    is_browser_on = status_read_status_set(False, 'eisen_intern', 'browser_open', '1')
    download_path = get_download_dir()
    db_path = get_db_path()
    return render_template('bp_util_about.html',
                           is_browser_on=is_browser_on,
                           download_path=download_path,
                           db_path=db_path)


@eisenutil_bp.route('/create', methods=('GET', 'POST'))
def create():
    if request.method == 'POST':
        rv_req = request.form['title']
        title = remove_blank(rv_req)
        name_in_db = is_in_db_view(title)
        content = request.form['content']
        radio_image = None
        content_type = None

        if not title:
            flash('Name is required!', 'warning')
            return render_template('bp_util_create.html')
        if name_in_db:
            flash('Name is already used!', 'warning')
            return render_template('bp_util_create.html')
        if not content:
            flash('URL is required!', 'warning')
            return render_template('bp_util_create.html')

        # Image
        if request.files['inputFile']:
            file = request.files['inputFile']
            content_type = file.content_type
            print(f' name {file.name} content-type {file.content_type}')
            try:
                db_img = file.read()
                radio_image = render_picture(db_img, 'encode')
            except Exception as e:
                print(e)
                radio_image = None
                content_type = None

        else:
            if not name_in_db:
                radio_image, content_type = radio_spare_image()

        if request.form['text']:
            text = request.form['text']
        else:
            text = None

        conn = get_db_connection()
        posts = conn.execute('SELECT * FROM posts').fetchall()
        # if we later want extra save folders for each radio
        try:
            request_path = posts[0]["download_path"]
        except Exception as e:
            print(e)
            print(' looks like the first radio to create, no save to path set')
            conn.execute('INSERT INTO posts (title, content) VALUES (?, ?)',
                         (title, content))
        else:
            conn.execute('INSERT INTO posts (title, content, download_path, pic_data, pic_content_type, pic_comment) '
                         'VALUES (?, ?, ?, ?, ?, ?)',
                         (title, content, request_path, radio_image, content_type, text))

        conn.commit()
        conn.close()
        return redirect(url_for('eisenhome_bp.index'))

    return render_template('bp_util_create.html')


@eisenutil_bp.route('/save', methods=('GET', 'POST'))
def save():
    rv = None
    if request.method == 'GET':
        """fail if db empty"""
        try:
            rv = os.path.abspath(get_download_dir())
        except TypeError:
            return render_template('bp_util_save.html', save_to='no-directory-found')
        return render_template('bp_util_save.html', save_to=os.path.abspath(get_download_dir()))

    if request.method == 'POST':
        request_path = os.path.abspath(request.form['Path_Save_To'])

        if not request_path:
            flash('A folder is required!', 'warning')
            try:
                rv = os.path.abspath(get_download_dir())
            except TypeError:
                return render_template('bp_util_save.html', save_to='no-directory-found')
            return render_template('bp_util_save.html', save_to=os.path.abspath(get_download_dir()))

        if request_path:
            made_it = make_folder(request_path)
            if not made_it:
                flash('No folder created! exists or denied', 'warning')
                return render_template('bp_util_save.html', save_to=os.path.abspath(get_download_dir()))

            conn = get_db_connection()
            records = conn.execute('select id from posts').fetchall()
            if not records:
                flash('Noting in Database!', 'warning')
                try:
                    return render_template('bp_util_save.html', save_to=os.path.abspath(get_download_dir()))
                except TypeError:
                    return render_template('bp_util_save.html', save_to='no-row-in-table-create-a-radio')
            for id_num in records:
                # print("Radio Id:", id_num[0])
                conn.execute('UPDATE posts SET download_path = ? WHERE id = ?', (request_path, id_num[0]))
            conn.commit()
            conn.close()

            flash(('Save files to: ' + request_path), "success")
            return redirect(url_for('eisenhome_bp.index'))

        return render_template('bp_util_save.html', save_to=os.path.abspath(get_download_dir()))


@eisenutil_bp.route('/<int:id>/edit', methods=('GET', 'POST'))
def edit(id):
    post = get_post(id)

    if request.method == 'POST':
        rv_req = request.form['title']
        title = rv_req.replace(" ", "")
        content = request.form['content']

        if not title:
            flash('Title is required!', 'warning')
        # Image, if empty keep db entry as it is
        if request.files['inputFile']:
            file = request.files['inputFile']
            content_type = file.content_type
            print(f' name {file.name} content-type {file.content_type}')
            try:
                db_img = file.read()
                image = render_picture(db_img, 'encode')
            except Exception as e:
                print(e)
                image = None
                content_type = None

        else:
            image = None
            content_type = None

        if request.form['text']:
            text = request.form['text']
            if text == 'None':
                text = ' '
        else:
            text = ' '

        conn = get_db_connection()
        if image:
            conn.execute('UPDATE posts SET title = ?, content = ?, pic_data = ?, pic_content_type = ?, '
                         'pic_comment = ? WHERE id = ?',
                         (title, content, image, content_type, text, id))
        else:
            conn.execute('UPDATE posts SET title = ?, content = ?, pic_comment = ?  WHERE id = ?',
                         (title, content, text, id))

        conn.commit()
        conn.close()
        return redirect(url_for('eisenhome_bp.index'))

    return render_template('bp_util_edit.html', post=post)


@eisenutil_bp.route('/<int:post_id>')
def post(post_id):
    post = get_post(post_id)
    url_port = ghetto.GIni.parse_url_simple_url(post["content"])

    return render_template('bp_util_post.html',
                           post=post,
                           url_port=url_port)


@eisenutil_bp.route('/sw')
def stream_watcher():
    resp = make_response("stream watcher    (ಠ_ಠ)")
    return resp


@eisenutil_bp.route('/cache_info', methods=['GET'])
def cache_info():
    json_lists = measure_meta()
    if len(json_lists) == 0:
        json_lists = '-empty-'
    return jsonify({"cache_result": json_lists})


@eisenutil_bp.route('/delete_info', methods=['GET'])
def delete_info():
    json_list = stopped_stations()
    if len(json_list) == 0:
        json_list = '-empty-'
    return jsonify({"stopped_result": json_list})


@eisenutil_bp.route('/sound/<radio_name>', methods=['GET'])
def sound(radio_name):
    """internet audio, local audio via javascript"""
    name = str(radio_name)
    try:
        content_type = os.environ[name]
    except KeyError:
        content_type = get_stream_content_type(name)

    audio_chunks = stream_audio_feed(name)

    response = Response(audio_chunks, mimetype=content_type)
    response.headers['Cache-Control'] = 'no-store'
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
