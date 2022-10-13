known problems
^^^^^^^^^^^^^^

   As bigger as the JS part gets, more problems arise.

   JS script loading order:

      animate.js:
         countUpDownInclusiveInt(min, max) feeds global 'animatedFunctionTimer' and could
         be replaced by svgAnimation.js 'class CountUpDown' instance to get consistent
         across the app. But then svgAnimation.js must be loaded before animate.js
         in index.html. This is not possible, since svgAnimation.js has other dependencies.
         And breaks the scripts then.
         Only way out is to restructure and use node.js to get the load functionality.
         module.exports ..., var tools = require('./tools');