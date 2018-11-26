/*
 * Copyright © 2018 LiquidPlayer
 *
 * Released under the MIT license.  See LICENSE.md for terms.
 */
'use strict';

const minimist = require('minimist');

const modules = [
    'server',
    'bundle',
    'init'
];

var args = minimist(process.argv.slice(2), {'--': true});
if (!args._ || args._.length == 0) {
    args._ = [modules[0]];
}

let command = args._[0];
args._.shift();
if (!modules.includes(command)) {
    console.error('' + command + ' is not a recognized command.');
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