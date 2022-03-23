Eisenradio - a Web radio expandable collection
---
 * Organize your web radios; delete and update, backup and restore
 * Freedom: Style your app with pictures, import a poem, song text, or a funny comment to have a good time
 * Cool feature: Create a shuffled playlist within a local audio files folder in seconds
 * More action: A ping variable shows the response time and a spectrum analyser the frequency range
 * Speed: Travel through the app at breakneck speed, thanks to the smart design of the controls 
 * Android: download to mobile (link below .-apk), rename *WHL to *ZIP, extract with Android _file_ manager
 * https://pypi.org/project/eisenradio-apk/

Eisenradio - the boring details 
---
 * A REST API app on blueprints and application factory of the flask microframework with a SQLite database
 * First Internet Radio App that can run a Spectrum Analyser in a Web Browser (Feb,2022)
 * Eisenradio uses its own API and adjusts the buffer size for a given bit rate
 * Backup and restore are easy work with the help of an optional exported, human-readable *ini file
 * Eisenradio uses Pythons sys.path; it will find its modules on the dark side of the moon
 * The Android APK Package uses Python Kivy for multi-touch and promotes the app to "foreground service" (not get killed)
 * Backend (server) opens the connection, buffers the internet stream and presents it to localhost IP: 127.0.0.1
 * Frontend (browser) controls the backend, plays internet and local audio and has a spectrum analyser at your disposal

 
		""" sketch """

	     |B |               |S | Flask web server, Header[Werkzeug/2.0.2 Python/3.10.1]
	     |r |listen         |e |-------> starRadio
	     |o |------->   <-- |r |
	     |w |GhettoRecorder |v |-------> planetRadio
	     |s |--->    <----- |e |
	     |e |               |r |-------> satteliteRadio
	     |r |               |  |
         net: localhost     net: internet
         CORS: accept       CORS: deny
         audioNode: 1,-1    audioNode: 0, 0
         JavaScript,CSS     Python,SQL

    Cross-Origin Resource Sharing mechanism (CORS) 
    i.a. prevents a Browser from analysing audio from internet
    

pip install
-
	""" xxs Linux xxs """
    $ pip3 install eisenradio
    $ python3 -m eisenradio.wsgi  # watch flask

    """ xxm Windows xxm """
    > pip install eisenradio
    > python -m eisenradio.wsgi

    """ xxl big company xxl """
    $$$ pip3 install eisenradio
    $$$ python3 -m eisenradio.app  # serve flask
    """ for the sake of completeness, a python
        production server 'waitress' is started """

Pytest
---
> ~ ... /test/functional$ python3 -m pytest -s    # -s print to console

find the modified test db in ./app_writable/db

Uninstall
---
Python user:

* find the module location
* uninstall and then remove remnants

>$ pip3 show eisenradio

>$ pip3 uninstall eisenradio

Location: ... /python310/site-packages
