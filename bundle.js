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

    let config = require(local_path + 'react-native/local-cli/core');
    const buildBundle = require(local_path + 'react-native/local-cli/bundle/buildBundle');
    const outputBundle = require('metro/src/shared/output/bundle');

    const bundler = (override) => {
        var args = {
                'entryFile' : './liquid.js',      // Path to the root JS file, either absolute or relative to JS root
                'platform' : 'ios',               // Either "ios" or "android"
                'transformer' : undefined,        // Specify a custom transformer to be used
                'dev' : true,                     // If false, warnings are disabled and the bundle is minified
                'minify': false,                  // Allows overriding whether bundle is minified.
                'bundleOutput': undefined,        // File name where to store the resulting bundle, ex. /tmp/groups.bundle
                'bundleEncoding': 'utf8',         // Encoding the bundle should be written in (https://nodejs.org/api/buffer.html#buffer_buffer).
                'maxWorkers': undefined,          // maximum number of workers
                'sourcemapOutput': undefined,     // File name where to store the sourcemap file for resulting bundle, ex. /tmp/groups.map
                'sourcemapSourcesRoot': undefined,// Path to make sourcemap's sources entries relative to, ex. /root/dir
                'sourcemapUseAbsolutePath': false,// Report SourceMapURL using its full path
                'assetsDest': undefined,          // Directory name where to store assets referenced in the bundle
                'verbose': false,                 // Enables logging
                'resetCache': false,              // Removes cached files
                'readGlobalCache': false          // Try to fetch transformed JS code from the global cache, if configured.
        };

        Object.assign(args, override);

        const space = (text, spaces) => {
            spaces = Math.max(0, spaces - text.length);
            for (var i=0; i<spaces; i++) text += ' ';
            return text;
        };

        if (args.help) {
            console.log('Usage: ');
            console.log('\tnpm run bundler -- [options]');
            console.log('');
            console.log('Where [options] are zero or more of: ');

            const help = require(local_path + 'react-native/local-cli/bundle/bundleCommandLineArgs');
            for (var i=0; i<help.length; i++) {
                console.log('\t' + space(help[i].command,40) + (help[i].description===undefined ? '' : help[i].description));
            }
            process.exit(0);
        }

        let output = (args._ && args.length > 0) ? args._[0] : args.entryFile.split('.').slice(0, -1).join('.') + '.bundle';
        args.bundleOutput = args.bundleOutput || output;

        config.getModulesRunBeforeMainModule = () => [];

        return buildBundle(args, config, outputBundle);
    };

    module.exports = bundler;
})();