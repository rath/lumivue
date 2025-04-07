#!/bin/sh
rsvg-convert -h 128 icon.svg > icon128.png
rsvg-convert -h 48  icon.svg > icon48.png
rsvg-convert -h 32  icon.svg > icon32.png
rsvg-convert -h 16  icon.svg > icon16.png
