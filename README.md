Dynamic Top Bar
===============

Dynamic Top Bar is a Gnome Shell extension
that make the top bar transparent when no
window is maximized.

Demo
====
![GIF Demo](https://feildel.fr/gnome-shell/dynamic-status-bar.gif)

How-To Install
==============

Download
--------
You can download this extension with various methods:

- from [Gnome website](https://extensions.gnome.org/extension/885/dynamic-top-bar/)
- Using the latest release posted on GitHub https://github.com/AMDG2/GnomeShell_DynamicTopBar/releases
- By cloning the repo

Install
-------
Just past the `dynamicTopBar@gnomeshell.feildel.fr`
folder to `~/.local/share/gnome-shell/extensions`
then activate the extensions with Gnome Tweak Tool
for example.

```bash
cp -r dynamicTopBar@gnomeshell.feildel.fr ~/.local/share/gnome-shell/extensions
gnome-shell-extension-tool -e dynamicTopBar@gnomeshell.feildel.fr
```

Or you can use the `install.sh` script.

Theme compatibility
===================

Not all theme are compatible with this extension.

- If you are a theme developper please read the following paragraph.
- If you are a theme user and the extension seems broken please report the issue in this repository and to the theme developper

Theme developper information
----------------------------

If your theme use images to style the panel look it won't be compatible with the extension without work.

The extension only style the `background-color` property of the panel. But your theme may use the following classes to detect when the panel should be transparent or gradient :

- `dynamic-top-bar-transparency`
- `dynamic-top-bar-gradient`
