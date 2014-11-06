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


/* Debug tool */
const St = imports.gi.St;
const Mainloop = imports.mainloop;

function _showMessage(msg) {
    let label = new St.Label({ style_class: 'debug-label', text: msg });
    let monitor = Main.layoutManager.primaryMonitor;
    global.stage.add_actor(label);
    label.set_position(Math.floor (monitor.width / 2 - label.width / 2), Math.floor(monitor.height / 2 - label.height / 2));
    Mainloop.timeout_add(3000, function () { label.destroy(); });
}


const PanelTransparencyManager = new Lang.Class({
	Name: 'PanelTransparencyManager',

	_init: function(panel, style) {
		this._panel = panel;
		this._style = style || 'transparency';
		this._isTransp= true;
	},

	updateStyle: function(newStyle) {
		let retransp = false;
		if(this._isTransp) {
			this.setSolid();
			retransp = true;
		}
		this._style = newStyle;
		if(retransp) this.setTransparent();
	},

	setTransparent: function() {
		// Add transparency
		//_showMessage("Style used : " + this._style);
		this._isTransp = true;
		this._panel.actor.add_style_class_name('panel-' + this._style);
		this._panel._leftCorner.actor.add_style_class_name('corner-' + this._style);
		this._panel._rightCorner.actor.add_style_class_name('corner-' + this._style);
	},

	setSolid: function() {
		// Restore opacity
		//_showMessage("Style used : solid");
		this._isTransp = false;
		this._panel.actor.remove_style_class_name('panel-' + this._style);
		this._panel._leftCorner.actor.remove_style_class_name('corner-' + this._style);
		this._panel._rightCorner.actor.remove_style_class_name('corner-' + this._style);
	}
});

/*
 * Window Manager
 */
const WindowManager = new Lang.Class({
	Name: 'WindowManager',

	_init: function(window, workspace) {
		this._metaWindow = window;
		this._workspace = workspace;

		this._notifyMinimizeId  = this._metaWindow.connect('notify::minimized', Lang.bind(this, this._update));
		this._notifyMaximizeVId = this._metaWindow.connect('notify::maximized-vertically', Lang.bind(this, this._update));
		this._notifyMaximizeHId = this._metaWindow.connect('notify::maximized-horizontally', Lang.bind(this, this._update));
	},

	_update: function() {
		this._workspace.updatePanelTransparency();
	},

	isMaximized: function() {
		return this._metaWindow.maximized_vertically && !this._metaWindow.minimized;
	},

	getMonitorIdex: function() {
		return global.screen.get_monitor_index_for_rect(this._metaWindow.get_outer_rect());
	},

	equals: function(metaWindow) {
		return metaWindow == this._metaWindow;
	},

	_onDestroy: function() {
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

		for(let i = 0 ; i < tmpList.length ; i++)
			outList.push(new WindowManager(tmpList[i], this));

		return outList;
	},

	isAnyWindowMaximized: function() {
		for(let i = 0 ; i < this._windowList.length ; i++) {
			if(this._windowList[i].isMaximized() && this._windowList[i].getMonitorIdex() == this._primaryMonitor)
				return true;
		}
		return false;
	},

	updatePanelTransparency: function() {
		if(this.isAnyWindowMaximized())
			this._transparencyManager.setSolid();
		else
			this._transparencyManager.setTransparent();
	},

	_haveWindow: function(metaWindow) {
		for(let i = 0 ; i < this._windowList.length ; i++)
			if(this._windowList[i].equals(metaWindow))
				return true;
		return false;
	},

	_addWindow: function(metaWorkspace, metaWindow) {
		if(!this._haveWindow(metaWindow))
			this._windowList.push(new WindowManager(metaWindow, this));

		this.updatePanelTransparency();
	},

	_removeWindow: function(metaWorkspace, metaWindow) {
		this.updatePanelTransparency();
	},

	_onDestroy: function() {
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

const GlobalManager = new Lang.Class({
	Name: 'WorkspaceList',

	_init: function(transparencyManager, settings) {
		this._settings = settings;
		this._transparencyManager = transparencyManager;
		this._currentWorkspace = new WorkspaceManager(transparencyManager, global.screen.get_active_workspace());
		this._currentWorkspace.updatePanelTransparency();

		this._notifySwitchId = global.window_manager.connect('switch-workspace', Lang.bind(this, this._switchWorkspace));
		this._notifyShowOverviewId = Main.overview.connect('showing', Lang.bind(this, this._showOverview));
		this._notifyHideOverviewId = Main.overview.connect('hiding',  Lang.bind(this, this._hideOverview));
		this._overviewOpen = false;

		this._notifySettingsId = this._settings.connect('changed', Lang.bind(this, this._settingsUpdate))
	},

	_switchWorkspace: function(winManager, previousWkId, newWkId) {
		this._currentWorkspace.destroy();
		delete this._currentWorkspace;
		this._currentWorkspace = new WorkspaceManager(this._transparencyManager, global.screen.get_workspace_by_index(newWkId));
		if(this._overviewOpen)
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
		//_showMessage('New style value ' + this._settings.get_string('style'));
		this._transparencyManager.updateStyle(this._settings.get_string('style'));
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
	topPanelTransparencyManager = new PanelTransparencyManager(Main.panel, preferences.get_string('style'));
	workspaceManager = new GlobalManager(topPanelTransparencyManager, preferences);
}

function disable() {
	if(!topPanelTransparencyManager)
	{
		topPanelTransparencyManager = new PanelTransparencyManager(Main.panel);
		topPanelTransparencyManager.setSolid();
	}
	else
		topPanelTransparencyManager.setSolid();

	topPanelTransparencyManager = null;
}
