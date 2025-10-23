#!/usr/bin/env bash

if [ -d .git ]; then
  # Make git hooks trackable (see https://stackoverflow.com/a/4457124/3324977)
  rm -rf .git/hooks
  # Symbolic link is relative to the .git directory, thus the path starting with ".."
  ln -s ../scripts/githooks .git/hooks
fi
