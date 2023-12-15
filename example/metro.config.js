const path = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);
const { resolver: { sourceExts, assetExts } } = defaultConfig;

const extraNodeModules = {
  'react-native-feed-media-audio-player': path.resolve(__dirname + '/../package/'),
};
/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
 
  resolver: {
    extraNodeModules: new Proxy(extraNodeModules, {
          get: (target, name) =>
            //redirects dependencies referenced from react-native-feed-media-audio-player/ to local node_modules
            name in target ? target[name] : path.join(process.cwd(), `node_modules/${name}`),
        }),

    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, 'jsx', 'js', 'ts', 'tsx', 'cjs', 'json', "svg"],
    resolverMainFields: ["sbmodern", "react-native", "browser", "main"],
    },
  watchFolders: [path.resolve(__dirname + '/../package/')],
};

module.exports = mergeConfig(defaultConfig, config);


