# Eisenradio - Web radio DB / Media-player

   ![alt logo of eisenradio](https://github.com/44xtc44/EisenRadio/raw/dev/docs/source/aircraft_logo.png)
   ![Tests](https://github.com/44xtc44/eisenradio/actions/workflows/tests.yml/badge.svg?branch=dev)

## Overview

This repository shows the full stack source code of an SVG animated GUI for [GhettoRecorder](https://github.com/44xtc44/GhettoRecorder).

* first internet Radio App that can run a Spectrum Analyser in a Browser (Feb,2022), sketch at page bottom
* SVG animations in vanilla JavaScript super fast animated and colorized with regex
* Playlist feature; load and walk through a list of your local sound files
* REST API Flask endpoints; serve a SQLite database in plain SQL
* deployment source code for [Android Studio](https://github.com/44xtc44/EisenRadio-chaquopy) , [Docker](https://github.com/44xtc44/EisenRadio/blob/dev/Dockerfile), [Snapcraft](https://github.com/44xtc44/EisenRadio/tree/dev/snap) and [Kivy](https://github.com/44xtc44/EisenRadio/tree/dev/kivy) available

# Name

The initial design was intended to mimic a hardware store site with multiple items listed.
"Eisen" Hardware [iron radios].

# Comic style animated internet radio

Inkscape created SVG images are used everywhere in the app. No raster graphics in this project. Except converted from SVG.

* 90% of the SVG animations run on canvas for reduced CPU load and smooth, up-scaled display
* a dedicated multi SVG image and SVG group loader class to preload all SVG stuff as super correct tagged SVG images
* inline SVG groups are loaded into a dictionary of image instances and connected to their canvas


<table>
  <tbody>
    <tr>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/raw/dev/.github/browser_android.png" alt="browser android" height="555"/> 
      </td>
    </tr>
     <tr>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/raw/dev/.github/browser_tux_day_0755.PNG" alt="browser tux at daylight" width="600"/> 
      </td>
    </tr>
    <tr>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/raw/dev/.github/browser_tux_night_1918.PNG" alt="browser tux at night" width="600"/>
      </td>
    </tr>
  </tbody>
</table>

* each instance stores the image, a list of its SVG tags as well as the current transformation status and position, ...
* SVG path manipulation method with regex

The functional principle can be transferred to Java on Android to create dynamic 2D game backgrounds.

# Audio

Audio spectrum is used to animate the colors of the speaker symbol waves.
Speaker symbol shows customized colors for different levels of audio output strength and dynamic.
Unfortunately the display is very CPU hungry. So only one speaker is shown.

<p>Classic and Ambient &#128998;&#129001; music will often show other colors than Thrash Metal or Hip Hop &#128999;&#128997;.</p>

Master function [getAverageVolume()](https://github.com/44xtc44/EisenRadio/blob/dev/eisenradio/eisenhome/bp_home_static/js/svg-manage.js#L1760)
calculates the audio volume level. This function was created by "franks laboratory", link in the Thank-you section at bottom.

<p>The "scaling by rhythm" of frontman Tux and friends &#128039; &#128049; &#128059; is also driven by </p> 

[getAverageVolume()](https://github.com/44xtc44/EisenRadio/blob/dev/eisenradio/eisenhome/bp_home_static/js/svg-manage.js#L1760)

# Local audio and shuffled playlists

A local folder with files of different sound file types is called a playlist.
AAC and MP3 files are known to run. You can go back and forth in the list.

If AAC is hanging, you can repair the whole folder with "Tools/aacp file repair" menu.
Integrated from my [aacRepair](https://github.com/44xtc44/aacRepair) repo.

Remember, the app runs in a browser.
We *misuse* the upload multi select feature of the browser.
Nothing is uploaded, but file *objects* are caught in a list and played.


# Gain - preamp

Bring your earbuds to the limit.
EisenRadio owns a *Volume Gain* slider as well as [GhettoRecorder](https://github.com/44xtc44/GhettoRecorder)
Push the preamp to 300%. This feels like 20% louder.

Works with bluetooth headphones!


# Spectrum Analyzer

Spectrum analyzer canvas is now fully integrated and can be switched by the "TV" button.
Choose between different spectrum analyzer shows.

This concept can show its strengths if used to present the latest management reports.
A background video on canvas one and several statistics shown on separated, animated, or distorted monitors, canvas of course.

<table>
  <tbody>
    <tr>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/raw/dev/.github/spectrum_starfield.PNG" alt="Spectrum Analyzer one" style="width:35%"/> 
      </td>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/raw/dev/.github/spectrum_flowfield.PNG" alt="Spectrum Analyzer two" style="width:35%"/>
      </td>
    </tr>
  </tbody>
</table>


# Customized radio

"Edit" the radio settings. Upload your favorite pictures to the database. Add a comment.

The app page is separated by two areas.
A monitor to the left and a display area beside for pictures and comments or the playlist titles.

<img src="https://github.com/44xtc44/EisenRadio/raw/dev/.github/secondary_menu.png" alt="secondary_menu" height="500"/>

## Energy Saver

Sustainable fun reduction.
Some exotic browser and mobiles could be overwhelmed by the fully animated show.

You are compensated by a CPU icon that can change its color.

<img src="https://github.com/44xtc44/EisenRadio/raw/dev/.github/energy_saver.PNG" alt="fun reduction energy saver radio button" style="width:100px"/>


# Recorder

Called and terminated GhettoRecorder threads for listen and record.

This version suffers from the initial button press concept.
Next version of EisenRadio will use the latest GhettoRecorder for easy-peasy internal switching.

# Recorder blacklist feature

Each recorder refuses to write a file, if the title was written to its radio specific blacklist before.

One dedicated thread is responsible to update all radio blacklists.
All lists can be dumped into a JSON file and merged with GhettoRecorder blacklists. Uploaded to DB then.

EisenRadio writes temporary lists of known recorded file names in JSON format.
The SQLite database is updated with a fresh file name only if a recorder writes a new file.
An internet cloud connection count in mind.

# Multiple tools menu

* config with feature selection for animation level
* enable and maintain blacklists
* dump the radios or blacklist database to JSON files
* import a GhettoRecorder [settings.ini](https://github.com/44xtc44/GhettoRecorder/blob/dev/ghettorecorder/settings.ini) file to database to add more radio station URLs

<table>
  <tbody>
    <tr>
      <td>
        <a href="https://github.com/44xtc44/EisenRadio/raw/dev/.github/tools_menu.PNG">
          <img src="https://github.com/44xtc44/EisenRadio/raw/dev/.github/tools_menu.PNG" alt="tools for blacklist database dump and deletion" style="height:300px"/> 
        </a>
      </td>
      <td>
        <a href="https://github.com/44xtc44/EisenRadio/raw/dev/.github/config_show.PNG">
          <img src="https://github.com/44xtc44/EisenRadio/raw/dev/.github/config_show.PNG" alt="config show" style="height:300px"/>
        </a>
      </td>
      <td>
        <a href="https://github.com/44xtc44/EisenRadio/raw/dev/.github/blacklist_alter.PNG">
          <img src="https://github.com/44xtc44/EisenRadio/raw/dev/.github/blacklist_alter.PNG" alt="blacklist show" style="height:300px"/>
        </a>
      </td>
    </tr>
  </tbody>
</table>


# Help

Use the menu bar. *About* offers a help menu.

There is a "post-it", how to reveal the URL of your beloved radio station, hidden in an advertisement polluted website.

# Links

The app is available as

* Android Studio source code GitHub [EisenRadio-chaquopy](https://github.com/44xtc44/EisenRadio-chaquopy)
* Kivy Android source code GitHub [EisenRadio](https://github.com/44xtc44/EisenRadio/tree/dev/android/) and [PYPI - APK debug build](https://pypi.org/project/eisenradio-apk/)
* SNAP [eisenradio](https://snapcraft.io/eisenradio) and [PYPI package](https://pypi.org/project/eisenradio/).
* Report an issue: https://github.com/44xtc44/eisenradio/issues

# Command line

EisenRadio GUI supported by Flask server.::

    $ eisenradio  # executable script in Python Path
    $ python3 -m eisenradio.gui  # runs package if Python path is defective or the SNAP pkg installer knows eisenradio

WSGI server *Waitress* on a random port.::

    $ eisenradio-wsgi
    $ python3 -m eisenradio.wsgi

GhettoRecorder on command line.::

    $ eisenradio-cmd
    $ python3 -m eisenradio.cmd

GhettoRecorder stores recorded files in the package folder by default.::

    /home/osboxes/.local/lib/python3.6/site-packages/ghettorecorder/radios

You can change the folder via the menu options

# Export / Import of GhettoRecorder in- and output files

Eisenradio stores *radio names and URLs* and *blacklists* in its database.

You can export for GhettoRecorder ``settings.ini`` and ``blacklist.json`` from database.
``Tools/Export/Names and URLs`` menu.

GhettoRecorder created ``blacklist.json`` can be imported into your database.


# Eisenradio - the boring details

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
* Android APK Package uses Python Kivy for multi touch and promotes the app to "foreground service" (to not get killed)

         """ sketch """

         |B |               |S | Flask web server, Header[Werkzeug/2.0.2 Python/3.10.1]
         |r |listen         |e |-------> starRadio
         |o |------->   <-- |r |
         |w |GhettoRecorder |v |-------> planetRadio
         |s |--->    <----- |e |
         |e |               |r |-------> satelliteRadio
         |r |               |  |
         net: localhost     net: internet
         CORS: accept       CORS: deny
         audioNode: 1,-1    audioNode: 0, 0
         JavaScript,CSS     Python,SQL

    Cross-Origin Resource Sharing mechanism (CORS)
    i.a. prevents a Browser from analysing audio from internet


## pip install

    $ pip3 install eisenradio  # Tux
    > pip install eisenradio  # M$

## Pytest and tox

Part of the test automation with flake8 and tox on GitHub

    $ tox


## Uninstall

Python user:

    find the module location
    uninstall and then remove remnants

    $ pip3 show eisenradio

    $ pip3 uninstall eisenradio

    Location: ... /python310/site-packages

# Sphinx Documentation

https://eisenradio.readthedocs.io/en/latest/

# Known issues

Detected problems got a "todo" marker.
You can search through the project to see what is going wrong.

# Contributions

Pull requests are welcome.
If you want to make a major change, open an issue first to have a short discuss.

Next level could be [Blender 3D](https://www.blender.org/) objects rendered as 2D SVG in JavaScript motion.
Replace pure DOM element animation with canvas. Each animation gets its own canvas for more speed and to lower CPU.

# Thank you

[YouTube franks laboratory](https://www.youtube.com/results?search_query=franks+laboratory)

# License

MIT