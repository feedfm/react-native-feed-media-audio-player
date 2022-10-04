/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
// import SimulApp from './SimulApp';
// import SimulcastApp from './SimulcastApp';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
// AppRegistry.registerComponent(appName, () => SimulApp);
// AppRegistry.registerComponent(appName, () => SimulcastApp);
