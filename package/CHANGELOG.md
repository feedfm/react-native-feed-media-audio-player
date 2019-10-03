
- v2.3.6 - background music
  - offer 'enableBackgroundMusic:boolean' as initialization option
  - update to iOS library v4.3.2
  - update to Android library v5.2.9

- v2.3.5 - update iOS library
  - changes to support iOS 13 and prevent crash

- v2.3.4 - add debugging option
  - new 'debug' option to assist with debugging integration

- v2.3.3 - update React Native dependency
  - update to react-native@^0.59.8

- v2.3.2 - bugfixes
  - update to Android SDK v5.2.8 to handle play -> pause transition before notification is created on Android
  - update to iOS v4.2.8 to get play/pause toggling bugfix

- v2.3.1 - client id export/import
  - new methods: requestClientID(), createNewClientID(), and setClientID()

- v2.2.3 - station change bugfix
  - update to Android library 5.2.4 and fix bad type comparison when changing 
    station

- v2.2.2 - iOS native lib update
  - update to native iOS SDK 4.2.2

- v2.2.1 - docs and timing!
  - fix an android event ordering that didn't match iOS side of things
  - update sample app
  - update README to reference using this project on Android

- v2.2.0 - Android support!
  - now includes our native Android SDK (version 5.2.0), which targets API 28

- v2.1.2 - *critical bugfix*
  - update to FeedMedia iOS SDK 4.2.1 to fix SDK not saving client id
  - fix 'skip failed' event not firing - thanks [@tnaughts](https://github.com/tnaughts)

