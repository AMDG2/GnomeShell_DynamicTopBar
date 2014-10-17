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

const PanelTransparencyManager = new Lang.Class({
	Name: 'PanelTransparencyManager',

	_init: function(panel) {
		this._panel = panel;
	},

	setTransparent: function() {
		// Add transparency
		this._panel.actor.add_style_class_name('panel-transparency');
		this._panel._leftCorner.actor.add_style_class_name('corner-transparency');
		this._panel._rightCorner.actor.add_style_class_name('corner-transparency');
	},

	setSolid: function() {
		// Restore opacity
		this._panel.actor.remove_style_class_name('panel-transparency');
		this._panel._leftCorner.actor.remove_style_class_name('corner-transparency');
		this._panel._rightCorner.actor.remove_style_class_name('corner-transparency');
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
		for(let i = 0 ; i < this._windowList.length ; i++)
			if(this._windowList[i].isMaximized())
				return true;
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
		for(let i = 0 ; i < this._windowList.length ; i++)
			if(this._windowList[i].equals(metaWindow)) {
				this._windowList[i].destroy();
				this._windowList.splice(i, 1);
			}

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

	_init: function(transparencyManager) {
		this._transparencyManager = transparencyManager;
		this._currentWorkspace = new WorkspaceManager(transparencyManager, global.screen.get_active_workspace());
		this._currentWorkspace.updatePanelTransparency();

		this._notifySwitchId = global.window_manager.connect('switch-workspace', Lang.bind(this, this._switchWorkspace));
	},

	_switchWorkspace: function(winManager, previousWkId, newWkId) {
		this._currentWorkspace.destroy();
		delete this._currentWorkspace;
		this._currentWorkspace = new WorkspaceManager(this._transparencyManager, global.screen.get_workspace_by_index(newWkId));
		this._currentWorkspace.updatePanelTransparency();
	},

	_onDestroy: function() {
		global.window_manager.disconnect(this._notifySwitchId);
	}
});


/*
 * Global letiables
 */
let topPanelTransparencyManager;
let globalManager;

/*
 * Extensions standard functions
 */
function init() {
}

function enable() {
	topPanelTransparencyManager = new PanelTransparencyManager(Main.panel);
	workspaceManager = new GlobalManager(topPanelTransparencyManager);
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
