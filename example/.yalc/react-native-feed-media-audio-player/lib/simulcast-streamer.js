import { NativeModules, NativeEventEmitter } from 'react-native';
import { useState, useEffect } from 'react'
const { RNFMSimulcastStreamer } = NativeModules;

/**
 * Create a simulcast streamer and return its state and state modifier.
 * 
 * The state looks like:
 * 
 * {
 *   state: 'UNINITIALIZED|IDLE|PLAYING|STALLED|UNAVAILABLE',
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
 *    UNINITIALIZED - the player hasn't been initialized yet. The player
 *       enters this state whenever it is given a new streaming token
 *       (via useState(token) or switchStream(token) or (connect(token)))
 *    IDLE - the player isn't playing anything
 *    PLAYING - music is playing, and 'currentPlay' is not null
 *    STALLED - the stream is buffering
 *    UNAVAILABLE - the stream is not available, for any number of reasons,
 *       but most likely due to the device being outside of countries
 *       that the music is licensed for.
 * 
 * The default state is UNINITIALIZED. The player will transition to IDLE or
 * UNAVAILABLE very shortly after being provided with a token identifying
 * a stream (via either useSimulcastStreamer(token) or connect(token) or (switchStream(token))).
 * The 'UNAVAILABLE' state is specific to the current stream.
 * 
 * The returned state modifier has a couple methods:
 * 
 * - connect(token?) - connect to streaming server and try to being playback of
 *               the current stream. An optional simulcast identier can be
 *               passed to the method to switch to a different stream before
 *               starting playback).
 * - disconnect(force?) - disconnect from streaming server and stop playback.
 *               optionally pass 'true' as an argument to cause the player to
 *               completely be reset. Resetting the player causes the next
 *               connect() call to re-validate the user's location before
 *               playing music. It also resets the 'token' value, so the next
 *               call to connect() requires a token argument.
 *               If you don't expect users to be switching IP addresses, then
 *               not setting this argument to 'true' can speed up music start
 *               time after a connect() call.
 * - setVolume(xx) - adjust the playback volume from 0..1
 * - switchStream(token) - disconnect from the current stream and switch
 *               to a new one. If music was playing while switchStream()
 *               is called, then an automatic 'connect()' will be called after
 *               switching to the new stream.
 * 
 * ** note ** - This streamer currently only supports the 'simulcast overlay'
 * style of streaming.
 * 
 * @param {string} token? String token that identifies the simulcast stream
 */



export default function useSimulcastStreamer(token = null) {
  let [streamerState, setStreamerState] = useState({ state: 'UNINITIALIZED', tryingToPlay: false, token: token, currentPlay: null, volume: 1 });

  useEffect(() => {
    // create new streamer object and subscribe to events
    const nativeEmitter = new NativeEventEmitter(RNFMSimulcastStreamer);

    const stateListener = nativeEmitter.addListener('state-change', ({ state }) => {
      setStreamerState((streamerState) => {
        let readableState;
        let currentPlay = streamerState.currentPlay;
        let tryingToPlay = streamerState.tryingToPlay;

        switch (state) {
          case RNFMSimulcastStreamer.SimulcastStateAvailable:
            readableState = 'IDLE'; currentPlay = null; break;
          case RNFMSimulcastStreamer.SimulcastStateUnavailable:
            readableState = 'UNAVAILABLE'; currentPlay = null; tryingToPlay = false; break;
          case RNFMSimulcastStreamer.Uninitialized:
            readableState = 'UNINITIALIZED'; currentPlay = null; break;
          case RNFMSimulcastStreamer.SimulcastStateIdle:
            readableState = 'IDLE'; currentPlay = null; break;
          case RNFMSimulcastStreamer.SimulcastStatePlaying:
            readableState = 'PLAYING'; break;
          case RNFMSimulcastStreamer.SimulcastStateStopped:
            readableState = 'IDLE'; currentPlay = null; break;
          case RNFMSimulcastStreamer.SimulcastStateStalled:
            readableState = 'STALLED'; break;
          default:
            readableState = 'UNINITIALIZED'
        }

        if (streamerState.tryingToPlay && (readableState === 'IDLE')) {
          //console.log('we are trying to connect!');
          readableState = 'STALLED';
          RNFMSimulcastStreamer.connect();
        }

        //console.log('state-change event', state, readableState, streamerState);

        return {
          ...streamerState,

          tryingToPlay,
          currentPlay: currentPlay,
          state: readableState,
        }
      });
    });

    const playStartedListener = nativeEmitter.addListener('play-started', ({ play }) => {
      //console.log('play-started event', play);

      if (play) {
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
        setStreamerState((streamerState) => ({
          ...streamerState,

          currentPlay: null
        }));
      }

    });

    const elapseListener = nativeEmitter.addListener('elapse', ({ elapsed }) => {
      setStreamerState((streamerState) => {
        if (streamerState.currentPlay) {
          return {
            ...streamerState,

            currentPlay: {
              ...streamerState.currentPlay,
              elapsed_seconds: elapsed
            }
          };
        } else {
          return streamerState;
        }
      });
    });

    const errorListener = nativeEmitter.addListener('error', (params) => {
      // this is never triggered in current implementation (!!)
      //console.log('error!', params);

      // HACK: iOS code should set state to UNAVILABLE, not emit error
      if (params && params.error && params.error.includes('Code=19')) {
        setStreamerState((streamerState) => ({
          ...streamerState,

          state: 'UNAVAILABLE'
        }));
      }
    });

    if (token) {
      //console.log("initializing with token", token);

      setStreamerState((streamerState) => ({
        ...streamerState,

        state: 'INITIALIZING'
      }));

      RNFMSimulcastStreamer.initialize(token);
    }

    return () => {
      //console.log('quitting');

      errorListener.remove();
      elapseListener.remove();
      playStartedListener.remove();
      stateListener.remove();

      RNFMSimulcastStreamer.disconnect(true);
    }
  }, []);

  useEffect(() => {
    if (streamerState.state === 'UNAVAILABLE') {
      return;
    }

    RNFMSimulcastStreamer.setVolume(streamerState.volume);

  }, [streamerState.volume]);

  return [streamerState, {
    connect: (token) => {
      token = token || streamerState.token

      if (!token) {
        console.log('no token provided to connect to');
        return;
      }

      if (streamerState.state === 'UNAVAILABLE') {
        console.log('not starting playback due to UNAVAILABLE state');
        return;
      }

      //console.log('connecting', token);
      if (token !== streamerState.token) {
        //console.log('switching tokens for connect');
        setStreamerState((streamerState) => ({
          ...streamerState,

          token: token,
          tryingToPlay: true,
          state: 'INITIALIZING'
        }));

        //console.log('trying to play should be true');

        RNFMSimulcastStreamer.initialize(token);

      } else if ((streamerState.state === 'IDLE') || (streamerState.state === 'AVAILABLE')) {
          //console.log('just connecting');
          setStreamerState((streamerState) => ({
            ...streamerState,
            tryingToPlay: true,
            state: 'STALLED'
          }));
          RNFMSimulcastStreamer.connect();

      } else if (streamerState === 'INITIALIZING') {
        setStreamerState((streamerState) => ({
          ...streamerState,

          token: token,
          tryingToConnect: true
        }));
      }
    },

    switchStream: (token) => {
      if (streamerState.token === token) {
        return;
      }

      setStreamerState((streamerState) => ({
        ...streamerState,

        token: token,
        state: 'INITIALIZING'
      }));

      RNFMSimulcastStreamer.initialize(token);
    },

    disconnect: (force = false) => {
      //console.log('disconnecting');
      if ((streamerState.state !== 'UNINITIALIZED') && (streamerState.state !== 'UNAVAILABLE')) {
        setStreamerState((streamerState) => ({
          ...streamerState,

          currentPlay: null,
          token: (force ? null : streamerState.token),
          state: (force ? 'UNINITIALIZED' : 'IDLE'),
          tryingToPlay: false
        }));

        RNFMSimulcastStreamer.disconnect(force);
      }
    },

    setVolume: (volume) => {
      setStreamerState((streamerState) => ({
        ...streamerState,

        volume: volume
      }));
    }
  }];
}
