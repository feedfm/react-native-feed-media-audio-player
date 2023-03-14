
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import NanoEvents from 'nanoevents';
const { RNFMAudioPlayer } = NativeModules;

/* 
 * AudioPlayer is the bridge to a native FMAudioPlayer instance. This class tries
 * to keep track of the state of the native player and forward on events to javascript
 * listeners.
 *
 * To use it:
 *
 * let player = new AudioPlayer(); // player will be uninitialized
 * player.initialize(token, secret, (available) => {
 *   if (available) {
 *      // play music!
 *      player.play()
 *   } else {
 *      // this user doesn't have anything to listen to
 *   }
 * }));
 *
 * the player emits a number of events that can be subscribed to with the `on()`
 * method:
 *
 * elapsed - time has elapsed during playback
 * session-updated - the client id of the current user has changed (in response
 *    to a setClientID or createNewClientID call), and possibly the list of
 *    available stations has updated as well
 * play-started - a new song has started playback
 * state-change - the player's state has changed
 * station-change - the current station has changed
 * skip-failed - the last skip request has failed
 */

class AudioPlayer {

  constructor(debug) {
    this._debug = !!debug;

    // default state until we hear from the player
    this._state = RNFMAudioPlayer.audioPlayerPlaybackStateUninitialized;

    // keep track of availability
    this._available = null;
    this._availabilityCallbacks = [];

    // how we communicate to clients:
    this._emitter = new NanoEvents();

    // register to get notices from native event emitters
    const nativeEmitter = new NativeEventEmitter(RNFMAudioPlayer);
    this.availabilitySubscription = nativeEmitter.addListener('availability', this.onAvailability.bind(this));
    this.updatedSessionSubscription = nativeEmitter.addListener('session-updated', this.onSessionUpdated.bind(this));
    this.stateChangeSubscription = nativeEmitter.addListener('state-change', this.onStateChange.bind(this));
    this.onStationChangeSubscription = nativeEmitter.addListener('station-change', this.onStationChange.bind(this));
    this.onPlayStartedSubscription = nativeEmitter.addListener('play-started', this.onPlayStarted.bind(this));
    this.onSkipFailedSubscription = nativeEmitter.addListener('skip-failed', this.onSkipFailed.bind(this));
    this.elapseSubscription = nativeEmitter.addListener('elapse', this.onElapse.bind(this));
    this.prepareSubscription = nativeEmitter.addListener('musicQueued', this.onMusicQueued.bind(this));
  }

  log() {
    if (this._debug) {
      var args = ['feed.fm: ' + arguments[0], ...Array.prototype.slice.call(arguments, 1)];
      console.log.apply(console.log, args);
    }
  }

  /**
   * This callback is passed true or false to indicate music availability
   *
   * @callback availabilityCallback
   * @param {boolean} available - true when music is available for playback. false otherwise.
   */

  /**
   * Initialize the native player. This stops any music playback and causes the player
   * to try to contact Feed.fm to find available music stations.
   *
   * *note* - calling this multiple times with different token/secret values requires an app restart.
   *
   *
   * @param {string} token - token value provided by Feed.fm
   * @param {string} secret - secret value provided by Feed.fm
   * @param {availabilityCallback} [availability] - callback that is called once when
   *       availability is determined
   * @param {boolean} [handleRemoteCommands] - when true, the audio player should
   *       integrate with lock screen controls (iOS) or notification controls (Android)
   *       to support background audio playback and control.
   */
  initialize(token, secret, availability, handleRemoteCommands) {
    this.log('initializing with token "' + token + '" and secret "' + secret + '"');

    RNFMAudioPlayer.initializeWithToken(token, secret, handleRemoteCommands);

    if (availability) {
      this.whenAvailable(availability);
    }
  }

  /**
   * The provide callback will be executed as soon as the player determines that
   * music is available or not.
   *
   * @param {availabilityCallback} availability
   */
  whenAvailable(availability) {
    if (this._available !== null) {
      this.log('music has become available');
      availability(this._available);
      return;
    }

    this._availabilityCallbacks.push(availability);
  }

  /**
   * Register a callback for the given event.
   *
   * @param {string} event - the event to subscribe to
   * @param {functin} callback - this function is called every time the event is triggered
   * @returns {function} - returns a function to unsubscribe from these events
   */
  on(event) {
    this.log('client registered "on" handler for "' + event + '"');
    return this._emitter.on.apply(this._emitter, arguments);
  }

  /**
   * Register a callback for the given event but, after a single call of the callback function,
   * the event is unsubscribed.
   *
   * @param {string} event  - the event to subscribe to
   * @param {function} callback  -
   */
  once(event, callback) {
    this.log('client registered "once" handler for "' + event + '"');

    const unbind = this._emitter.on(event, function () {
      unbind();
      callback.apply(this, arguments);
    });
    return unbind;
  }

  /**
   * Enable/disable AVAudiosession for iOS only
   */

  enableiOSAudioSession(enable) {
    this.log('client called enableAudiosession =' + enable);

    if (Platform.OS === 'ios') {
      RNFMAudioPlayer.enableAudioSession(enable);
    }
  }

  /**
   * Begin playback of music in the current station, or resume playback after pausing.
   *
   */
  play() {
    this.log('client called play()');
    RNFMAudioPlayer.play();
  }

  /**
   * Pause music playback
   */
  pause() {
    this.log('client called pause()');
    RNFMAudioPlayer.pause();
  }

  /**
   * Ask the player to skip the current song. If the request is granted, the player
   * will automatically advance to the next song. If the request is denied, then
   * a 'skip-failed' event will be triggered and the current song will continue playback.
   */
  skip() {
    this.log('client called skip()')
    RNFMAudioPlayer.skip();
  }

  /**
   * Stop playback of the current song and free up any audio data in memory.
   */
  stop() {
    this.log('client called stop()');
    RNFMAudioPlayer.stop();
  }

  /**
   * Return promise with the number of seconds the player can jump ahead in the current station.
   */

  get maxSeekableLengthInSeconds() {
    return RNFMAudioPlayer.maxSeekableLengthInSeconds();
  }


  /**
   * Return promise with int with 0 or 1 on whether skipping is allowed in current station at this time. 
   */

  get canSkip() {
    return RNFMAudioPlayer.canSkip();
  }


  /**
   * Seek into the current station by the given number of seconds.
   */

  seekCurrentStationBy(seconds) {
    RNFMAudioPlayer.seekCurrentStationBy(seconds);
  }

  /**
   * Return the current state of the music player. Possible states are:
   *
   * UNINITIALIED - player is contacting feed.fm servers for configuration
   * UNAVAILABLE - there is no music available to this client (for various reasons)
   * WAITING_FOR_ITEM - the player is waiting for the feed.fm servers to tell it what to play
   * READY_TO_PLAY - the player is idle and ready to begin playback
   * PLAYING - the player is actively playing a song.
   * PAUSED - the player has an active song but playback is paused
   * STALLED - the player is trying to play a song, but it's waiting for audio data to
   *   arrive.
   *
   * @returns {string} current player state
   */

  get playbackState() {
    switch (this._state) {
      case RNFMAudioPlayer.audioPlayerPlaybackStateUninitialized: return 'UNINITIALIZED';
      case RNFMAudioPlayer.audioPlayerPlaybackStateOfflineOnly: return 'OFFLINE';
      case RNFMAudioPlayer.audioPlayerPlaybackStateUnavailable: return 'UNAVAILABLE';
      case RNFMAudioPlayer.audioPlayerPlaybackStateWaitingForItem: return 'WAITING_FOR_ITEM';
      case RNFMAudioPlayer.audioPlayerPlaybackStateReadyToPlay: return 'READY_TO_PLAY';
      case RNFMAudioPlayer.audioPlayerPlaybackStatePlaying: return 'PLAYING';
      case RNFMAudioPlayer.audioPlayerPlaybackStatePaused: return 'PAUSED';
      case RNFMAudioPlayer.audioPlayerPlaybackStateStalled: return 'STALLED';
      default: return 'UNINITIALIZED';
    }
  }

  /**
   * Return a `play` object that represents the current active song. The
   * play object looks like this:
   *
   * {
   *   title: 'song title',
   *   artist: 'performer',
   *   album: 'album song appears on',
   *   canSkip: true|false,
   *   duration: xx, // duration of song (in seconds)
   *   metadata: { } // arbitrary metadata attached to song (URL to artwork, BPM info, genre info..)
   * }
   */
  get currentPlay() {
    return this._currentPlay;
  }

  /**
   * Update the player to pull music from the given station (which must have
   * come from the `stations` property)
   */
  set activeStation(station) {
    this.log('client setting active station to', station);
    RNFMAudioPlayer.setActiveStation(station.id);
  }

  /**
   * The currently active station that music is drawn from.
   */
  get activeStation() {
    return this._activeStation;
  }

  /**
   * Set the music volume (from 0..1)
   */
  set volume(volume) {
    this.log('client setting music volume to ' + volume);
    RNFMAudioPlayer.setVolume(volume);
  }

  /**
   * Return number of seconds of elapsed playback of the current play.
   */
  get elapsedTime() {
    let seconds = this._elapsedPlayTime;

    return seconds;
  }

  /**
   * Return the client id that the Feed.fm SDK uses to identify the user.
   * This value will not be defined until the player has announced that 
   * music is available.
   */
  get clientID() {
    return this._clientID;
  }

  /**
   * Set the client id. This must be a valid client id, or it will be
   * ignored. This will trigger a re-request of the available stations.
   * The player will emit a 'session-updated' event after assigning the
   * new client ID and retrieving the list of stations. The `onSessionUpdated`
   * callback here is optional, and is equivalent to calling
   * `player.once('session-updated', onSessionupdated)`
   */
  setClientID(id, onSessionUpdated) {
    RNFMAudioPlayer.setClientID(id);

    if (onSessionUpdated) {
      this.once('session-updated', onSessionUpdated);
    }
  }

  /**
   * Ask the SDK to create a new client id and update the list of
   * available stations. This triggers a 'session-updated' event
   * The player will emit a 'session-updated' event after assigning the
   * new client ID and retrieving the list of stations. The `onSessionUpdated`
   * callback here is optional, and is equivalent to calling
   * `player.once('session-updated', onSessionupdated)`
   *
   * @param {*} onSessionUpdated 
   */

  createNewClientID(onSessionUpdated) {
    RNFMAudioPlayer.createNewClientID();

    if (onSessionUpdated) {
      this.once('session-updated', onSessionUpdated);
    }
  }

  /**
   *
   * Log an event on feed.fm servers
   * 
   * @param {String} event Event name as String
   * @param {JSONObject} params Parameters as JSONObject
   */

    logEvent(event, params) {
      
      this.log('Log Event');
      RNFMAudioPlayer.logEvent(event, params);

    }

  /**
   * Return the list of available music stations to pull music from. This
   * will be undefined until the player has announce that it is available.
   */
  get stations() {
    return this._stations;
  }

  onElapse({ elapsed }) {
    this._elapsedPlayTime = elapsed;
    this._emitter.emit('elapsed', elapsed);
  }

  /**
   * Receives 'availability' event from native player. This event includes the
   * list of stations the player has received and the currently active station.
   *
   * The event passed in has the structure:
   *
   * {
   *   available: true|false,
   *   stations: [ { ... }, ... ],
   *   activeStationId: XX
   * }
   *
   * This method notifies all the entries in the _availabilityCallbacks array
   * and clears it it out.
   */
  onAvailability(props) {
    let available = this._available = props.available;
    
    if (available) {
      this.log('Music is available');
      this._stations = props.stations;
      this._activeStation = props.stations.find((station) => station.id === props.activeStationId);
      this._clientID = props.clientID;
    }

    while (this._availabilityCallbacks.length > 0) {
      let callback = this._availabilityCallbacks.shift();

      callback(available);
    }
  }

  onMusicQueued(props) {
    this.log('Music is queued');
    this._emitter.emit('musicQueued');
  }

  onSessionUpdated(props) {
    this._stations = props.stations;
    this._activeStation = props.stations.find((station) => station.id === props.activeStationId);
    this._clientID = props.clientID;

    this._emitter.emit('session-updated', props.clientID, this);
  }

  /**
   * Receives event from native code indicating that the state of the player has
   * changed.
   *
   * The object passed in looks like:
   * {
   *   state: XX
   * }
   */
  onStateChange(props) {

    //console.debug("new State=");
    //console.debug(props.state);

    if (props.state == RNFMAudioPlayer.audioPlayerPlaybackStateRequestingSkip) {
      // don't change the state - ignore this
      return;
    }

    if (this._state == props.state) {
      // we might be transitioning out of skip state back to the original state, so skip
      return;
    }

    const state = this._state = props.state;

    this.log('player state changed to ' + this.playbackState);
    this._emitter.emit('state-change', this.playbackState, this);
  }

  /**
     * Receives event from native code indicating that the active station has changed.
     *
     * The object passed in looks like:
     * {
     *   activeStationId: XX
     * }
     */

  onStationChange(props) {
    if(this._stations){
      this._activeStation = this._stations.find((station) => station.id === props.activeStationId);
      //console.log(this._activeStation);
      this._emitter.emit('station-change', this._activeStation, this);
    }
  }

  /**
     * Receives event from native code indicating the given song has started playback.
     *
     * The object passed in looks like:
     * {
     *   play: {
     *     id: 'xx',
     *     title: 'xx',
     *     artist: 'xx',
     *     track: 'xx',
     *     duration: xx, // duration in seconds
     *     metadata: { ... }
     *   }
     * }
     */

  onPlayStarted(props) {
    const play = props.play;

    this._currentPlay = play;

    if (play.station_id && this._stations) {
      const station = this._stations.find((station) => station.id === play.station_id);
      if (station) {
        station.hasNewMusic = false;
      }

      delete play.station_id;
    }

    // reset elapsed time counters
    this._elapsedPlayTime = 0;
    this._emitter.emit('play-started', this._currentPlay, this);
  }

  /**
   * Receives 'skip-failed' event from native player and forwards it on
   * to clients.
   */
  onSkipFailed() {
    this._emitter.emit('skip-failed');
  }

}

export default AudioPlayer;
