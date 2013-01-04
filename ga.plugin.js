_V_.options.components['ga'] = {};

_V_.Ga = _V_.Component.extend({

  init: function (player, options) {
		this._super(player, options);
		this.initGa();
	},

	createElement: function (type, attrs) {
		return this._super(type, attrs);
	},
	
	initGa : function(){
		var options = this.player.options;
		
		if(!options.ga)
			return;
		
		options.ga.queue = options.ga.queue || window['_gaq'];
		
		if(!options.ga.queue)
			return;
		
		options.ga.category = options.ga.category || "Video";
		
		// use the video filename to log the interactions by default
		options.ga.label = options.ga.label || this.player.currentSrc();
		
		// log progress every 15 seconds be default
		options.ga.logInterval = Math.round(options.ga.logInterval) || 15;
		
		if(!options.ga.hasOwnProperty("onlyLogOriginalSrc"))
			options.ga.onlyLogOriginalSrc = true;

		if(!options.ga.hasOwnProperty("debug"))
			options.ga.debug = false;
		
		//this.progressPing = {};
		
		this.originalSrc = this.player.currentSrc();
		
		this.initEvents();
	},
	
	// for debugging purposes
	log : function(){
		if(this.player.options.ga.debug)
			_V_.log("_V_.Ga",arguments);
	},
	
	initEvents : function(){
		this.player.addEvent('play',_V_.proxy(this,this.onPlay));
		this.player.addEvent('pause',_V_.proxy(this,this.onPause));
		this.player.addEvent('ended',_V_.proxy(this,this.onComplete));
		this.player.addEvent('timeupdate',_V_.proxy(this,this.onTimeUpdate));
		this.player.addEvent('seeking',_V_.proxy(this,this.onSeeking));
		
		//this.player.addEvent('volumechange',_V_.proxy(this,this.onVolumeChange));
	},
	
	// rounds player's current time to the nearest whole second
	currentTime : function(){
		return Math.round(this.player.currentTime());
	},
	
	// rounds player's current source duration to the nearest second
	duration : function(){
		return Math.round(this.player.duration());
	},
	
	// normalize player's volume to an integer between 0 and 100
	volume : function(){
		return Math.round(this.player.volume() * 100);
	},
	
	/*
	clearProgressPingAhead : function(){
		this.player.removeEvent('play',_V_.proxy(this,this.clearProgressPingAhead));
		var i = this.player.options.ga.logInterval;
		for(var x = this.duration() - this.duration() % i; x >= this.currentTime(); x -= i)
			delete this.progressPing[x.toString()];
	},
	*/
	
	shouldLogSrc : function(){
		return !this.player.options.ga.onlyLogOriginalSrc || this.originalSrc == this.player.currentSrc();
	},
	
	logEvent : function(action/*,value,noninteraction*/){
		var options = this.player.options;
		var q = options.ga.queue;

		var args = ["_trackEvent",options.ga.category,action,options.ga.label];
		
		// value (currentTime() mostly)
		if(arguments.length > 1)
			args.push(arguments[1]);

		// noninteraction
		if(arguments.length > 2)
			args.push(arguments[2]);
		
		this.log("logEvent",arguments);
		
		if(this.shouldLogSrc()){
			if(!options.ga.debug)
				q.push.apply(q,[args]);
		} else {
			this.log("logEvent","not original source");
		}
	},
	
	logSeek : function(){
		this.player.removeEvent('play',_V_.proxy(this,this.logSeek));
		this.logEvent("Seek",this.currentTime());
	},
	
	onPlay : function(){
		this.logEvent("Play",this.currentTime());
	},
	
	onPause : function(){
		if(this.currentTime() != this.duration())
			this.logEvent("Pause",this.currentTime());
	},
	
	onComplete : function(){
		this.logEvent("Finish",this.duration(),true);
	},
	
	onTimeUpdate : function(){
		if(	(this.currentTime() > 0) && // not the beginning
			(this.currentTime() != this.duration()) && // not the end
			(this.currentTime() % this.player.options.ga.logInterval == 0) && // intersecting a log interval
			//(!this.progressPing[this.currentTime().toString()]) && // haven't already logged the interval
			this.shouldLogSrc() // check if should log non-original source and check if sources match if not
			){
			//this.progressPing[this.currentTime().toString()] = true;
			this.logEvent("Progress",this.currentTime(),true);
		}
	},
	
	onSeeking : function(){
		this.log("seeking");
		this.player.removeEvent('timeupdate',_V_.proxy(this,this.onTimeUpdate));
		this.player.removeEvent('seeking',_V_.proxy(this,this.onSeeking));
		this.player.addEvent('seeked',_V_.proxy(this,this.onSeek));
	},
	
	onSeek : function(){
		this.log("seeked");
		this.player.removeEvent('seeked',_V_.proxy(this,this.onSeek));
		this.player.addEvent('timeupdate',_V_.proxy(this,this.onTimeUpdate));
		this.player.addEvent('seeking',_V_.proxy(this,this.onSeeking));
		//this.player.addEvent('play',_V_.proxy(this,this.clearProgressPingAhead));
		//this.player.addEvent('play',_V_.proxy(this,this.logSeek));
	},
	
	onVolumeChange : function(){
		this.logEvent("Volume",this.player.muted? 0 : this.volume() );
	}
	
	
});
