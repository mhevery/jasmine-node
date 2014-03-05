#!/usr/bin/env bash

entry="node lib/jasmine-node/cli.js --noStack "

echo "Running all tests located in the spec directory"
command=$entry"spec"
echo $command
time $command #/nested/uber-nested
echo -e "\033[1;35m--- Should have 32 tests, 1 Failure and 2 Skipped. ---\033[0m"
echo ""

echo "Running all tests located in the spec directory with coffee option"
command=$entry"--coffee spec"
echo $command
time $command #/nested/uber-nested
echo -e "\033[1;35m--- Should have 35 tests, 1 Failure and 2 Skipped. ---\033[0m"
echo ""

echo "Running two specs file in the spec directory with coffee option"
command=$entry"--coffee spec/CoffeeSpec.coffee spec/SampleSpec.js"
echo $command
time $command
echo -e "\033[1;35m--- Should have 4 tests, 0 Failures, and 0 Skipped. ---\033[0m"
