// Copyright (C) 2014  Baudouin Feildel

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

const Main = imports.ui.main;
const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;


/*
 * Debug tool
 * To debug this extension you can start a gnome-shell instance
 * from a terminal :
 *
 * $ gnome-shell --replace
 *
 * And then use debug() function to display message in the console.
 */
function debug(msg, level) {
    /*if (typeof level == 'string')
        level = ' ' + level + ' **: ';
    else
        level = '';
    log('DynamicTopBar: ' + level + msg);*/
}

/*
 * Panel transparency manager
 */
const PanelTransparencyManager = new Lang.Class({
    Name: 'PanelTransparencyManager',

    /**
     * Constructor
     * @param  {Object} panel The panel to manage
     * @param  {String} style The style to use, could be 'transparency' or 'gradient'
     */
    _init: function(panel, style, transparencyLevel, buttonShadow, showActivity) {
        this._panel        = panel.actor;
        this._leftCorner   = panel._leftCorner.actor;
        this._rightCorner  = panel._rightCorner.actor;
        this._style        = style || 'Transparency';
        this._activityBtn  = panel._leftBox.get_children()[0];
        this._showActivity = showActivity;
        this._isTransp     = true;
        this._btnShadow    = buttonShadow;

        this._color = {
            'r': 0,
            'g': 0,
            'b': 0,
            'a': transparencyLevel
        };
    },

    /**
     * Change the transparency style of the panel
     * @param  {String} newStyle The new style to use, could be 'transparency' or 'gradient'
     */
    updateStyle: function(newStyle) {
        let retransp = false;
        if (this._isTransp) {
            this.setSolid();
            retransp = true;
        }

        if (newStyle == 'Transparency' || newStyle == 'Gradient')
            this._style = newStyle;

        if (retransp) this.setTransparent();
    },

    updateTransparencyLevel: function(newLevel) {
        let retransp = false;
        if(this._isTransp) {
            this.setSolid();
            retransp = true;
        }

        if(newLevel >= 0 && newLevel <= 1)
            this._color.a = newLevel;

        if(retransp) this.setTransparent();
    },

    updateButtonShadow: function(newBool) {
        let retransp = false;
        if(this._isTransp) {
            this.setSolid();
            retransp = true;
        }

        this._btnShadow = newBool;

        if(retransp) this.setTransparent();
    },

    updateShowActivity: function(newBool) {
        this._showActivity = newBool;
        this._updateActivityBtnState();
    },

    /**
     * Set the panel transparent
     */
    setTransparent: function() {
        // Add transparency
        debug('Style used : ' + this._style, 'Notice');
        this._isTransp = true;
        this._applyStyle();
    },

    /**
     * The the panel solid
     */
    setSolid: function() {
        // Restore opacity
        debug('Style used : solid', 'Notice');
        this._isTransp = false;
        this._resetStyle();
    },

    /**
     * Force activity button text state
     */
    _showActivityBtn: function() {
        this._panel.remove_style_class_name('dynamic-top-bar-hide-activity-btn');
    },

    _hideActivityBtn: function() {
        this._panel.add_style_class_name('dynamic-top-bar-hide-activity-btn');
    },

    _updateActivityBtnState: function() {
        if(this._showActivity) this._showActivityBtn();
        else                   this._hideActivityBtn();
    },

    _setStyle: function(styles) {
        for (var i = 0; i < styles.length; i++) {
            if (typeof styles[i][0].set_style == 'function') {
                if (typeof styles[i][1] == 'string')
                    styles[i][0].set_style(styles[i][1]);
                else
                    styles[i][0].set_style('');
            } else
                debug('styles[' + i + '][0].set_style is not a function, it is : ' + typeof styles[i][0].set_style, 'Warning');
        }
    },

    _resetStyle: function() {
        this._panel.set_style('');
        this._leftCorner.set_style('');
        this._rightCorner.set_style('');

        this._panel.remove_style_class_name('dynamic-top-bar-white-btn');
        this._panel.remove_style_class_name('dynamic-top-bar-btn-shadow');
        this._panel.remove_style_class_name('dynamic-top-bar-gradient');
        this._panel.remove_style_class_name('dynamic-top-bar-transparent');
    },

    _applyStyle: function() {
        let style = '';
        let corner_style = '';
        switch (this._style) {
            case 'Gradient':
                style = 'background-color: transparent;';
                style += 'background-gradient-start: rgba(0,0,0,0.8);';
                style += 'background-gradient-end: rgba(0,0,0,0);';
                style += 'background-gradient-direction: vertical;';
                style += 'border-color: rgba('+this._color.r+','+this._color.g+','+this._color.b+','+this._color.a+');';

                corner_style = '-panel-corner-background-color: transparent;';
                this._panel.add_style_class_name('dynamic-top-bar-gradient');
            break;

            case 'Transparency':
            default:
                style = 'background-color: rgba('+this._color.r+','+this._color.g+','+this._color.b+','+this._color.a+');';
                style += 'border-color: rgba('+this._color.r+','+this._color.g+','+this._color.b+','+this._color.a+');';

                corner_style = '-panel-corner-background-color: rgba('+this._color.r+','+this._color.g+','+this._color.b+','+this._color.a+');';
                this._panel.add_style_class_name('dynamic-top-bar-transparent');
            break;
        }

        this._panel.add_style_class_name('dynamic-top-bar-white-btn');

        if(this._btnShadow)
            this._panel.add_style_class_name('dynamic-top-bar-btn-shadow');
        else
            this._panel.remove_style_class_name('dynamic-top-bar-btn-shadow');

        this._setStyle([
            [this._panel, style],
            [this._leftCorner, corner_style],
            [this._rightCorner, corner_style]
        ]);
    }
});

/*
 * Window Manager
 * This class provide interface to work with windows
 */
const WindowManager = new Lang.Class({
    Name: 'WindowManager',

    /**
     * Constructor
     * @param  {Object} window    The window to manage
     * @param  {Object} workspace The workspace containing the window
     */
    _init: function(window, workspace) {
        this._metaWindow = window;
        this._workspace = workspace;

        this._notifyMinimizeId = this._metaWindow.connect('notify::minimized', Lang.bind(this, this._update));
        this._notifyMaximizeVId = this._metaWindow.connect('notify::maximized-vertically', Lang.bind(this, this._update));
        this._notifyMaximizeHId = this._metaWindow.connect('notify::maximized-horizontally', Lang.bind(this, this._update));
    },

    /**
     * Require the workspace to update it's state
     * This function is called on maximize, minize and restore events
     */
    _update: function() {
        this._workspace.updatePanelTransparency();
    },

    /**
     * Test if the window is maximized
     * @return {Boolean} true is window is maximized, false otherwise
     */
    isMaximized: function() {
        return this._metaWindow.maximized_vertically && !this._metaWindow.minimized;
    },

    /**
     * Get the monitor index which contain the window
     * @return {Number} The monitor index
     */
    getMonitorIndex: function() {
        return global.screen.get_monitor_index_for_rect(this._metaWindow.get_frame_rect());
    },

    /**
     * Test if the object manage metaWindow
     * @param  {Object} metaWindow The window to test
     * @return {Boolean}           true if metaWindow is managed by the object, false otherwise
     */
    equals: function(metaWindow) {
        return metaWindow == this._metaWindow;
    },

    /**
     * Destructor, removes event manager
     */
    destroy: function() {
        this._metaWindow.disconnect(this._notifyMinimizeId);
        this._metaWindow.disconnect(this._notifyMaximizeHId);
        this._metaWindow.disconnect(this._notifyMaximizeVId);
    }
});

/*
 * Workspace Manager
 */
const WorkspaceManager = new Lang.Class({
    Name: 'WorkspaceManager',

    _init: function(transparencyManager, metaWorkspace) {
        this._transparencyManager = transparencyManager;
        this._metaWorkspace = metaWorkspace;
        this._windowList = this.getWindowList();
        this._primaryMonitor = Main.layoutManager.primaryMonitor.index;

        this._notifyWindowAddedId = this._metaWorkspace.connect('window-added', Lang.bind(this, this._addWindow));
        this._notifyWindowRemovedId = this._metaWorkspace.connect('window-removed', Lang.bind(this, this._removeWindow));
    },

    getWindowList: function() {
        let tmpList = this._metaWorkspace.list_windows();
        let outList = [];

        for (let i = 0; i < tmpList.length; i++)
            outList.push(new WindowManager(tmpList[i], this));

        return outList;
    },

    isAnyWindowMaximized: function() {
        for (let i = 0; i < this._windowList.length; i++) {
            if (this._windowList[i].isMaximized() && this._windowList[i].getMonitorIndex() == this._primaryMonitor)
                return true;

            // Support DropDownTerminal https://github.com/zzrough/gs-extensions-drop-down-terminal
            if (this._windowList[i]._metaWindow.get_wm_class() == 'DropDownTerminalWindow')
                return true;
        }
        return false;
    },

    updatePanelTransparency: function() {
        if (this.isAnyWindowMaximized())
            this._transparencyManager.setSolid();
        else
            this._transparencyManager.setTransparent();
    },

    _haveWindow: function(metaWindow) {
        for (let i = 0; i < this._windowList.length; i++)
            if (this._windowList[i].equals(metaWindow))
                return true;
        return false;
    },

    _addWindow: function(metaWorkspace, metaWindow) {
        if (!this._haveWindow(metaWindow))
            this._windowList.push(new WindowManager(metaWindow, this));

        this.updatePanelTransparency();
    },

    _removeWindow: function(metaWorkspace, metaWindow) {
        for (let i = 0; i < this._windowList.length; i++)
            if (this._windowList[i].equals(metaWindow)) {
                this._windowList[i].destroy();
                this._windowList.splice(i, 1);
            }

        this.updatePanelTransparency();
    },

    _onDestroy: function() {
        for (let i = 0; i < this._windowList.length; i++)
            this._windowList[i].destroy();

        this._metaWorkspace.disconnect(this._notifyWindowAddedId);
        this._metaWorkspace.disconnect(this._notifyWindowRemovedId);
    },

    destroy: function() {
        this._onDestroy();
        this._transparencyManager = null;
        this._metaWorkspace = null;
        this._windowList = null;
    }
});

const ShellManager = new Lang.Class({
    Name: 'ShellManager',

    _init: function(transparencyManager, settings) {
        this._settings = settings;
        this._transparencyManager = transparencyManager;
        this._currentWorkspace = new WorkspaceManager(transparencyManager, global.screen.get_active_workspace());
        this._currentWorkspace.updatePanelTransparency();

        this._notifySwitchId = global.window_manager.connect('switch-workspace', Lang.bind(this, this._switchWorkspace));
        this._notifyShowOverviewId = Main.overview.connect('showing', Lang.bind(this, this._showOverview));
        this._notifyHideOverviewId = Main.overview.connect('hiding', Lang.bind(this, this._hideOverview));
        this._overviewOpen = false;

        this._notifySettingsId = this._settings.connect('changed', Lang.bind(this, this._settingsUpdate));
    },

    _switchWorkspace: function(winManager, previousWkId, newWkId) {
        this._currentWorkspace.destroy();
        delete this._currentWorkspace;
        this._currentWorkspace = new WorkspaceManager(this._transparencyManager, global.screen.get_workspace_by_index(newWkId));
        if (this._overviewOpen)
            this._transparencyManager.setTransparent();
        else
            this._currentWorkspace.updatePanelTransparency();
    },

    _showOverview: function() {
        this._transparencyManager.setTransparent();
        this._overviewOpen = true;
    },

    _hideOverview: function() {
        this._currentWorkspace.updatePanelTransparency();
        this._overviewOpen = false;
    },

    _onDestroy: function() {
        global.window_manager.disconnect(this._notifySwitchId);
        Main.overview.disconnect(this._notifyShowOverviewId);
        Main.overview.disconnect(this._notifyHideOverviewId);
        this._settings.disconnect(this._notifySettingsId);
    },

    _settingsUpdate: function() {
        debug('New style value ' + this._settings.get_string('style'), 'Notice');
        this._transparencyManager.updateStyle(this._settings.get_string('style'));
        this._transparencyManager.updateTransparencyLevel(this._settings.get_double('transparency-level'));
        this._transparencyManager.updateButtonShadow(this._settings.get_boolean('button-shadow'));
        this._transparencyManager.updateShowActivity(this._settings.get_boolean('show-activity'));
        this._currentWorkspace.updatePanelTransparency();
    }
});


/*
 * Global variables
 */
let topPanelTransparencyManager;
let globalManager;
let preferences;

/*
 * Extensions standard functions
 */
function init() {
}

function enable() {
    preferences = Convenience.getSettings();
    topPanelTransparencyManager = new PanelTransparencyManager(
        Main.panel,
        preferences.get_string('style'),
        preferences.get_double('transparency-level'),
        preferences.get_boolean('button-shadow'),
        preferences.get_boolean('show-activity')
    );
    new ShellManager(topPanelTransparencyManager, preferences);
}

function disable() {
    if (!topPanelTransparencyManager)
    {
        topPanelTransparencyManager = new PanelTransparencyManager(Main.panel);
        topPanelTransparencyManager.setSolid();
    }
    else
        topPanelTransparencyManager.setSolid();

    topPanelTransparencyManager = null;
}
