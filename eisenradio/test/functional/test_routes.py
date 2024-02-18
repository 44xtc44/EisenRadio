import json
import unittest
from os import environ, remove
from eisenradio import create_app_test  # __init__
from eisenradio.instance.config_apfac import write_config, remove_config

# https://flask.palletsprojects.com/en/3.0.x/testing/#faking-resources-and-context
# POST: .app.post('/path-to-request', data=dict(var1='data1', var2='data2', ...))
# GET:  .app.get('/path-to-request', query_string=dict(arg1='data1', arg2='data2', ...)


class TestRouteHome(unittest.TestCase):
    """ test of flask from the JS side to Python backend
    db is created from schema

    Setup:
        write_config():
            write environment variables and load 'em as OS vars with load_dotenv() , flask is not started yet
    Init:
        create_app_dev(5050, True):
            __init__.py flask, load context app.app_context(),
            update flask config with OS vars so flask knows db, app.config.update(DATABASE=environ['DATABASE'],...)
    Test:
        radio DB table id ( radio 0-9  )
    """

    radio_to_delete = int(3)  # radio table id 3

    def setUp(self):
        print("\n\t --------------------test-setUp-----START----\n")
        write_config()
        print("\t --------------------test-setUp-----END-----\n")

    def test_route_home(self):
        from eisenradio.lib.eisdb import status_read_status_set
        from eisenradio.eisenhome import routes as home_routes

        app = create_app_test(5050)

        print('\n ... Begin: def test_route_home()')

        print('\napp.name:\t' + app.name)
        print(f'app.config[DEBUG]:\t {app.config["DEBUG"]}')
        print(f'app.config[TESTING]:\t {app.config["TESTING"]}')
        print(f'app.config[DATABASE]:\t {app.config["DATABASE"]}\n')

        web = app.test_client()
        rv = web.get('/')

        assert rv.status_code == 200

        assert '<title>Your EisenRadio!</title>' in rv.data.decode('utf-8')

        print(""" test Blueprint 'eisenHOME'  """)

        assert home_routes.eisenhome_bp.template_folder == 'bp_home_templates'
        assert home_routes.eisenhome_bp.static_url_path == '/bp_home_static'

        print(""" /cookie_set_dark """)

        rv = web.get('/cookie_set_dark')
        assert rv.status_code == 200
        assert 'Eisenkekse sind die besten' in rv.data.decode('utf-8')

        print(""" /cookie_get_dark (json style) """)

        rv = web.get('/cookie_get_dark')
        data = json.loads(rv.get_data(as_text=True))
        assert rv.status_code == 200
        assert data['darkmode'] == 'darkmode'

        print(""" /cookie_del_dark """)
        rv = web.get(
            '/cookie_del_dark',
            headers={"X-Requested-With": "XMLHttpRequest"},
            follow_redirects=True, )
        cookie = rv.headers.getlist('Set-Cookie')
        cookie_val = cookie[0]  # nice one row list :(
        cook_list = cookie_val.split(';')
        assert cook_list[0] == 'eisen-cookie='  # cookie value is set to 0
        assert rv.status_code == 200
        assert b'necesito nuevas cookies' in rv.data

        timer = int(8)   # 8 hours
        rv = web.post(
            '/index_posts_combo',
            data=dict(timeRecordSelectAll=timer),
            follow_redirects=True,
            content_type='application/x-www-form-urlencoded',
        )
        data = json.loads(rv.get_data(as_text=True))
        assert data == timer
        assert rv.status_code == 200

        print(""" /index_posts_percent """)

        rv = web.get(
            '/index_posts_percent',
            follow_redirects=True,
            content_type='application/x-www-form-urlencoded',
        )
        data = json.loads(rv.get_data(as_text=True))
        assert rv.status_code == 200
        assert data['result'] == 0

        print(""" /page_flash """)

        expected_flash_message = 'Count down timer ended all activities. App restart recommended!'
        rv = web.get('/page_flash')
        parsed = rv.data.decode(encoding="utf-8")
        assert rv.status_code == 200
        assert expected_flash_message in parsed

        import eisenradio.eisenhome.eishome as eisen_radio
        assert eisen_radio.combo_master_timer == 0  # master timer recording
        assert eisen_radio.progress_master_percent == 0

        rv_db = status_read_status_set(False, 'posts', 'title', str(self.radio_to_delete))
        # print(rv_db)
        assert rv_db != "column not in table posts, status_read_status_set"
        rv = web.post('/delete_radio', data={"radioId": str(self.radio_to_delete)}, follow_redirects=True)
        parsed = json.loads(rv.get_data(as_text=True))
        assert rv.status_code == 200
        assert parsed == {'removed': True}  # Flask sends: return {"removed": is_del}
        print(" query MUST fail, radio not in store! ")
        rv_db = status_read_status_set(False, 'posts', 'title', str(self.radio_to_delete))
        assert rv_db == "column not in table posts, status_read_status_set"
        print('--- fin ----')

    def tearDown(self):
        print("\n\t --------------------test-tearDown -----START----\n")
        remove_config()
        self.remove_test_db()
        print("\n\t --------------------test-tearDown -----END----\n")

    @staticmethod
    def remove_test_db():
        try:
            remove(environ['DATABASE'])
        except OSError:
            pass
