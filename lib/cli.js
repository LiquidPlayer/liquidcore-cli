/*
 * Copyright © 2018 LiquidPlayer
 *
 * Released under the MIT license.  See LICENSE.md for terms.
 */
'use strict';

const minimist = require('minimist');

const modules = global.__called_from_global ?
[   'init',
    'gradle',
    'pod'
] :
[
    'server',
    'bundle',
    'init',
    'gradle',
    'pod'
];

var args = minimist(process.argv.slice(2), {'--': true});

const usage = () => {
    console.log((() => {
/*
Usage:
  liquidcore [command] <options>

Examples:
  liquidcore init myJSProject
  liquidcore gradle --dev --version='0.6.0'
  liquidcore pod MyiOSProject --liquidcore=~/projects/LiquidCore

Commands:
  init <project-dir>   Initialize a JavaScript project for use with LiquidCore
  gradle               Generate liquidcore.build.gradle and liquidcore.settings.gradle
                       include files for Android project.
  pod <target>         Generates a Podfile for iOS project to stdout.

For more information on each command, specify the --help option, e.g.
liquidcore pod --help
*/
    }).toString().split(/\n/).slice(2, -2).join('\n'))
}

let command = args._[0];
args._.shift();
if (!command || !modules.includes(command)) {
    usage()
    process.exit(-2);
}

for (var arg in args) {
    var newarg = '';
    var capNext = false;
    for (var i=0; i<arg.length; i++) {
        if (arg[i] == '-') {
            capNext = true;
        } else {
            newarg += capNext ? String(arg[i]).toUpperCase() : arg[i];
            capNext = false;
        }
    }
    if (arg != newarg) args[newarg] = args[arg];
}

const mod = require('./' + command);
mod(args);