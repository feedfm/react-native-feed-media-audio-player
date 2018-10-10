/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Button } from 'react-native';
import AudioPlayerService from 'react-native-feed-media-audio-player';

console.warn('restart!');

AudioPlayerService.initialize({ token: 'demo', secret: 'demo' });

/*
AudioPlayerService.getAvailablePlayer().then((res) => {
  console.warn('available player returned ', !!res);
  //res.play();
});
*/

export default class App extends Component {

  constructor(props) {
    super(props);
   
    this.state = {
      available: null,
    };
  }

  componentDidMount() {
    AudioPlayerService.getAvailablePlayer((player) => {
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

      this.stateChangeUnbind = player.on('state-change', (state) => {
        console.log('state change to', state);
        this.setState({ playbackState: state });
      });
  
      this.stationChangeUnbind = player.on('station-change', (station) => {
        console.log('station change to', station);
        this.setState({ station: station });
      });
  
      this.playStartedUnbind = player.on('play-started', (play) => {
        console.log('play started', play);
        this.setState({ 
          requestingSkip: false,
          play: play 
        });
      });

      this.skipFailedUnbind = player.on('skip-failed', () => {
        console.log('skip failed!');
        this.setState({
          requestingSkip: false
        });
      })
    });
  }

  componentWillUnmount() {
    this.stateChangeUnbind();
    this.stationChangeUnbind();
    this.playStartedUnbind();
  }

  skip() {
    this.setState({ requestingSkip: true });
    AudioPlayerService.player.skip();
  }

  render() {
    // player still intializing
    if (this.state.available === null) {
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>initializing...</Text>
        </View>
      );
      }

    // no music availale for this person
    if (this.state.available === false) {
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>sorry, no music is available for you</Text>
        </View>
      );
    }

    // music is available!
    switch (this.state.playbackState) {
      case 'READY_TO_PLAY': 
      return (
        <View style={styles.container}>
          <Button onPress={() => {
            AudioPlayerService.player.play();
          }} title={'click to play ' + this.state.station.name}/>
        </View>
      );

      case 'WAITING_FOR_ITEM':
      case 'STALLED':
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>waiting for music..</Text>
        </View>
      );

      case 'PLAYING':
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>{this.state.play.title}</Text>
          <Text style={styles.welcome}>by {this.state.play.artist}</Text>
          <Text style={styles.welcome}>on {this.state.play.album}</Text>
          <Text style={styles.welcome}>X of Y seconds elapsed</Text>
          <Button onPress={() => {
            AudioPlayerService.player.pause();
          }} title="pause"/>
          {
            this.state.requestingSkip ? 
             (<Text style={styles.welcome}>(trying to skip)</Text>) :
             (<Button onPress={() => { this.skip(); }} title="skip"/>)
          }
        </View>
      );

      case 'PAUSED':
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>{this.state.play.title}</Text>
          <Text style={styles.welcome}>by {this.state.play.artist}</Text>
          <Text style={styles.welcome}>on {this.state.play.album}</Text>
          <Text style={styles.welcome}>X of Y seconds elapsed</Text>
          <Button onPress={() => {
            AudioPlayerService.player.play();
          }} title="play"/>
          {
            this.state.requestingSkip ? 
             (<Text style={styles.welcome}>(trying to skip)</Text>) :
             (<Button onPress={() => { this.skip(); }} title="skip"/>)
          }
        </View>
      );
      }
      /*
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>{this.state.count}</Text>
        <Button onPress={() => {
          AudioPlayerService.player.play();
        }} title="play"/>
        <Button onPress={() => {
          AudioPlayerService.player.pause();
        }} title="pause"/>
        <Button onPress={() => {
          AudioPlayerService.player.skip();
        }} title="skip"/>
        <Button onPress={() => {
          AudioPlayerService.player.stop();
        }} title="stop"/>
        <Button onPress={() => {
          // advance to next station
          let player = AudioPlayerService.player;
          let index = player.stations.indexOf(player.activeStation);
          if (index > -1) {
            index = (index + 1) % player.stations.length;
            player.activeStation = player.stations[index];
          }
        }} title="next station"/>
      </View>
    );

  }
      
  */
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
