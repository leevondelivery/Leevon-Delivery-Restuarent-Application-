const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude gradle/kotlin build directories and native directories from Metro watcher/resolver
config.resolver.blockList = [
  /node_modules\/.*\/build\/.*/,
  /android\/.*/,
  /ios\/.*/
];

module.exports = config;
