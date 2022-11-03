# https://kivy.org/doc/stable/guide/packaging-android.html

# must have main.py in root of package folder,

[app]

title = EisenRadio Collection

package.name = eisenradio

package.domain = org.kivy

source.dir = ./



version.regex = __version__ = '(.*)'

version.filename = %(source.dir)s/main.py

requirements = python3,kivy==2.1.0,kivymd,android,flask==2.0.2,Werkzeug==2.0.2,configparser==5.0.2,requests==2.25.1,urllib3==1.26.7,waitress==2.0.0,certifi,python-dotenv

orientation = all

services = Eisenradio:%(source.dir)s/eisenradio/wsgi.py:foreground

osx.python_version = 3

# Kivy version to use

osx.kivy_version = 2.1.0

fullscreen = 0

android.permissions = INTERNET,ACCESS_NETWORK_STATE,ACCESS_WIFI_STATE,BLUETOOTH,WRITE_EXTERNAL_STORAGE,READ_EXTERNAL_STORAGE,FOREGROUND_SERVICE

android.foregroundServiceType = mediaPlayback

android.accept_sdk_license = True

p4a.branch = master

# (str) The Android arch to build for, choices: armeabi-v7a, arm64-v8a, x86

android.arch = arm64-v8a

# (str) Bootstrap to use for android builds

p4a.bootstrap = sdl2

# (str) Presplash of the application

presplash.filename = %(source.dir)s/android_splash1440.png

# (str) Icon of the application

icon.filename = %(source.dir)s/android_launcher_icon.png

[buildozer]

# (int) Log level (0 = error only, 1 = info, 2 = debug (with command output))

log_level = 2

# (int) Display warning if buildozer is run as root (0 = False, 1 = True)

warn_on_root = 0