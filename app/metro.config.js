// Metro config: Expo's defaults, plus the monorepo's own packages found by
// folder as a fallback (npm links workspaces through node_modules; on Windows
// a differently capitalised install path can make Metro miss the link).
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const local = {
  '@lexbound/core': path.resolve(__dirname, '..', 'packages', 'core'),
  '@lexbound/content': path.resolve(__dirname, '..', 'content'),
};
config.resolver.extraNodeModules = { ...config.resolver.extraNodeModules, ...local };
config.watchFolders = [...new Set([...(config.watchFolders ?? []), ...Object.values(local)])];

module.exports = config;
