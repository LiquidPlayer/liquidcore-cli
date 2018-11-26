/*
 * Copyright © 2018 LiquidPlayer
 *
 * Released under the MIT license.  See LICENSE.md for terms.
 */
'use strict';

(() => {
  const path = require('path');
  const local_path = path.resolve('.') + '/node_modules/';
  require(local_path + 'react-native/setupBabel')();

  const Metro = require('metro');
  let config = require(local_path + 'react-native/local-cli/core');
  const runServer = require(local_path + 'react-native/local-cli/server/runServer');

  const server = (override) => {
    var args = {
      assetExts: [],
      host: "",
      platforms: config.getPlatforms(),
      port: 8082,
      projectRoots: config.getProjectRoots(),
      resetCache: false,
      sourceExts: config.getSourceExts(),
      verbose: false,
    };

    Object.assign(args, override);

    const startedCallback = logReporter => {
      logReporter.update({
        type: 'initialize_started',
        port: args.port,
        projectRoots: args.projectRoots,
      });
    };

    const readyCallback = logReporter => {
      logReporter.update({
        type: 'initialize_done',
      });
    };

    config.getModulesRunBeforeMainModule = () => [];

    runServer(args, config, startedCallback, readyCallback);
  };

  module.exports = server;
})();