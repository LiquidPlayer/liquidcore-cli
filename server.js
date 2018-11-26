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

    const space = (text, spaces) => {
      spaces = Math.max(0, spaces - text.length);
      for (var i=0; i<spaces; i++) text += ' ';
      return text;
    };

    if (args.help) {
      console.log('Usage: ');
      console.log('\tnpm run server -- [options]');
      console.log('');
      console.log('Where [options] are zero or more of: ');

      const help = require(local_path + 'react-native/local-cli/server/server').options;
      for (var i=0; i<help.length; i++) {
          console.log('\t' + space(help[i].command,40) + (help[i].description===undefined ? '' : help[i].description));
      }
      process.exit(0);
    }

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