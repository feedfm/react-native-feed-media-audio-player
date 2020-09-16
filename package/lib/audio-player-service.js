import AudioPlayer from './audio-player';

class AudioPlayerService {

  /**
   * This callback is passed true or false to indicate music availability
   * 
   * @callback availabilityCallback
   * @param {boolean} available - true when music is available for playback. false otherwise.
   */

  /**
     * Initialize player and kick off contact with feed.fm. This method creates
     * a singleton AudioPlayer that can be retrieved via the `player` property
     * or the `getAvailablePlayer` method. Multiple calls to this method after 
     * the first are ignored.
     * 
     * @param {string} options.token - token provided by Feed.fm. defaults to 'demo'
     * @param {string} options.secret - secret provided by Feed.fm. defaults to 'demo'
     * @param {boolean} options.debug - when true, add console.log statements to help with debugging
     * @param {availabilityCallback} options.whenAvailable - a function called when the player
     *   deems music to be available or not (see AudioPlayer.whenAvailable)
     * @param {boolean} options.enableBackgroundMusic - when true, the player will interact
     *   with the lock screen (iOS) and create a notification (Android) to enable background audio
     *   playback and control. The default is false. Note: if true, iOS will also require that 
     *   you have granted the app background audio permissions when building.
     * @returns {AudioPlayer} - the singleton AudioPlayer instance
     */

  initialize(options = {}) {
    if (this._audioPlayer) {
      // do not re-initialize
      return this._audioPlayer;
    }

    options = {
      token: 'demo',
      secret: 'demo',
      debug: false,
      enableBackgroundMusic: false,

      ...options
    };

    // create an audio player
    const audioPlayer = this._audioPlayer = new AudioPlayer(options.debug);

    // kick off native audio player creation
    audioPlayer.initialize(options.token, options.secret, options.whenAvailable, options.enableBackgroundMusic);

    return audioPlayer;
  }

  /**
     * Return initialized player or throw exception if `initialize()` hasn't been called yet.
     */

  get player() {
    if (!this._audioPlayer) throw new Error('initialize() not called before retrieving FeedAudoiPlayer');

    return this._audioPlayer;
  }

}

const audioPlayerService = new AudioPlayerService();

export default audioPlayerService;


