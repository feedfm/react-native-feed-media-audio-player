
# react-native-audio-player

## Getting started

`$ npm install react-native-audio-player --save`

### Mostly automatic installation

`$ react-native link react-native-audio-player`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-audio-player` and add `RNFMAudioPlayer.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNFMAudioPlayer.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import fm.feed.android.react.RNFMAudioPlayerPackage;` to the imports at the top of the file
  - Add `new RNFMAudioPlayerPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-audio-player'
  	project(':react-native-audio-player').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-audio-player/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-audio-player')
  	```


## Usage
```javascript
import RNFMAudioPlayer from 'react-native-audio-player';

// TODO: What to do with the module?
RNFMAudioPlayer;
```
  