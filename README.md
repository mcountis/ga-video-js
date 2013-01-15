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
_V_("{{video_element_id}}",{
  // other options and plugins here
  "ga": {}
});
```

Advanced setup:
```javascript
_V_("{{video_element_id}}",{
  // other options here
  "ga": {
    "category": "Video" // optional, category to use for Google Analytics Events, defaults to 'Video'
    ,"label": "{{unique_identifier_per_video}}" // optional, defaults to player.currentSrc()
    ,"queue": '_gaq' // optional, string that refers to google analytics queue array in window scope, defaults to '_gaq'
    ,"logInterval": 15 // optional, defaults to 15 seconds
    ,"volumeScale": 100 // optional, for volume change events, factor to normalize volume (as volume is stored as a float between 0.0 and 1.0), defaults to 100
    ,"onlyLogOriginalSrc": true // optional, will restrict logging to only apply to the original source of the video element in case the source is being changed (ads), defaults to true
    ,"debug": false // optional, when set to true will send all log reqeusts to _V_.log, which should go to window.console.log, defaults to false
    ,"holdEvent": {"volumechange":true} // optional, hash that will block events from being logged to GA.
  }
});
```
