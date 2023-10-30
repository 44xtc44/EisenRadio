# Eisenradio - a Web radio expandable collection

   ![alt logo of eisenradio](https://github.com/44xtc44/EisenRadio/raw/dev/docs/source/aircraft_logo.png)
   ![Tests](https://github.com/44xtc44/eisenradio/actions/workflows/tests.yml/badge.svg?branch=dev)

## Overview

This repository shows the source code of an SVG animated radio show. Routed flask endpoints on a SQLite database.

* First Inet Radio App that can run a Spectrum Analyser in a Browser (Feb,2022), have a look at the sketch below
* Images are created with [Inkscape](https://github.com/inkscape/inkscape)
* Advanced features for [GhettoRecorder](https://github.com/44xtc44/GhettoRecorder)

# Comic style animated internet radio

Inkscape animated SVG images are used everywhere in the app. Also for the background. JavaScript is the mover.

* Art director [AnimationTimer Class](https://github.com/44xtc44/EisenRadio/blob/dev/eisenradio/eisenhome/bp_home_static/js/svgAnimation.js) controls timer for all artist and stuff appearance
* Airshow executive director [moveRandomAngle()](https://github.com/44xtc44/EisenRadio/blob/dev/eisenradio/eisenhome/bp_home_static/js/svgAnimation.js) is using tangens function with no-go areas to minimize the "crash slot"
* Zeppelin grey scale SVG is colorized by random colors, plus color gradations [ShadesOfColor Class](https://github.com/44xtc44/EisenRadio/blob/dev/eisenradio/eisenhome/bp_home_static/js/svgAnimation.js)

<table>
  <tbody>
    <tr>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/blob/dev/.github/browser_tux_day_0755.PNG" alt="browser tux at daylight" /> 
      </td>
    </tr>
    <tr>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/blob/dev/.github/browser_tux_night_1918.PNG" alt="browser tux at night"/>
      </td>
    </tr>
  </tbody>
</table>

## Audio

Audio spectrum is used to animate the colors of some SVG images. Master function [getAverageVolume()](https://github.com/44xtc44/EisenRadio/blob/dev/eisenradio/eisenhome/bp_home_static/js/svgAnimation.js#L1760)
calculates the audio volume level. This function was created by "franks laboratory", link in the Thank-you section at bottom.

[PowerSwitch class](https://github.com/44xtc44/EisenRadio/blob/dev/eisenradio/eisenhome/bp_home_static/js/svgAnimation.js)
can color an unlimited number of path elements. It has also methods to animate different colors for different
audio dynamic levels. Input for PowerSwitch class is delivered by [powerLevelAnimation()](https://github.com/44xtc44/EisenRadio/blob/dev/eisenradio/eisenhome/bp_home_static/js/svgAnimation.js).

<p>Classic and Ambient &#128998;&#129001; music will often show other colors than Thrash Metal or Hip Hop &#128999;&#128997;.</p>

PowerSwitch class can also translate list pattern into flashing lights.

    let flashAni = new PowerSwitch({path: document.querySelectorAll("#z1PositionLights path"),
                        flashPatternList: [0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,1,1],
                  flashPatternMultiplier: 20});

Have a look at both speakers (color) or the zeppelin (flash).

<p>The "scaling by rhythm" of frontman Tux or friends &#128059;&#8205;&#10052;&#65039; is also driven by </p> 

[getAverageVolume()](https://github.com/44xtc44/EisenRadio/blob/dev/eisenradio/eisenhome/bp_home_static/js/svgAnimation.js#L1760) 

## &#9889; Spectrum Analyzer

Choose between different spectrum analyzer shows. Analyzer frame is detachable. Put it where you want.

<table>
  <tbody>
    <tr>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/blob/dev/.github/spectrum_starfield.PNG" alt="Spectrum Analyzer one" style="width:35%"/> 
      </td>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/blob/dev/.github/spectrum_flowfield.PNG" alt="Spectrum Analyzer two" style="width:35%"/>
      </td>
    </tr>
  </tbody>
</table>


## Energy Saver

Fun reduction option. Some browser and mobiles may be a bit overwhelmed by the fully animated show.

<img src="https://github.com/44xtc44/EisenRadio/blob/dev/.github/energy_saver.PNG" alt="fun reduction energy saver radio button" style="width:100px"/>

Switch off the most CPU hungry animations.

## Tools menu

Here you find tools to enable and maintain blacklists.
Configure animations, enable database dump or import a GhettoRecorder GitHub [settings.ini](https://github.com/44xtc44/GhettoRecorder/tree/dev/ghettorecorder>)
file to database to add more radio station URLs.

<table>
  <tbody>
    <tr>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/blob/dev/.github/tools_menu.PNG" alt="tools for blacklist database dump and deletion" style="width:300px"/> 
      </td>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/blob/dev/.github/config_show.PNG" alt="config show" style="width:300px"/>
      </td>
      <td>
        <img src="https://github.com/44xtc44/EisenRadio/blob/dev/.github/blacklist_alter.PNG" alt="blacklist show" style="width:300px"/>
      </td>
    </tr>
  </tbody>
</table>

## Shuffled Playlists

You find this option in the secondary menu under the on top teaser image.
Play your local audio files in the browser. Folders are used as playlists.

Bring your earbuds to the limit. EisenRadio has a *Volume Gain* slider as well as [GhettoRecorder](https://github.com/44xtc44/GhettoRecorder).
Pushes the preamp up to 300%.

## Organize

Use the menu bar. *About* offers a help menu.
Organize your web radios. Delete or update, backup and restore your radio stations.

# Links

The app is available as

* Android Studio source code GitHub [EisenRadio-chaquopy](https://github.com/44xtc44/EisenRadio-chaquopy)
* Kivy Android source code GitHub [EisenRadio](https://github.com/44xtc44/EisenRadio/tree/dev/android/) and [PYPI - APK debug build](https://pypi.org/project/eisenradio-apk/)
* SNAP [eisenradio](https://snapcraft.io/eisenradio) and [PYPI package](https://pypi.org/project/eisenradio/).
* Report an issue: https://github.com/44xtc44/eisenradio/issues

# Command line

EisenRadio GUI supported by Flask server.::

    $ eisenradio  # executable script in Python Path
    $ python3 -m eisenradio.gui  # runs package if Python path is defective

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

# Contributions

Pull requests are welcome.
If you want to make a major change, open an issue first to have a short discuss.

Next level could be [Blender 3D](https://www.blender.org/) objects rendered as 2D SVG in JavaScript motion.
Sprite technique with images from 3D. Perhaps a moving ship or a flying saucer?

# Thank you

[YouTube franks laboratory](https://www.youtube.com/results?search_query=franks+laboratory)

# License

MIT