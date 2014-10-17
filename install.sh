#!/bin/bash

if [ ! `command -v gnome-shell-extension-tool` ]; then
    echo "gnome-shell-extension-tool not found!"
    exit 1
fi

echo "Copying extension files..."
cp -r dynamicTopBar@gnomeshell.feildel.fr ~/.local/share/gnome-shell/extensions
echo "Enabling extension..."
gnome-shell-extension-tool -e dynamicTopBar@gnomeshell.feildel.fr
