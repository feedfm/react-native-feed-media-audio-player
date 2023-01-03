
# react-native-audio-player

This is the repository for our React Native bridge that allows
a React Native app to control our native audio players via
Javascript.

This repo contains our bridge plus an example app that we use
for development. The bridge code that is published to NPM
exists [in the `package` directory](https://github.com/feedfm/react-native-feed-media-audio-player/tree/master/package).

To use the library, run the following in your React Native app:

```
npm install react-native-feed-media-audio-player
cd ios
pod install
```

Look in the `example` dir in this repo to see an example app
that uses the player.

For help or bug reporting, please send an email to support@feed.fm.

---
**NOTE**

If your project also uses [react-native-jw-media-player](https://www.npmjs.com/package/react-native-jw-media-player) or [react-native-video](https://www.npmjs.com/package/react-native-video) you must use the following versions of each to avoid exoplayer related issues. 

react-native-jw-media-player : 0.2.29

react-native-video: v6.0.0-alpha.4 or above

---

## Overview 


 AudioPlayer is the bridge to a native FMAudioPlayer instance. This class tries
 to keep track of the state of the native player and forward on events to javascript
 listeners.

 To use it:
 ```Javascript
 let player = new AudioPlayer(); // player will be uninitialized
 player.initialize(token, secret, (available) => {   if (available) {
       // play music!
       player.play()
    } else {
       // this user doesn't have anything to listen to
    }
  }));
 ```
  the player emits a number of events that can be subscribed to with the `on()` method:
 
  elapsed - time has elapsed during playback
  session-updated - the client id of the current user has changed (in response
     to a setClientID or createNewClientID call), and possibly the list of
     available stations has updated as well
  play-started - a new song has started playback
  state-change - the player's state has changed
  station-change - the current station has changed
  skip-failed - the last skip request has failed



Methods available for player are described below along with documentation

```Javascript  

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
  initialize(token, secret, availability, handleRemoteCommands)
  
  /**
   * The provide callback will be executed as soon as the player determines that
   * music is available or not.
   *
   * @param {availabilityCallback} availability
   */
  whenAvailable(availability) 

  /**
   * Register a callback for the given event.
   *
   * @param {string} event - the event to subscribe to
   * @param {functin} callback - this function is called every time the event is triggered
   * @returns {function} - returns a function to unsubscribe from these events
   */
  on(event) 

  /**
   * Register a callback for the given event but, after a single call of the callback function,
   * the event is unsubscribed.
   *
   * @param {string} event  - the event to subscribe to
   * @param {function} callback  -
   */
  once(event, callback) 

  /**
   * Enable/disable AVAudiosession for iOS only
   */

  enableiOSAudioSession(enable) 

  /**
   * Begin playback of music in the current station, or resume playback after pausing.
   *
   */
  play() 

  /**
   * Pause music playback
   */
  pause() 

  /**
   * Ask the player to skip the current song. If the request is granted, the player
   * will automatically advance to the next song. If the request is denied, then
   * a 'skip-failed' event will be triggered and the current song will continue playback.
   */
  skip() 

  /**
   * Stop playback of the current song and free up any audio data in memory.
   */
  stop() 

  /**
   * Seek into the current station by the given number of seconds.
   */

  seekCurrentStationBy(seconds) 
  
  /**
   * Return promise with the number of seconds the player can jump ahead in the current station.
   */
  get maxSeekableLengthInSeconds() 

  /**
   * Return promise with int with value 0 or 1 on whether skipping is allowed in current station at this time. 
   */
  get canSkip()


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

  get playbackState() 

  /**
   * Return a `play` object that represents the current active song. The
   * play object looks like this:
   *
   * {
   *   title: 'song title',
   *   artist: 'performer',
   *   album: 'album song appears on',
   *   duration: xx, // duration of song (in seconds)
   *   metadata: { } // arbitrary metadata attached to song (URL to artwork, BPM info, genre info..)
   * }
   */
  get currentPlay() 

  /**
   * Update the player to pull music from the given station (which must have
   * come from the `stations` property)
   */
  set activeStation(station) 

  /**
   * The currently active station that music is drawn from.
   */
  get activeStation() 
  
  /**
   * Set the music volume (from 0..1)
   */
  set volume(volume) 

  /**
   * Return number of seconds of elapsed playback of the current play.
   */
  get elapsedTime() 

  /**
   * Return the client id that the Feed.fm SDK uses to identify the user.
   * This value will not be defined until the player has announced that 
   * music is available.
   */
  get clientID() 
  
  /**
   * Set the client id. This must be a valid client id, or it will be
   * ignored. This will trigger a re-request of the available stations.
   * The player will emit a 'session-updated' event after assigning the
   * new client ID and retrieving the list of stations. The `onSessionUpdated`
   * callback here is optional, and is equivalent to calling
   * `player.once('session-updated', onSessionupdated)`
   */
  setClientID(id, onSessionUpdated) 

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

  createNewClientID(onSessionUpdated) 

  /**
   * Return the list of available music stations to pull music from. This
   * will be undefined until the player has announce that it is available.
   */
  get stations() 

```
