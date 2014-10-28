

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

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

		this.add(new Gtk.Label({
			label: '<b>Tranparency style</b>',
			use_markup: true,
			halign: Gtk.Align.START
		}));

		this._styleList = new Gtk.ListStore();
		this._styleList.set_column_types([
			GObject.TYPE_STRING
		]);

		this._styleList.set(
			this._styleList.append(),
			[0],
			['transparency']
		);

		this._styleList.set(
			this._styleList.append(),
			[0],
			['gradient']
		);

        let rendererText = new Gtk.CellRendererText();

		this._comboBox = new Gtk.ComboBox({
			model: this._styleList
		});

        this._comboBox.pack_start (rendererText, false);
        this._comboBox.add_attribute (rendererText, "text", 0);

        if(this._settings.get_string('style') == 'transparency')
        	this._comboBox.set_active(0);
        else
        	this._comboBox.set_active(1);
        	
		this.add(this._comboBox);

		//this._settings.bind('style', this._comboBox, 'text', Gio.SettingsBindFlags.DEFAULT);
        this._comboBox.connect ('changed', Lang.bind (this, this._styleChanged));
	},
	
	_styleChanged: function() {
		let selection = this._comboBox.get_active();
		log('New selection : ' + selection);
		if(selection == 0)
			this._settings.set_string('style', 'transparency');
		else
			this._settings.set_string('style', 'gradient');
	}
});

function init() {

}

function buildPrefsWidget() {
	let prefWindow = new PrefWindow();
	prefWindow.show_all();

	return prefWindow;
}
