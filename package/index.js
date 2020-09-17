
import audioPlayerService from './lib/audio-player-service.js';
import useSimulcastStreamer from './lib/simulcast-streamer';

export {
  useSimulcastStreamer,
  audioPlayerService
};

/**
 * class AudioPlayerService:
 *
 * initialize({
 *   token: '',
 *   secret: '',
 *   onAvailable: function() { },
 *   onUnavailable: function() { },
 *   enableBackgroundMusic: false
 * })
 *
 * create player = AudioPlayer instance (state = UNINITIALIZED)
 *   pass in all init options
  * native.init(token, secret)
 *    intialize player
 *    register listeners
 *    save shared instance of FMAudioPlayer
 * return player
 */

/**
 * getPlayer() = return instance of audio player (null before initialize() call,
 *    regardless of state
 */


/**
 * Promise player = .getAvailablePlayer([onAvailable[, onUnavailable]])
 *    no args = returns promise with player or null
 *    single function = node style response with (error, player)
 *    double function = onAvailable(player) or onUnavailable(error)
 *  used to get player after we've confirmed music is available
 *
 * if player.available
 *   immediately call back
 * else add callback to list of listeners
 */

/**
 * class AudioPlayer {
 *   available = null
 *   availabilityListeners = []
 *   currentPlay = null
 *   activeStation = null
 *   skipListeners = []
 *
 *   keeps internal copy of active play and station
 *   (watches native relayed events)
 *   store time player entered PLAY state, + elapsed time before that
 *
 *   play - async
 *     native.play()
 *
 *   pause - async
 *     native.pause()
 *
 *   stop - async
 *     native.stop()
 *
 *   skip(onFailure) - async
 *      native.skip()
 *      add onFailure to skipListeners
 *
 *   getCurrentPlay() - return local copy
 *
 *   setActiveStation(station) - async
 *   getActiveStation() - return local copy
 *
 *   getElapsedTime() - compute elapsed
 *   getDuration() - return from play-started
 *
 *   setSecondsOfCrossfade() - async config
 *   setCrossfadeInEnabled() - async config
 *
 *   getStations() - return local copy
 *
 *   on(event, callback)
 *   off(event)
 *
 *   _onAvailableUnavailable
 *     available = ?
 *     call listeners
 *   _onStateChange
 *      save state
 *      if playing, also save elapsed and begin time
 *   _onStationChange
 *      save station
 *   _onPlayStarted
 *      save play, elapsed, and begin time
 *      empty skip listeners
 *   _onSkipFailed
 *      call listeners
 * }
 *
 * events:
 *    play-started - pass play information
 *    state-changed
 *    station-changed
 *    skip-failed
 *
 * by default, disable:
 *   command center
 *   notifications
 *
 *
 */
/**
 * player states:
 *

FMAudioPlayerPlaybackStateOfflineOnly,
AVAILABLE_OFFLINE_ONLY

FMAudioPlayerPlaybackStateUninitialized,
UNINITIALIZED

FMAudioPlayerPlaybackStateUnavailable,
UNAVAILABLE

FMAudioPlayerPlaybackStateWaitingForItem,
WAITING_FOR_ITEM

FMAudioPlayerPlaybackStateReadyToPlay,
READY_TO_PLAY

FMAudioPlayerPlaybackStatePlaying,
PLAYING

FMAudioPlayerPlaybackStatePaused,
PAUSED

FMAudioPlayerPlaybackStateStalled,
STALLED

FMAudioPlayerPlaybackStateRequestingSkip,
(playing)

FMAudioPlayerPlaybackStateComplete,
(ready to play)

*/

