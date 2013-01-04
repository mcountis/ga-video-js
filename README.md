ga-video-js
===========

google analytics plugin for [video.js](https://github.com/zencoder/video-js)

Include the plugin after including the main video.js file:

```html
<script type="text/javascript" src="/js/video-js/video.js"></script>
<script type="text/javascript" src="/js/video-js/ga.plugin.js"></script>
```

Minimal setup:
```javascript
_V_("VideoElement",{
  // other options and plugins here
  "ga": {}
});
```

Advanced setup:
```javascript
_V_("VideoElement",{
  // other options here
  "ga": {
    "category":"Video" // optional, category to use for Google Analytics Events, defaults to 'Video'
    ,"label":"{{unique_identifier_per_video}}" // optional, defaults to player.currentSrc()
    ,"queue":window._gaq // optional, defaults to window._gaq
    ,"logInterval":2 // optional, defaults to 15 seconds
    ,"onlyLogOriginalSrc": true // optional, will restrict logging to only apply to the original source of the video element in case the source is being changed (ads), defaults to true
    ,"debug":false // optional, when set to true will send all log reqeusts to _V_.log, which should go to window.console.log, defaults to false
  }
});
```
