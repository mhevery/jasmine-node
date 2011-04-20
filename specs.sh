#!/bin/sh

export NODE_PATH="`pwd`/lib:$NODE_PATH"
node lib/jasmine-node/cli.js --coffee "$@"
#/usr/bin/env node specs.js $@
