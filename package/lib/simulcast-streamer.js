import { NativeModules, NativeEventEmitter } from 'react-native';
import { useState, useEffect } from 'react'
const { RNFMSimulcastStreamer } = NativeModules;

/**
 * Create a simulcast streamer and return its state and state modifier.
 * 
 * The state looks like:
 * 
 * {
 *   state: 'UNINITIALIZED|IDLE|PLAYING|STOPPED|STALLED|UNAVAILABLE',
 *   currentPlay: null or {
 *     title: 'song title',
 *     artist: 'performer',
 *     album: 'album song appears on',
 *     duration: xx           // duration of song (in seconds),
 *     elapsed_seconds: xx    // # of seconds of elapsed playback
 *   },
 *   volume: 0..1,
 * }
 *
 * The state values are:
 *    UNINITIALIZED - the player hasn't been initialized yet
 *    IDLE - the player isn't playing anything
 *    PLAYING - music is playing, and 'currentPlay' is not null
 *    STOPPED - the stream is still live, but music has ended (effectively it is IDLE)
 *    STALLED - the stream is buffering
 *    UNAVAILABLE - the stream is not available, for any number of reasons
 * 
 * The returned state modifier has three methods:
 * 
 * - connect() - connect to streaming server and try to being playback (this 
 *               see below)
 * - disconnect() - disconnect from streaming server and stop playback
 * - setVolume(xx) - adjust the playback volume from 0..1
 * 
 * A call to 'connect()' is ignored while in the 'UNINITALIZED' state, so
 * the 'connectAfterInitialized' parameter schedules an automatic
 * 'connect()' call as soon as the streamer is initialized.
 * 
 * ** note ** - This streamer currently only supports the 'simulcast overlay'
 * style of streaming.
 * 
 * @param {string} token String token that identifies the simulcast stream
 */

export default function useSimulcastStreamer(token) {
  let [streamerState, setStreamerState] = useState({ state: 'UNINITIALIZED', currentPlay: null, volume: 1 });

  useEffect(() => {
    console.log('initializing streamer');

    // create new streamer object and subscribe to events
    const nativeEmitter = new NativeEventEmitter(RNFMSimulcastStreamer);

    const stateListener = nativeEmitter.addListener('state-change', ({ state }) => {
      console.log("received state change", state);

      let readableState;
      switch (state) {
        case RNFMSimulcastStreamer.SimulcastStateIdle:
          readableState = 'IDLE'; break;
        case RNFMSimulcastStreamer.SimulcastStatePlaying:
          readableState = 'PLAYING'; break;
        case RNFMSimulcastStreamer.SimulcastStateStopped:
          readableState = 'STOPPED'; break;
        case RNFMSimulcastStreamer.SimulcastStateStalled:
          readableState = 'STALLED'; break;
        case RNFMSimulcastStreamer.SimulcastStateUnavailable:
          readableState = 'UNAVAILABLE'; break;
        default: 
          console.log('unknown state value:', state);
          readableState = 'UNINITIALIZED'
      }

      console.log('readable state is', readableState);

      setStreamerState((streamerState) => ({
        ...streamerState,

        state: readableState,
      }));
    });

    const playStartedListener = nativeEmitter.addListener('play-started', ({ play }) => {
      if (play) {
        console.log('play started', play);

        setStreamerState((streamerState) => ({
          ...streamerState,

          currentPlay: { 
            title: play.title,
            artist: play.artist,
            album: play.album,
            duration: play.duration,
            elapsed_seconds: 0
          }
        }));

      } else {
        console.log('null play started');

        setStreamerState((streamerState) => ({
          ...streamerState,

          currentPlay: null
        }));
      }

    });

    const elapseListener = nativeEmitter.addListener('elapse', ({ elapsed }) => {
      console.log('elapsed to ', elapsed);

      setStreamerState((streamerState) => ({
        ...streamerState,

        currentPlay: {
          ...streamerState.currentPlay,
          elapsed_seconds: elapsed
        }
      }));
    });

    const errorListener = nativeEmitter.addListener('error', (params) => {
      // this is never triggered in current implementation (!!)
      console.log('error!', params);
    });

    RNFMSimulcastStreamer.initialize(token);

    setStreamerState((streamerState) => ({
        ...streamerState,

        state: 'IDLE'
    }));

    return () => {
      console.log('disconnecting');

      errorListener.remove();
      elapseListener.remove();
      playStartedListener.remove();
      stateListener.remove();

      RNFMSimulcastStreamer.disconnect(token);
    }
  }, [ ]);

  useEffect(() => {
    console.log('setting volume to', streamerState.volume);
    //RNFMSimulcastStreamer.setVolume(streamerState.volume);

  }, [ streamerState.volume ]);

  return [streamerState, {
    connect: () => { RNFMSimulcastStreamer.connect(); },
    disconnect: () => { RNFMSimulcastStreamer.disconnect(); },

    setVolume: (volume) => { 
      console.log('updating volume to', volume);
      setStreamerState((streamerState) => ({
          ...streamerState,

          volume: volume
      }));
    }
  }];
}
