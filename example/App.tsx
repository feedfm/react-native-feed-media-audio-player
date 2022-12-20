/**
 * Sample React App that uses React Native Feed Media Audio Player
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { audioPlayerService } from 'react-native-feed-media-audio-player';
import AudioPlayer from 'react-native-feed-media-audio-player/lib/audio-player';
import Video from 'react-native-video';

// initialize the player as early in the app as possible
console.log('initializing!');
audioPlayerService.initialize({ token: 'demo', secret: 'demo', debug: true, enableBackgroundMusic: false });

// If you want to test transitions between songs, try using 'counting'
// for both the token and secret values. Also try 'badgeo' for both
// values to test out when no music is available.

/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */

type PlayerAvailability = boolean | null;

interface Station {
  id: number;
  name: string;
}

export default class App extends Component {
  player: AudioPlayer;
  playerV: Video;
  elapsedTimer: number;

  state: {
    playbackState: AudioPlayer['playbackState'];
    available: PlayerAvailability;
    requestingSkip: boolean;
    play: {
      title: string;
      artist: string;
      album: string;
      elapsed: number;
      duration: number;
      elapsedTime: AudioPlayer['elapsedTime'];
    };
    stations: Station[];
  };

  stateChangeUnbind: Function;

  stationChangeUnbind: Function;

  playStartedUnbind: Function;

  skipFailedUnbind: Function;

  sessionUpdatedUnbind: Function;

  constructor(props) {
    super(props);

    // @ts-ignore - Not initializing every property
    this.state = {
      // music is available (true), not available (false), or undetermined (null)
      available: null,
    };
    this.player = audioPlayerService.player;
  }

  componentDidMount() {
    // Make sure music is available for playback before registering event listeners
    this.player.whenAvailable((available) => {

      // no music is available
      if (!available) {
        this.setState({ available: false });
        return;
      }

      const player = this.player;
      player.enableiOSAudioSession(true);
      // music is available!
      this.setState({
        available: true,
        playbackState: player.playbackState,
        station: player.activeStation,
        stations: player.stations,
        requestingSkip: false
        // play: will hold the current play when one starts
      });


      this.elapsedTimer = window.setInterval(() => {
        if ((this.state.playbackState === 'PLAYING') && (this.state.play)) {
          this.setState({
            play: { ...this.state.play, elapsed: player.elapsedTime },
          });
        }
      }, 1000);

      this.stateChangeUnbind = player.on('state-change', (state) => {
        this.setState({ playbackState: state });
      });

      this.stationChangeUnbind = player.on('station-change', (station) => {
        this.setState({ station: station });
      });

      this.playStartedUnbind = player.on('play-started', (play) => {
        this.setState({
          requestingSkip: false,
          play: { ...play, elapsed: 0 },
        });
      });

      this.skipFailedUnbind = player.on('skip-failed', () => {
        this.setState({
          requestingSkip: false,
          play: { ...this.state.play, canSkip: false },
        });
      });

      this.sessionUpdatedUnbind = player.on('session-updated', () => {
        this.setState({
          station: player.activeStation,
          stations: player.stations,
        })
      })
    });
  }

  componentWillUnmount() {
    if (this.state.available) {
      this.stateChangeUnbind();
      this.stationChangeUnbind();
      this.playStartedUnbind();
      this.skipFailedUnbind();
      this.sessionUpdatedUnbind();
      clearInterval(this.elapsedTimer);
    }
  }

  skip() {
    // note that we're trying to skip
    this.setState({ requestingSkip: true });
    // ask the player to skip the current song
    audioPlayerService.player.skip();
  }

  renderButtons() {

    return [
      (
        <View key="cid" style={styles.container}>
          <Text style={styles.text}>CID={this.player.clientID}</Text>
        </View>
      ),
      <Button
        key="play"
        onPress={() => {
          audioPlayerService.player.play();
        }} title={'click to play '} />,
      <Button
        key="CreateCID"
        onPress={() => {
          audioPlayerService.player.createNewClientID(() => {
            console.log('all ready with new client id!', audioPlayerService.player.clientID);
            console.log('with new stations!', audioPlayerService.player.stations);
          });
        }} title={'Create new client id'} />,

      <Button
        key="SetCID"
        onPress={() => {
          audioPlayerService.player.setClientID('fmcidv1:kkerxjsj:2bj:0cc7obvv0m', () => {
            console.log('returned to old client id', audioPlayerService.player.clientID);
            console.log('stations are now', audioPlayerService.player.stations);
          });
        }} title={'Assign old client id'} />,

      ...this.state.stations.map(station =>
        <Button
          key={'key' + station.id}
          onPress={() => {
            audioPlayerService.player.activeStation = station;
          }} title={'click to Set ' + station.name} />
      )
    ];
  }


  render() {
    // player still intializing
    if (this.state.available === null) {
      return (
        <View style={styles.container}>


          <Text style={styles.text}>initializing...</Text>
        </View>
      );
    }

    // no music availale for playback
    if (this.state.available === false) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>sorry, no music is available for you</Text>
        </View>
      );
    }

    // music is available!
    switch (this.state.playbackState) {
      case 'READY_TO_PLAY':
        return (
          <View style={styles.container}>
                      
            {this.renderButtons()}
          </View>

        );

      case 'WAITING_FOR_ITEM':
      case 'STALLED':
        return (
          <View style={styles.container}>
            <Text style={styles.text}>waiting for music..</Text>
          </View>
        );

      case 'PLAYING':
        return (
          <View style={styles.container}>
            <Video source={{uri: "https://cdn.jwplayer.com/manifests/BxgGjBH3.m3u8"}}   // Can be a URL or a local file.
resizeMode={"contain"}

       ref={(ref) => {
          if(ref != null) {
          ref.posterResizeMode="center"
          this.playerV = ref
          }
       }} 
       style={styles.backgroundVideo} />
            <Text style={styles.text}>{this.state.play?.title}</Text>
            <Text style={styles.text}>by {this.state.play?.artist}</Text>
            <Text style={styles.text}>on {this.state.play?.album}</Text>
            <Text style={styles.text}>{this.state.play?.elapsed} of {this.state.play?.duration} seconds elapsed</Text>
            <Button onPress={() => {
              audioPlayerService.player.pause();
            }} title="pause" />
            {
              this.state.requestingSkip ?
                (<Text style={styles.text}>(trying to skip)</Text>) :
                (<Button onPress={() => { this.skip(); }} title="skip" />)
            }
            <Button onPress={() => {
              audioPlayerService.player.volume = 0;
            }} title="vol 0" />
            <Button onPress={() => {
              audioPlayerService.player.volume = 0.5;
            }} title="vol 0.5" />
            <Button onPress={() => {
              audioPlayerService.player.volume = 1;
            }} title="vol 1" />


          </View>
        );

      case 'PAUSED':
        return (
          <View style={styles.container}>
            <Text style={styles.text}>{this.state.play.title}</Text>
            <Text style={styles.text}>by {this.state.play.artist}</Text>
            <Text style={styles.text}>on {this.state.play.album}</Text>
            <Text style={styles.text}>{this.state.play.elapsed} of {this.state.play.duration} seconds elapsed</Text>
            <Button onPress={() => {
              audioPlayerService.player.play();
            }} title="play" />
            {
              !audioPlayerService.player.canSkip ? (<Text style={styles.text}>(Skipping not allowed)</Text>) :
                this.state.requestingSkip ? (<Text style={styles.text}>(trying to skip)</Text>) :
                  (<Button onPress={() => { this.skip(); }} title="skip" />)
            }
            <Button onPress={() => {
              audioPlayerService.player.stop();
            }} title="stop" />
          </View>
        );

      case 'UNINITIALIZED':
        // not reached, because player.state.available is not null at this point:
        return (
          <View style={styles.container}>
            <Text style={styles.text}>no state available yet</Text>
          </View>
        );

      case 'OFFLINE':
        // not yet exposed to react native clients
        return (
          <View style={styles.container}>
            <Text style={styles.text}>offline playback only!</Text>
          </View>
        );

    }

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'right',
    margin: 10,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 50,
    right: 50,
    
  }
});
