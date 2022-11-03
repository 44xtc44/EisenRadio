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
 * grab content until ISP bandwidth limit hits
 * includes professional aacPlus (on the fly) file repair
 
Links
----
newest version on GitHub dev branch, then PyPi Package, Android or Snap, Docker
 * Android: download to mobile (link below .-apk), rename *WHL to *ZIP, extract with Android file manager
 * Android: https://pypi.org/project/eisenradio-apk/
 * Snap: https://snapcraft.io/eisenradio
 * GitHub: https://github.com/44xtc44/eisenradio

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
    
command line 
------------
Start browser from command line   

    $ eisenradio

Call the command line app with one of two commands.

    $ eisenradio-cmd

Or, EisenRadio sits on top of 'GhettoRecorder' package https://pypi.org/project/GhettoRecorder/

    $ ghettorecorder

You can export your ``settings.ini`` and ``blacklist.json`` 
via "Tools/Export/Names and URL's" menu from your database.
An updated ``blacklist.json`` can be imported into your database.

* The default save path is in the package folder. You should change it via the menu options

     ``/home/osboxes/.local/lib/python3.6/site-packages/ghettorecorder/radios``

pip install
-----------
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
