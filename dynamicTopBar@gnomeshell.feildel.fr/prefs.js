

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const Gettext = imports.gettext.domain('dynamicTopBar');
const _ = Gettext.gettext;

function debug(msg, level) {
    if (typeof level == 'string')
        level = ' ' + level + ' **: ';
    else
        level = '';
    global.log('DynamicTopBar-pref: ' + level + msg);
}

const PrefWindow = new GObject.Class({
	Name: 'PrefWindow',
	GTypeName: 'PrefWindow',
	Extends: Gtk.Grid,

	_init: function(params) {
		this.parent(params);
		this.margin = 12;
		this.row_spacing = this.column_spacing = 6;

		this._settings = Convenience.getSettings();

		this.set_orientation(Gtk.Orientation.VERTICAL);

		// Add Widgets
		this._widgets = {};

		// Main container
		this._widgets.box = new Gtk.Box({
			orientation: Gtk.Orientation.VERTICAL,
			margin: 20,
			margin_top: 10,
			expand: true,
			spacing: 10,
		});

		// Add widgets
		this._addStyleSelectorWidget();
		this._addTransparencyLevelWidget();
		this._addBtnShadowSwitch();

		// Insert main container
		this.add(this._widgets.box);
	},

	_addStyleSelectorWidget: function() {
		var label = new Gtk.Label({
			label: '<b>'+_("Tranparency style")+'</b>',
			use_markup: true,
			halign: Gtk.Align.START
		});

		var styleList = new Gtk.ListStore();
		styleList.set_column_types([
			GObject.TYPE_STRING
		]);

		styleList.set(
			styleList.append(),
			[0],
			[_("transparency")]
		);

		styleList.set(
			styleList.append(),
			[0],
			[_("gradient")]
		);

        let rendererText = new Gtk.CellRendererText();

		this._widgets.style = new Gtk.ComboBox({
			model: styleList
		});

        this._widgets.style.pack_start (rendererText, false);
        this._widgets.style.add_attribute (rendererText, "text", 0);

        if(this._settings.get_string('style') == "transparency")
        	this._widgets.style.set_active(0);
        else
        	this._widgets.style.set_active(1);

		let hbox = new Gtk.Box({
			orientation: Gtk.Orientation.HORIZONTAL,
		});

		hbox.pack_start(label, true, true, 0);
		hbox.add(this._widgets.style);

		this._widgets.box.add(hbox);

        this._widgets.style.connect ('changed', Lang.bind (this, this._styleChanged));
	},

	_addTransparencyLevelWidget: function() {
		var label = new Gtk.Label({
			label: '<b>'+_("Tranparency level")+'</b>',
			use_markup: true,
			halign: Gtk.Align.START
		});

		var adjustment = new Gtk.Adjustment({
			value: this._settings.get_double('transparency-level'),
			lower: 0,
			upper: 1,
			step_increment: 0.1,
			page_increment: 0.1
		});

		this._widgets.transparencyLevel = new Gtk.SpinButton({
			adjustment: adjustment
		});

		this._widgets.transparencyLevel.set_digits(2);

		let hbox = new Gtk.Box({
			orientation: Gtk.Orientation.HORIZONTAL,
		});

		hbox.pack_start(label, true, true, 0);
		hbox.add(this._widgets.transparencyLevel);

		this._widgets.box.add(hbox);

		this._widgets.transparencyLevel.connect('value-changed', Lang.bind(this, this._transparencyLevelChanged));
	},

	_addBtnShadowSwitch: function() {
		var label = new Gtk.Label({
			label: '<b>'+_("Button shadow")+'</b>',
			use_markup: true,
			halign: Gtk.Align.START
		});

		this._widgets.btnShadowSwitch = new Gtk.Switch({active: this._settings.get_boolean('button-shadow')});

		let hbox = new Gtk.Box({
			orientation: Gtk.Orientation.HORIZONTAL,
		});

		hbox.pack_start(label, true, true, 0);
		hbox.add(this._widgets.btnShadowSwitch);

		this._widgets.box.add(hbox);

		this._widgets.btnShadowSwitch.connect ('notify::active', Lang.bind (this, this._btnShadowUpdate));
	},

	_styleChanged: function() {
		let selection = this._widgets.style.get_active();
		log('New selection : ' + selection);
		if(selection == 0)
			this._settings.set_string('style', 'transparency');
		else
			this._settings.set_string('style', 'gradient');
	},

	_transparencyLevelChanged: function() {
		let value = this._widgets.transparencyLevel.get_value().toFixed(2);
		debug('New transparency value: ' + value);
		this._settings.set_double('transparency-level', value);
	},

	_btnShadowUpdate: function() {
		let value = this._widgets.btnShadowSwitch.get_active();
		this._settings.set_boolean('button-shadow', value);
	}
});

function init() {
	Convenience.initTranslations("dynamicTopBar");
}

function buildPrefsWidget() {
	let prefWindow = new PrefWindow();
	prefWindow.show_all();

	return prefWindow;
}
