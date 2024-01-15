Technical Overview
------------------
Project is the successor of GhettoRecorder and shall provide a database and HTML frontEnd.

How is this wired?
^^^^^^^^^^^^^^^^^^
 Flask server is divided by two routes, home and utils. To separate start page from "Tools" and "About".

Home
^^^^
   indexStructure.txt:
      Project overview for raw div structure of start page to jump fast in and around.

   canvas.js:
      animation of the canvas itself to detach the canvas window and make a small
      show on reconnect

   index.js:
      init stuff and rec and listen traffic of browser to server, dark mode, toggle ...

   playlist.js:
      Functions to run the local playlist feature with for-/backward controls

   radioStyles.js:
      full html css decoration for full animation and low for base, some decoration for recording

   svgAnimation.js:
      inkscape inline svg images animated in comic style (zeppelin, checkered balloon,
      floe by night)

Utils
^^^^^
   bp_utils.js:
      auto button press to hide buttons, write fake lists with parent, child
      divs to color log files, edit/delete blacklists, switch divs to show
      different tools options

   The db access is accomplished with pure sql. There was an attempt to switch to ORM,
   but the app will be a reference for sql.
   
   To show how to start a project with ORM, a side project Python package was created
   "Flask-SQLAlchemy-Project-Template 1.1".
   
   All animations can be fully or partial disabled to run the app on small devices.
   Playlist option with for-/backward controls available.

   Python modules for:
      monitor recordings:
      write grabbed files into blacklists, lists can be edited
		 
      Aac file repair:
         needed to fix incorrectly recorded aac files (no timer used to quit), so playlist not stuck
		 
      Export and Import:
         radio settings with *ini* files
         blacklists with *json* files, dictionary style
		 
      delete all:
         delete all radio table rows to restore from exported *ini* file