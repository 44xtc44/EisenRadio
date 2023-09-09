Feature Overview
----------------
* REST API app on blueprints and ApplicationFactory of the Flask microframework with a SQLite database
* First Internet Radio App that can run a Spectrum Analyser in a Web browser (Feb,2022)
* A local Python Flask Web Server connects to the radio server in behalf of you. Your browser connects to Flask
   * Backend (server) opens the connection, buffers the radio stream and presents it to localhost IP: 127.0.0.1
   * Frontend (browser) controls the backend, plays internet and local audio playlists
   * Browser audio element connects `http://localhost:5050/sound/classic` that streams `http://37.251.146.169:8000/streamHD`
   * Closing the browser does not disconnect the server listen (buffer discarded) nor streaming connections

* Plays and repairs aac plus files; play (1.3), repairs since version (1.4);
* Backup and restore are easy work with the help of an optional ex/imported human-readable *ini* file
* Blacklist feature for recorded files (titles); delete only once
   * lists can be ex/imported via a json dictionary file to other devices

 * playing local audio uses the web server multiple file upload feature
 * Multithreading allows you an unlimited number of radio connections at the same time, until the ISP Bandwidth limit hits
 * Android APK Package uses Python Kivy for multi-touch and promotes the app to "foreground service" (to not get killed)
