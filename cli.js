const minimist = require('minimist');

const modules = [
    'server',
    'bundle',
    'init'
];

var args = minimist(process.argv.slice(2), {'--': true});
if (args._ && args._.length > 1) {
    console.error('Specify only one of ' + modules.join(', ') + '.');
    process.exit(-1);
}
if (!args._ || args._.length == 0) {
    args._ = [modules[0]];
}
let command = args._[0];
if (!modules.includes(command)) {
    console.error('' + command + ' is not a recognized command.');
    process.exit(-2);
}

delete args._;

const mod = require('./' + command);
mod(args);