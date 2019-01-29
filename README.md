# liquidcore-cli

Command-line utilities for [LiquidCore](https://github.com/LiquidPlayer/LiquidCore).

## Installation
    npm install -g liquidcore-cli

## Usage

To create a new LiquidCore project:

    liquidcore init myProject
    
If `myProject` does not exist, this will create the directory and fill it with a simple
Hello World service.  If `myProject` already exists as a directory, the project directory
will be modified for use with LiquidCore.

Once the project is created/updated, run:

    cd myProject && npm install
    
to complete installation.

From here, you can run a dev server by:

    npm run server

Which will open a metro server at `http://localhost:8082`.  You can add the `--help` option to any
command to get detailed information on options (e.g. `npm run server -- --help`).

## License

Copyright 2018-2019 LiquidPlayer

This project is distributed under the MIT license.  See LICENSE.md for terms.
