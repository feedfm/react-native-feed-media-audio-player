
# react-native-audio-player

This is the repository for our React Native bridge that allows
a React Native app to control our native audio players via
Javascript.

This repo contains our bridge plus an example app that we use
for development. The bridge code that is published to NPM
exists [in the `package` directory](https://github.com/feedfm/react-native-feed-media-audio-player/tree/master/package).

# Setup

Here is how we structure things:

- `example` contains a basic react native app, created from `react-native create`
- our library is in `package`
- run `cd example && npm install` to get all the dependencies installed in the
  example app
- `example` has already been linked to our package with `react-native link <blah>`,
  however, we _do not have our library in `package.json`_, so that `npm install`
  didn't add our library to the project. This is a good thing, because if
  `package.json` had some reference to the library in this repo, like
  `"react-native-feed-media-audio-player": "file:../package"`
  it would cause horrible symbolic link issues with the 'haste map',
  whatever that is.
- run `cp -r package example/node_modules/react-native-feed-media-audio-player`
  so that the app has access to our library.
- make all your changes in the `package` directory, and then run that cp
  command to push them to the example app.
- check in your changes to the `package` directory.

** important **

The repo does not check in the `examples/node_modules` dir! This is by design!

# Development notes

Once the app is running, hit command-D to show the debug menu. That lets
you control reloading. I suggest you turn on 'Live Reload' and also
click on 'Start Remote JS Debugging' so you can see console messages in
a browser.

## iOS

1. Start the javascript webserver (`cd example && npm start`)
2. Open the `example/ios/example.xcodeproj` in XCode
3. You can start/run the app directly from XCode
4. When dealing with javascript changes, you just need to reload the
  pages in the simulator. For native changes, stop and restart
  the app.

## Android

1. Start the javascript webserver (`cd example && npm start`)
2. open `example/android` in Android Studio. Don't let it update Gradle,
  dammit! Our native code is in the `react-native-feed-media-audio-player` module,
  which points to `example/node_modules/react-native-feed-media-audio-player/android`.
3. to build and launch the app, run 'react-native run-android' from the `example` dir.
4. you can get the javascript console log by also running 'react-native log-android' from `example` dir.



