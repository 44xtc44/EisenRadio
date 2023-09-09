Eisenradio - a Web radio expandable collection
==============================================

   ![alt logo of eisenradio](https://github.com/44xtc44/EisenRadio/raw/dev/docs/source/aircraft_logo.png)
   ![Tests](https://github.com/44xtc44/eisenradio/actions/workflows/tests.yml/badge.svg?branch=dev)
  
Info
----
 * Comic style animated internet radio
 * Organize your web radios; delete and update, backup and restore
 * Style your app with pictures, write a comment or import a poem, song or study text to have a good time
 * Create a shuffled playlist within a local audio files folder in seconds
 * includes on-the-fly aacPlus file repair as well as offline aac repair (aacPlus)

 
Links
----
clone the latest version from GitHub dev branch, change to the folder ``pip install -e .``
 * Android: rename *WHL to *ZIP, extract with Android file manager
 * Android: https://pypi.org/project/eisenradio-apk/
 * Snap: https://snapcraft.io/eisenradio
 * GitHub: https://github.com/44xtc44/eisenradio
 * Report an issue: https://github.com/44xtc44/eisenradio/issues

Command line 
------------

EisenRadio GUI supported by Flask server.

    $ eisenradio  # executable script in Python Path
    $ python3 -m eisenradio.gui  # runs package if Python path is defektive

WSGI server *Waitress* on a random port.

    $ eisenradio-wsgi
    $ python3 -m eisenradio.wsgi

GhettoRecorder on command line.

    $ eisenradio-cmd
    $ python3 -m eisenradio.cmd

GhettoRecorder stores recorded files in the package folder by default. 
``/home/osboxes/.local/lib/python3.6/site-packages/ghettorecorder/radios``
You can change the folder via the menu options


Export / Import of GhettoRecorder in- and output files 
-------------------------------------------------------

Eisenradio stores *radio names and URLs* and *blacklists* in its database.

You can export for GhettoRecorder ``settings.ini`` and ``blacklist.json`` from database.
``Tools/Export/Names and URL's`` menu.

GhettoRecorder created ``blacklist.json`` can be imported into your database.


Eisenradio - the boring details 
-------------------------------
 * REST API app on blueprints and ApplicationFactory of the Flask microframework with a SQLite database
 * First Internet Radio App that can run a Spectrum Analyser in a Web browser (Feb,2022)
 * A local Python Flask Web Server connects to the radio server in behalf of you. Your browser connects to Flask
   * Backend (server) opens the connection, buffers the radio stream and presents it to localhost IP: 127.0.0.1
   * Frontend (browser) controls the backend, plays internet and local audio playlists
   * Browser audio element connects `http://localhost:5050/sound/classic` that streams `http://37.251.146.169:8000/streamHD`
   * Closing the browser does not disconnect the server listen (buffer discarded) nor streaming connections
 * Plays and repairs aac plus files; play (1.3), repairs since version (1.4); 
 * Backup and restore are easy work with the help of an optional ex/imported human-readable *ini file
 * Blacklist feature for recorded files (titles); delete only once 
   * lists can be ex/imported via a json dictionary file to other devices
 * playing local audio uses the web server multiple file upload feature
 * Multithreading allows you an unlimited number of radio connections at the same time, until the ISP Bandwidth limit hits
 * Android APK Package uses Python Kivy for multi-touch and promotes the app to "foreground service" (to not get killed)

    
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
-----------

    $ pip3 install eisenradio  # Tux
    > pip install eisenradio  # M$

Pytest
---
Shows how to init a flask instance and perform some tests on it. More hints in the test comments.

    > ~ ... /eisenradio $ pytest -s    # -s print to console

Is now part of the testautomation with flake8 and tox on GitHub.

Uninstall
---
Python user:

* find the module location
* uninstall and then remove remnants

>$ pip3 show eisenradio

>$ pip3 uninstall eisenradio

Location: ... /python310/site-packages
