#!/usr/bin/env bash

entry="node bin/jasmine-node --noStackTrace "

echo "Running all tests located in the spec directory"
command=$entry"spec"
echo $command
time $command #/nested/uber-nested
echo ""

echo "Running all tests located in the spec directory with coffee option"
command=$entry"--coffee spec"
echo $command
time $command #/nested/uber-nested
echo ""

echo "Running two specs file in the spec directory with coffee option"
command=$entry"--coffee spec/CoffeeSpec.coffee spec/SampleSpec.js"
echo $command
time $command
