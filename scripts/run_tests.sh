#!/usr/bin/env bash
export LEV_TESTS_DIR=$(mktemp -d /tmp/lev-tests-XXXX)
echo "Creating test LevelDB $LEV_TESTS_DIR"
./bin/lev.js "$LEV_TESTS_DIR" --create --put __placeholder --value ""
echo "Test LevelDB created"
mocha $MOCHA_OPTIONS ./tests
