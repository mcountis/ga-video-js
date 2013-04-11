# ga-video-js

Google Analytics plugin for [video.js](https://github.com/zencoder/video-js)

## Event Actions

* Play - block by adding key 'play' to `ga.options.holdEvent` with some truthy value.
* Pause - block by adding key 'pause' to `ga.options.holdEvent` with some truthy value.
* Finish - block by adding key 'ended' to `ga.options.holdEvent` with some truthy value.
* Progress - block by adding key 'timeupdate' to `ga.options.holdEvent` with some truthy value.

## Setup

Include the plugin after including the main video.js file:

```html
<script type="text/javascript" src="/js/video-js/video.js"></script>
<script type="text/javascript" src="/js/video-js/ga.plugin.js"></script>
```

### Minimal setup
```javascript
_V_("{{video_element_id}}",{
  // other options and plugins here
  "ga": {}
});
```

### Advanced setup
```javascript
_V_("{{video_element_id}}",{
  // other options here
  "ga": {
    "category": "Video"
    ,"label": "WMOKWNXC"
    ,"queue": '_gaq'
    ,"logInterval": 15
    ,"volumeScale": 100
    ,"onlyLogOriginalSrc": true
    ,"debug": false
    ,"holdEvent": {"progress":true}
  }
});
```

#### Parameters

All parameters passed in the options.ga hash are optional
* **`{{key}}:{{default_value}}`**
* `category:'Video'`
  Category to use for Google Analytics (GA) Events.
* `label:player.currentSrc()`
  Unique identifier to log under GA's Events' Label.
* `queue:'_gaq'`
  String that refers to google analytics queue array in window scope.
* `logInterval:15`
  Interval (in seconds) on which to log 'Progress' events.
* `volumeScale:100`
  For volume change events (not currently active); factor to normalize volume (as volume is stored as a float between 0.0 and 1.0).
* `onlyLogOriginalSrc:true`
  Will restrict logging to only apply to the original source of the video element in case the source is being changed (ads).
* `debug:false`
  When set to true will send all log reqeusts to _V_.log, which should go to window.console.log.
* `holdEvent:{}`
  Hash that will block events from being logged to GA.
