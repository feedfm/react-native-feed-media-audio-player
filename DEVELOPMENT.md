
# Setup

Check out this repo. Then run:

```
cd package 
npm install @babel/runtime nanoevents 
cd ..

cd example
npm install
cd ios
pod install
```

Start up the web server with:

```
npm run start
```

## iOS

To work on the iOS portion, open up the example app in XCode:

```
open example/ios/example.xcworkspace
```

You can edit the `react-native-feed-media-audio-player` pod
code directly, then hit run to compile the package and the
example app and run it on the emulator.


## Android

To work on the Android portion...

```
npx react-native run-android
```


