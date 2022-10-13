technical sketch
^^^^^^^^^^^^^^^^


sketch::

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