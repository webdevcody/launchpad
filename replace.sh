#!/bin/bash

# Replace "file:../shuttle" with "*" in the specified file
if [[ $(uname) == "Darwin" ]]; then
    sed -i "" 's/file:..\/shuttle/*/g' $1
else
    sed -i 's/file:..\/shuttle/*/g' $1
fi