const path = require('path');

/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules: {
      'react-native-feed-media-audio-player': path.resolve(__dirname + '/../package/'),
    }
  },
  watchFolders: [
    path.resolve(__dirname + '/../package/')
  ]
};
