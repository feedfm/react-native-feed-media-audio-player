
The javascript bundler doesn't handle symbolic links in the node_modules
directory properly, so our plugin, 'react-native-feed-media-audio-player',
is in `example/node_modules/react-native-feed-media-audio-player/` and
the top level 'package' directory is just a symbolic link to that dir.

To develop things for iOS:

1. open the iOS app in XCode: `example/ios/example.xcodeproj`. Our native
  code is listed under `Libraries -> FNFMAudioPlayer.xcodeproj`.
2. from the `example` dir, start up the metro bundler package with `npm start`
3. open the javascript code in the `package` dir in whatever editor you want

You build and start the app via XCode. That should build the native parts
and start them on the simulator. The simulator will ping the metro bundler
and load up the controlling javascript.

Once the app is running, hit command-D to show the debug menu. That lets
you control reloading. I suggest you turn on 'Live Reload' and also
click on 'Start Remote JS Debugging' so you can see console messages in
a browser.

To develop things for Android:

1. open `example/android` in Android Studio. Don't let it update Gradle, dammit! Our native code is in the 
`react-native-feed-media-audio-player` project.
2. to build and launch the app, run 'react-native run-android' from the `example` dir.
3. you can get the javascript console log by also running 'react-native log-android' from `example` dir.



