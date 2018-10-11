/**
 * Sample React App that uses React Native Feed Media Audio Player
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Button } from 'react-native';
import audioPlayerService from 'react-native-feed-media-audio-player';

// initialize the player as early in the app as possible
audioPlayerService.initialize({ token: 'demo', secret: 'demo' });

// If you want to test transitions between songs, try using 'counting'
// for both the token and secret values. Also try 'badgeo' for both
// values to test out when no music is available.

export default class App extends Component {

  constructor(props) {
    super(props);
   
    this.state = {
      // music is available (true), not available (false), or undetermined (null)
      available: null,
    };
  }

  componentDidMount() {
    // Make sure music is available for playback before registering event listeners
    audioPlayerService.getAvailablePlayer((player) => {
      // no music is available
      if (!player) {
        this.setState({ available: false });
        return;
      }

      // music is available!
      this.setState({
        available: true,
        playbackState: player.playbackState,
        station: player.activeStation,
        stations: player.stations,
        requestingSkip: false
      });

      this.elapsedTimer = setInterval(() => {
        if ((this.state.playbackState === 'PLAYING') && (this.state.play)) {
          this.setState({
            play: { ...this.state.play, elapsed: player.elapsedTime }
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
          play: { ...play, elapsed: 0 }
        });
      });

      this.skipFailedUnbind = player.on('skip-failed', () => {
        this.setState({
          requestingSkip: false,
          play: { ...this.state.play, canSkip: false }
        });
      })
    });
  }

  componentWillUnmount() {
    if (this.state.available) {
      this.stateChangeUnbind();
      this.stationChangeUnbind();
      this.playStartedUnbind();
      this.skipFailedUnbind();
      clearInterval(this.elapsedTimer);
    }
  }

  skip() {
    // note that we're trying to skip
    this.setState({ requestingSkip: true });
    // ask the player to skip the current song
    audioPlayerService.player.skip();
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
          <Button onPress={() => {
            audioPlayerService.player.play();
          }} title={'click to play ' + this.state.station.name}/>
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
          <Text style={styles.text}>{this.state.play.title}</Text>
          <Text style={styles.text}>by {this.state.play.artist}</Text>
          <Text style={styles.text}>on {this.state.play.album}</Text>
          <Text style={styles.text}>{this.state.play.elapsed} of {this.state.play.duration} seconds elapsed</Text>
          <Button onPress={() => {
            audioPlayerService.player.pause();
          }} title="pause"/>
          {
            this.state.requestingSkip ? 
              (<Text style={styles.text}>(trying to skip)</Text>) :
              (<Button onPress={() => { this.skip(); }} title="skip"/>)
          }
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
          }} title="play"/>
          {
            !this.state.play.canSkip ? (<Text style={styles.text}>(you're temporarily out of skips)</Text>) :
            this.state.requestingSkip ? (<Text style={styles.text}>(trying to skip)</Text>) :
                                        (<Button onPress={() => { this.skip(); }} title="skip"/>)
          }
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
    textAlign: 'center',
    margin: 10,
  }
});
