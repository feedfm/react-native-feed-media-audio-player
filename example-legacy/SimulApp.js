/**
 * Sample React App that uses React Native Feed Media Audio Player
 */

import React, { Component } from 'react'; // eslint-disable-line no-unused-vars
import { Platform, StyleSheet, Text, View, Button } from 'react-native'; // eslint-disable-line no-unused-vars
import { useSimulcastStreamer } from 'react-native-feed-media-audio-player';


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

console.log('hello');

const STREAMA = '8CRqKJ3AXxbMTF1ST3kynP';
const STREAMB = 'sL1G9Q6eb8r3mGqiAMPRGK';

export default () => {
  const [streamerState, streamer] = useSimulcastStreamer();

  let nowPlaying = null;

  if (streamerState.currentPlay) {
    nowPlaying = <Text style={styles.text}>{streamerState.currentPlay.title} by {streamerState.currentPlay.artist} on {streamerState.currentPlay.album}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Current state: {streamerState.state}</Text>
      {nowPlaying}
      <Button
        onPress={() => {
          streamer.connect();
        }}
        title="connect"
      />
      <Button
        onPress={() => {
          streamer.disconnect(true);
        }}
        title="disconnect"
      />
      <Button
        onPress={() => {
          streamer.setVolume(0);
        }}
        title="vol 0"
      />
      <Button
        onPress={() => {
          streamer.setVolume(0.5);
        }}
        title="vol 0.5"
      />
      <Button
        onPress={() => {
          streamer.setVolume(1.0);
        }}
        title="vol 1"
      />
      <Button
        onPress={() => {
          streamer.connect(STREAMA);
        }}
        title="connect(a)"
      />
      <Button
        onPress={() => {
          streamer.connect(STREAMB);
        }}
        title="connect(b)"
      />
      <Button
        onPress={() => {
          streamer.switchStream(STREAMA);
        }}
        title="switchStream(a)"
      />
      <Button
        onPress={() => {
          streamer.switchStream(STREAMB);
        }}
        title="switchStream(b)"
      />
    </View>
  );
};
