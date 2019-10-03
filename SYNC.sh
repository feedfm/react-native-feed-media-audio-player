#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

/usr/bin/rsync -av --delete ${DIR}/package ${DIR}/example/node_modules/react-native-feed-media-audio-player
