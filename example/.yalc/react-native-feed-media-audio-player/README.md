
# react-native-feed-media-audio-player

This library will expose the iOS and Android Feed.fm SDKs for use in React
Native projects for music playback. 

## How to use

From your React Native v0.60 or above project, run:

```
npm install react-native-feed-media-audio-player
cd ios
pod install
```

done!


## Sample

Check out [ExampleUI.js](ExampleUI.js) in this package for a minimal native
React component that plays music using this library and displays play/pause/skip/volume
controls along with the current song.

## Usage


At the start of your app, call initialize to create the
singleton player instance and have it contact feed.fm and
wait for a list of available music stations:

```javascript
import audioPlayerService from 'react-native-feed-media-audio-player';

audioPlayerService.initialize({ token: 'demo', secret: 'demo', debug: true });
```

The audioPlayerService exposes the singleton player via `audioPlayerService.player`.

The `player` instance has a number of simple playback methods to
control playback: `play()`, `pause()`, `skip()`, `stop()`. 

The player holds a `playbackState` that indicates what it is doing.
That state is one of:

- `UNINITIALIZED`
  the player is still trying to contact feed.fm
- `UNAVAILABLE`
  the player has no connectivity or feed.fm determined the client
  isn't allowed to play music at this time
- `WAITING_FOR_ITEM`
  the player is waiting for the next song to play from feed.fm
- `READY_TO_PLAY`
  the player is idle and ready to play music
- `PLAYING`
  the player is actively playing a song
- `PAUSED`
  the player has paused playback of the current song
- `STALLED`
  the player is waiting for more audio data to arrive over the network

The player holds a `stations` property that is a list of stations that
it can pull music from. If the player is playing a song, details
of the current song are available via the `currentPlay`.

The player's `activeStation` property can be assigned one of the
stations from `stations`.

The player emits events to announce changes in its state. Clients
can subscribe to events via `player.on(event, callback)`, which
returns a function to unsubscribe from the event. The events
(and the objects passed with them to subscribers) are:

- `play-started` (play)
  A new song has started playback
- `state-change` (playbackState)
  The player's state has changed
- `station-change` (station)
  The current station has changed
- `skip-failed` 
  The last skip request has failed

The player is of no use until it successfully contacts feed.fm
and receives a list of stations that the client can play music
from. We say that the player is determining if music is `available`.
To simplify checking whether the player has finished contacting
feed.fm and determined if music is available, the `player.whenAvailable(callback)`
method can be used. That method calls the provided function as soon
as the player knows whether music is available or not:

```
player.whenAvailable((available) => {
  if (!available) {
    // no music is available for this client
    return;

  } else {
    // music is available! listen to events..
    player.on('xxx', () => { });

    // pick a station from player.stations:
    player.activeStation = player.stations[indexOfSomeStation];

    // start playback!
    player.play();

  }
});
```

When the player is not available, there is no music
that the user can listen to (due to either lack of Internet connectivity
or the user is in a location where playback is not licensed). The
player's playback state will be `UNAVAILABLE`.
In that situation, you should not render any music playback
controls, as the player is effectively useless.

Otherwise, when the player is available, it will hold an `activeStation`
and a list of available `stations`, and will respond to playback
methods.

```


