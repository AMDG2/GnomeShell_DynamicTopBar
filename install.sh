#!/bin/bash

echo "Copying extension files..."
cp -r dynamicTopBar@gnomeshell.feildel.fr ~/.local/share/gnome-shell/extensions
echo "Enabling extension..."
gnome-shell-extension-tool -e dynamicTopBar@gnomeshell.feildel.fr
