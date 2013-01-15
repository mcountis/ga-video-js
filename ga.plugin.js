_V_.options.components['ga'] = {};

_V_.Ga = _V_.Component.extend({

	init: function (player, options) {
		this._super(player, options);
		this.initGa();
		
		this.el.style.display = "none";
	},

	createElement: function (type, attrs) {
		return this._super(type, attrs);
	},
	
	initGa : function(){
		var options = this.player.options;
		
		if(!options.ga)
			return;
		
		// string representing variable in window scope of GoogleAnalytics' async queue functionality
		options.ga.queue = options.ga.queue || '_gaq';
		
		if( !options.ga.queue || !window[options.ga.queue] )
			return;
		
		options.ga.category = options.ga.category || "Video";
		
		// use the video filename to log the interactions by default
		options.ga.label = options.ga.label || this.player.currentSrc();
		
		// log progress every 15 seconds be default
		options.ga.logInterval = Math.round(options.ga.logInterval) || 15;
		
		options.ga.volumeScale = options.ga.volumeScale || 100;
		
		// enforces matching between video sources
		if(!options.ga.hasOwnProperty("onlyLogOriginalSrc"))
			options.ga.onlyLogOriginalSrc = true;

		if(!options.ga.hasOwnProperty("debug"))
			options.ga.debug = false;
		
		options.ga.holdEvent = options.ga.holdEvent || {};
		
		// keeps track of logged progress milestones, as progress is tracked by rounding the currentTime() and several currentTime() values can round to the same value
		this.progressPing = {};
		
		this.originalSrc = this.player.currentSrc();
		
		this.initEvents();
	},
	
	getQueue : function(){
		return window[this.player.options.ga.queue];
	},
	
	// for debugging purposes
	log : function(){
		var args = Array.prototype.slice.call(arguments);
		//if(this.player.options.ga.debug)
			_V_.log.apply(_V_,["Ga"].concat(args));
	},
	
	initEvents : function(){
		this.player.addEvent('play',_V_.proxy(this,this.onPlay));
		this.player.addEvent('pause',_V_.proxy(this,this.onPause));
		this.player.addEvent('ended',_V_.proxy(this,this.onComplete));
		this.player.addEvent('timeupdate',_V_.proxy(this,this.onTimeUpdate));
		this.player.addEvent('seeking',_V_.proxy(this,this.onSeeking));
		
		//this.player.addEvent('playing',_V_.proxy(this,this.onPlaying));
		
		//this.player.addEvent('volumechange',_V_.proxy(this,this.onVolumeChange));
	},
	
	// rounds player's current time to the nearest whole second
	currentTime : function(){
		return Math.floor(this.player.currentTime());
	},
	
	// rounds player's current source duration to the nearest second
	duration : function(){
		return Math.floor(this.player.duration());
	},
	
	// normalize player's volume to an integer between 0 and options.ga.volumeScale
	volume : function(){
		return Math.round(this.player.volume() * this.player.options.ga.volumeScale);
	},
	
	clearProgressPingAhead : function(/*cTime*/){
		var cTime = this.currentTime();
		
		if(arguments.length > 0)
			cTime = arguments[0];
		
		this.player.removeEvent('play',_V_.proxy(this,this.clearProgressPingAhead));
		var i = this.player.options.ga.logInterval;
		for(var x = this.duration() - this.duration() % i; x >= cTime; x -= i)
			delete this.progressPing[x.toString()];
	},
	
	shouldLogSrc : function(){
		return !this.player.options.ga.onlyLogOriginalSrc || this.originalSrc == this.player.currentSrc();
	},
	
	logEvent : function(action/*,value,noninteraction*/){
		var options = this.player.options;
		var q = this.getQueue();
		var _this = this;

		var args = [options.ga.category,action,options.ga.label];
		
		// value (currentTime() mostly)
		if(arguments.length > 1)
			args.push(arguments[1]);

		// noninteraction
		if(arguments.length > 2)
			args.push(arguments[2]);
		
		//this.log.apply(this,["logEvent"].concat(args));
		
		if(this.shouldLogSrc()){
			if(!options.ga.debug){
				q.push.apply(q,[function(){
						var tr = _gat._getTrackerByName();
						_this.log("logEvent(" + args.join() + ")?",tr._trackEvent.apply(tr,args));
					}]);
			}
		} else {
			if(options.ga.debug)
				this.log("logEvent","not original source");
		}
	},
	
	logSeek : function(){
		this.player.removeEvent('play',_V_.proxy(this,this.logSeek));
		//this.logEvent("Seek",this.currentTime());
	},
	
	onPlay : function(){
		if(this.player.options.ga.holdEvent["play"])
			return false;
		//this.player.removeEvent('play',_V_.proxy(this,this.onPlay));
		//this.player.addEvent('pause',_V_.proxy(this,this.onPause));
		//this.player.addEvent('ended',_V_.proxy(this,this.onComplete));
		this.logEvent("Play",this.currentTime());
	},
	
	onPlaying: function(){
		if(this.player.options.ga.holdEvent["playing"])
			return false;
		this.logEvent("Playing",this.currentTime());
	},
	
	onPause : function(){
		if(this.player.options.ga.holdEvent["pause"])
			return false;
		//this.player.addEvent('play',_V_.proxy(this,this.onPlay));
		//this.player.removeEvent('pause',_V_.proxy(this,this.onPause));
		//this.player.removeEvent('ended',_V_.proxy(this,this.onComplete));
		if(this.currentTime() != this.duration())
			this.logEvent("Pause",this.currentTime());
	},
	
	onComplete : function(){
		if(this.player.options.ga.holdEvent["ended"])
			return false;
		//this.player.addEvent('play',_V_.proxy(this,this.onPlay));
		//this.player.removeEvent('pause',_V_.proxy(this,this.onPause));
		//this.player.removeEvent('ended',_V_.proxy(this,this.onComplete));
		
		this.clearProgressPingAhead(0);
		this.logEvent("Finish",this.duration(),true);
	},
	
	onTimeUpdate : function(){
		if(this.player.options.ga.holdEvent["timeupdate"])
			return false;
		if(	(this.currentTime() > 0) && // not the beginning
			(this.currentTime() != this.duration()) && // not the end
			(this.currentTime() % this.player.options.ga.logInterval == 0) && // intersecting a log interval
			(!this.progressPing[this.currentTime().toString()]) && // haven't already logged the interval
			//this.shouldLogSrc() && // check if should log non-original source and check if sources match if not
			true
			){
			this.progressPing[this.currentTime().toString()] = true;
			this.logEvent("Progress",this.currentTime(),true);
		}
	},
	
	onSeeking : function(){
		if(this.player.options.ga.holdEvent["seeking"])
			return false;
		this.log("seeking");
		this.player.removeEvent('timeupdate',_V_.proxy(this,this.onTimeUpdate));
		this.player.removeEvent('seeking',_V_.proxy(this,this.onSeeking));
		this.player.removeEvent('play',_V_.proxy(this,this.logSeek));
		this.player.addEvent('seeked',_V_.proxy(this,this.onSeek));
	},
	
	onSeek : function(){
		if(this.player.options.ga.holdEvent["seeked"])
			return false;
		this.log("seeked");
		this.player.removeEvent('seeked',_V_.proxy(this,this.onSeek));
		this.player.addEvent('timeupdate',_V_.proxy(this,this.onTimeUpdate));
		this.player.addEvent('seeking',_V_.proxy(this,this.onSeeking));
		this.player.addEvent('play',_V_.proxy(this,this.clearProgressPingAhead));
		this.player.addEvent('play',_V_.proxy(this,this.logSeek));
	},
	
	onVolumeChange : function(){
		if(this.player.options.ga.holdEvent["volumechange"])
			return false;
		this.logEvent("Volume",this.player.muted? 0 : this.volume() );
	}
	
	
});
