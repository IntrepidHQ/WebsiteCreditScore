#!/bin/sh
export PATH="/usr/local/bin:$PATH"
exec /usr/local/bin/node node_modules/next/dist/bin/next dev --webpack
