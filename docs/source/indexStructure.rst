=================================
main page <div> and JS load order
=================================

Div structure:
    Find position and z-index for quicker restructuring and error tracking.

* Most animation SVG are <use> tags in a div container;
  original drawings are 100px high and width. No viewport set.
  All images are collected in a <symbol> tag at the end of the main page.
* The images are drawn in two ways.
   #. Complete <g> group within a <svg> with one <use> tag.
   #. Ordered (split) <g> group within a <svg> with multiple <use> tags.

Second option allows for automatic assignment of random colors for specific
<g> group elements.
Often used is hardcoded scale to fit images into the scene. Mostly by using CSS, but also some hardcoded in HTML, which
is subject to change.

How <use> and <div> tags can be used:

   Animation with pure <svg> <use id="gImage"/> </svg> and
   <div> <svg> <use id="gImage"/> </svg> </div> differs in some ways.
   <use> element encapsulated groups can be animated within the <svg></svg> borders only.
   A transform action like translate (moving) leads to a disappearing image into
   the border of the svg. See clouds and satellites.
   z-index, or HTML page order (one below the other) of multiple <use> elements
   is the layer order. Lower <use> elements cover upper <use> layers.

   <div> elements can be moved within the whole html page.
   With all css style attributes and zindex applied.
   A <div> encapsulated <use> element can "leave" the <svg> borders

.. list-table:: Front page
   :widths: 8 20 65
   :header-rows: 1

   * - Hierarchy
     - <div> Name
     - Description
   * - N/A
     -
     - loader animations, div set for bright and dark style
   * - level_1
     - divStartPageFadeIn
     - fade in effekt for start page, broken since audio needs user interaktion
   * - level_2
     - frontPic
     - {justify-content:center;align-items:center;} a teaser pic
   * - level_2
     - progress
     - {position:relative;} progress bar base for timer
   * - level_3
     - divProgressBar
     - {position: absolute;z-index: 1;} progress bar
   * - level_2
     - bar_wrap_secondary_action
     - wrap to position the center div with secondary menu items
   * - level_3
     - wrap_secondary_action
     - {text-align: center} combo boxes, playlist, quick jump ...
   * - level_2
     - divPlayListContainer
     - playlist file names, a list made of divs to color 'em
   * - h5
     - divCacheListFeedAnchorJump
     - top anchor to jump upward from console
   * - level_2
     - divRadioContainer
     - {position:relative;} hull for radio styling
   * - div
     -
     - without name to group radio and comment at bottom
   * - level_3
     - divRadioFrontPlate
     - {position:relative,z-index:2;max-width:1000px;justify-content: center;align-items: center;}
   * - level_4
     - divMainAnimationContainer
     - wrapper for animated SVG
   * - level_5
     - animatedBackGround
     - {position: absolute;z-index:0;overflow:hidden;} sky and ocean, svg 1000x1000 bottom is the rectangle tuxStageSky
   * - level_5
     - divSvgBuoy
     - {position: absolute;z-index:10;} Edit button buoy with blinking top
   * - level_5
     - divSvgScrewHeadTopRight
     - {position: absolute;z-index:2;} screw head rotated
   * - level_5
     - divSvgGlasBreakTopRight
     - {position: absolute;z-index:1;} broken glas image
   * - level_5
     - divSvgScrewHeadTopLeft
     - {position: absolute;z-index:2;}
   * - level_5
     - divSvgScrewHeadBottomLeft
     - {position: absolute;z-index:2;}
   * - level_5
     - divSvgScrewHeadBottomRight
     - {position: absolute;z-index:2;}
   * - level_5
     - divSvgFlatSpeaker
     - {position: absolute;z-index:2;} speaker big for left
   * - level_5
     - divSvgFlatSpeakerTopRight
     - {position: absolute;z-index:2;} speaker small for right
   * - level_5
     - divCenterMovingSvgs
     - {position:relative;z-index:3;} inhabitants can move over screws and speaker
   * - level_6
     - divAnimationContainer
     - {[position: absolute;] } spawn point for moving divs
   * - level_7
     - divSvgZ1
     - {[position: absolute;z-index: 2;] } zeppelin
   * - level_7
     - divSvgTux
     - {[position: absolute;z-index: 31;] } penguin
   * - level_7
     - divSvgIceTux
     - {[position: absolute;z-index: 30;] } ice floe
   * - level_7
     - divSvgPolarBear
     - {[position: absolute;z-index: 31;] } PolarBear
   * - level_7
     - divSvglaGata
     - {[position: absolute;z-index: 31;] } la Gata del Diablo, Tiger
   * - level_7
     - divSvgB1
     - {[position: absolute;] } balloon
   * - level_7
     - divA1AirCraft
     - {[position: absolute;z-index:-1;]} aircraft
   * - level_7
     - divDragRopeA1AirCraft
     - {[position: absolute;z-index:4;]} parachute drop, scripted in JS, children of parent divDragRopeA1AirCraft
   * - level_7
     - divHorizon
     - calculate ocean horizon for satellites to disappear
   * - level_4
     - divHeaderShadow
     - {position: absolute;} only a shadow for the radio headline
   * - level_4
     - divMeasurementsUpper
     - {position: absolute;z-index:2;} redesigned, keep name, badge with speed, kb/s
   * - level_4
     - divGracefulDegradation
     - {position: absolute;z-index:11;} CPU buttons to switch most animations off
   * - level_4
     - divBtnContainer
     - {position:relative} listen, record buttons
   * - level_5
     - divBtnAbsWrapper
     - {position:absolute;} wraps divPictureRow, divStationGenre, record buttons to easy relocate
   * - level_6
     - divPictureRow
     - {position:relative;} custom pic
   * - level_6
     - divButtons
     - {position:relative;z-index:10;} record, listen buttons
   * - level_3
     - divCustomText
     - custom text outside the radio to get a "painting in museum with description effect"


.. note::
   Level are hierarchy. 1 encapsulate 2, 2 encapsulate 3 and so forth.

order of loading JS:
    <script type="text/javascript" src="..."></script>

 * src="{{ url_for('eisenhome_bp.static', filename='/js/index.js') }}
 * src="{{ url_for('eisenhome_bp.static', filename='/js/animate.js') }}
 * src="{{ url_for('eisenhome_bp.static', filename='/js/canvas.js') }}"
 * src="{{ url_for('eisenhome_bp.static', filename='/js/radioStyles.js') }}"
 * src="{{ url_for('eisenhome_bp.static', filename='/js/svgAnimation.js') }}"
 * src="{{ url_for('eisenhome_bp.static', filename='/js/playlist.js') }}"
