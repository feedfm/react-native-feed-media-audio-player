import { NativeModules, NativeEventEmitter } from 'react-native';
import { useState, useEffect } from 'react'

/**
 * Create a simulcast streamer and return its state and state modifier.
 * 
 * The state looks like:
 * 
 * {
 *   state: 'UNINITIALIZED|IDLE|PLAYING|STALLED|UNAVAILABLE',
 *   currentPlay: {
 *     title: 'song title',
 *     artist: 'performer',
 *     album: 'album song appears on',
 *     duration: xx           // duration of song (in seconds),
 *     elapsed_seconds: xx    // # of seconds of elapsed playback
 *   },
 *   volume: 0..100,
 * }
 * 
 * The returned state modifier has three methods:
 * 
 * - connect() - connect to streaming server and try to being playback (this 
 *               is automatically called if 'connectAfterInitialized' is true - 
 *               see below)
 * - disconnect() - disconnect from streaming server and stop playback
 * - setVolume(xx) - adjust the playback volume from 0..100
 * 
 * A call to 'connect()' is ignored while in the 'UNINITALIZED' state, so
 * the 'connectAfterInitialized' parameter schedules an automatic
 * 'connect()' call as soon as the streamer is initialized.
 * 
 * ** note ** - This streamer currently only supports the 'simulcast overlay'
 * style of streaming.
 * 
 * @param {string} token String token that identifies the simulcast stream
 * @param {boolean} connectAfterInitialized when true, the simulcast stream 
 *             should immediately call connect() when it is intiailized
 */

export default function useSimulcastStreamer(token, connectAfterInitialized) {
  let [streamerState, setStreamerState] = useState({ state: 'UNINITIALIZED', currentPlay: null, volume: 1 });

  useEffect(() => {
    // create new streamer object and subscribe to events
    const nativeEmitter = new NativeEventEmitter(RNFMSimulcastStreamer);

    nativeEmitter.addListener('state-change', ({ eventToken, state }) => {
      if (eventToken !== token) { return; }

      setStreamerState({
        ...streamerState,

        state: props.state,
      });
    });

    nativeEmitter.addListener('play-started', ({ eventToken, play }) => {
      if (eventToken !== token) { return; }

      setStreamerState({
        ...streamerState,

        currentPlay: play
      })

    });

    nativeEmitter.addListener('elapse', ({ eventToken, elapsed }) => {
      if (eventToken !== token) { return; }

      setStreamerState({
        ...streamerState,

        play: {
          ...streamerState.play,
          elapsed_seconds: elapsed
        }
      });
    });

    nativeEmitter.addListener('error', ({ eventToken, error }) => {
      if (eventToken !== token) { return; }

      // this is never triggered in current implementation (!!)
    });

    RNFMSimulcastStreamer.initialize(token);

    return () => {
      RNFMSimulcastStreamer.disconnect(token);
    }
  }, []);

  return [streamerState, {
    connect: () => { RNFMSimulcastStreamer.connect(token); },
    disconnect: () => { RNFMSimulcastStreamer.disconnect(token); },
    setVolume: (volume) => { RNFMSimulcastStreamer.setVolume(token, volume); }
  }];
}