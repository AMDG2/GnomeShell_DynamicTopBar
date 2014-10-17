#!/bin/bash

echo "Copy the extension files..."
cp -r dynamicTopBar@gnomeshell.feildel.fr
echo "Enable the extension"
gnome-shell-extension-tool -e dynamicTopBar@gnomeshell.feildel.fr

