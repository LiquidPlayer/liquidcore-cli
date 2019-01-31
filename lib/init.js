/*
 * Copyright © 2018 LiquidPlayer
 *
 * Released under the MIT license.  See LICENSE.md for terms.
 */

 /* Usage:
 *
 * liquidcore init <project-dir>
 *
 */
'use strict';

const fs = require('fs')
const path = require('path')
const package_json = require('../package.json')

;(() => {
    const pkg = {
        scripts: {
            server: "node node_modules/liquidcore-cli/lib/cli.js server",
            bundler: "node node_modules/liquidcore-cli/lib/cli.js bundle"
        },
        dependencies: {
            "react-native": "0.56.0",
            "liquidcore-cli": "^" + package_json.version,
            "babel-preset-env": "^1.7.0",
            "babel-polyfill": "^6.26.0"
        }
    };

    const babelrc = {
        presets: [
            ["env", {
                "targets": {
                    node: "8.9"
                }
            }]
        ],
        plugins: [
            "@babel/plugin-proposal-object-rest-spread"
        ]
    };

    const deepMerge = (...sources) => {
        let acc = {};
        for (const source of sources) {
            if (source instanceof Array) {
                if (!(acc instanceof Array)) {
                    acc = [];
                }
                acc = [...acc, ...source];
            } else if (source instanceof Object) {
                for (let [key, value] of Object.entries(source)) {
                    if (value instanceof Object && key in acc) {
                        value = deepMerge(acc[key], value);
                    }
                    acc = { ...acc, [key]: value };
                }
            }
        }
        return acc;
    };

    const merge = (config) => {
        return new Promise((resolve,reject) => {
            const write_package_json = (data) => {
                fs.writeFile(config.dir + '/package.json', JSON.stringify(data,null,2), (err) => {
                    if (err) return reject(err);
                    console.log('package.json was updated.');
                    resolve(config);
                });
            };

            let blank_pkg = {
                name: path.basename(config.dir),
                version: "0.0.1",
                private: true,
                scripts: {
                    "start": "node node_modules/liquidcore-cli/lib/cli.js"
                }
            };

            fs.readFile(config.dir + '/package.json', (err,old)=>{
                var data = err ? blank_pkg : JSON.parse(old);
                data = deepMerge(data, pkg);

                if (!err) {
                    fs.writeFile(config.dir + '/package.json.bak', old, (error)=>{
                        if (error) return reject(error);
                        console.log('Original package.json written to package.json.bak.');
                        write_package_json(data);
                    });
                } else {
                    write_package_json(data);
                }
            });
        });
    };

    const mergeBabel = (config) => {
        return new Promise((resolve,reject) => {
            const write_babelrc = (data) => {
                fs.writeFile(config.dir + '/.babelrc', JSON.stringify(data,null,2), (err) => {
                    if (err) return reject(err);
                    console.log('.babelrc was updated.');
                    resolve(config);
                });
            };

            let blank_babelrc = {
            };

            fs.readFile(config.dir + '/.babelrc', (err,old)=>{
                var data = err ? blank_babelrc : JSON.parse(old);
                data = deepMerge(data, babelrc);

                if (!err) {
                    fs.writeFile(config.dir + '/.babelrc.bak', old, (error)=>{
                        if (error) return reject(error);
                        console.log('Original .babelrc written to .babelrc.bak.');
                        write_babelrc(data);
                    });
                } else {
                    write_babelrc(data);
                }
            });
        });
    };

    const new_project = (config) => {
        return new Promise((resolve,reject) => {
            fs.mkdir(config.dir, (err) => {
                if (err) return reject(err);
                fs.readFile(__dirname + '/templates/helloworld.js', (err,data) => {
                    if (err) return reject(err);
                    fs.writeFile(config.dir + '/index.js', data, (err) => {
                        if (err) return reject(err);
                        console.log('Created project ' + path.basename(config.dir) + ' at ' + path.dirname(config.dir));
                        console.log('Wrote Hello World service at index.js');
                        resolve(config);
                    });
                });
            });
        });
    };

    const create_liquid_js = (config) => {
        return new Promise((resolve,reject) => {
            let file = '/templates/liquid.js';
            fs.readFile(__dirname + file, (err,data) => {
                fs.writeFile(config.dir + '/liquid.js', data, (err) => {
                    if (err) return reject(err);
                    console.log('Created init file liquid.js.');
                    resolve(config);
                });
            });
        });
    };

    const success = (config) => {
        console.log('');
        console.log('============');
        console.log('SUCCESS');
        console.log('To complete initialization:');
        if (path.resolve(config.dir) == path.resolve('.')) {
            console.log('    npm install');
        } else {
            console.log('    cd ' + config.dir + ' && npm install');
        }
        console.log('And then to run the server:');
        console.log('    npm run server');
        console.log('Or to generate a production bundle:');
        console.log('    npm run bundler -- --platform=[android|ios] --dev=false --minify');
        console.log('============');
        return Promise.resolve(config);
    };

    const init = (override) => {
        var args = {};
        Object.assign(args, override);

        if (args.help) {
            console.log('Usage:');
            console.log('  liquidcore init <project-dir>');
            console.log('');
            console.log('Where:');
            console.log('  <project-dir>  path to either a new (uncreated) or existing project directory.');
            process.exit(0);
        }

        if (!args._ || args._.length < 1) {
            console.error('Must include <project-dir>.  Ex. liquidcore init ./myProject');
            process.exit(-2);
        }

        let config = {
            dir: args._[0]
        };

        fs.stat(config.dir,(err,stats) => {
            if (!err && !stats.isDirectory()) {
                console.error('<project-dir> must be a directory.');
                process.exit(-3);
            }
            let promise = (err) ? new_project(config) : Promise.resolve(config);
            promise
                .then(merge)
                .then(mergeBabel)
                .then(create_liquid_js)
                .then(success)
                .catch((err) => {
                    console.error(err);
                    process.exit(-4);
                });
        });
    };

    module.exports = init;
})();