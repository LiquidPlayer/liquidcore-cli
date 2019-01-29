#!/usr/bin/env node
/*
 * Copyright © 2018 LiquidPlayer
 *
 * Released under the MIT license.  See LICENSE.md for terms.
 */

global.__called_from_global = true;

if (!process.argv.includes('init') &&
    !process.argv.includes('gradle') &&
    !process.argv.includes('pod')) {
    process.argv.push('--help=true');
}
require('./lib/cli.js');