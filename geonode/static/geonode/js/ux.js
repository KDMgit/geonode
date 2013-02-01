/*
Ext JS - JavaScript Library
Copyright (c) 2006-2009, Ext JS, LLC
All rights reserved.
licensing@extjs.com

http://extjs.com/license

Open Source License
------------------------------------------------------------------------------------------
Ext is licensed under the terms of the Open Source GPL 3.0 license. 

http://www.gnu.org/licenses/gpl.html

There are several FLOSS exceptions available for use with this release for
open source applications that are distributed under a license other than the GPL.

 * Open Source License Exception for Applications

  http://extjs.com/products/floss-exception.php

 * Open Source License Exception for Development

  http://extjs.com/products/ux-exception.php


Commercial License
------------------------------------------------------------------------------------------
This is the appropriate option if you are creating proprietary applications and you are 
not prepared to distribute and share the source code of your application under the 
GPL v3 license. Please visit http://extjs.com/license for more details.


OEM / Reseller License
------------------------------------------------------------------------------------------
For more details, please visit: http://extjs.com/license.

--

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
General Public License for more details.
 */
Ext.grid.RowExpander = function(config) {
	Ext.apply(this, config);
	this.addEvents({
		beforeexpand : true,
		expand : true,
		beforecollapse : true,
		collapse : true,
		init : true
	});
	Ext.grid.RowExpander.superclass.constructor.call(this);
	if (this.tpl) {
		if (typeof this.tpl == 'string') {
			this.tpl = new Ext.Template(this.tpl);
		}
		this.tpl.compile();
	}
	this.state = {};
	this.bodyContent = {};
};
Ext
		.extend(
				Ext.grid.RowExpander,
				Ext.util.Observable,
				{
					header : "",
					width : 20,
					sortable : false,
					fixed : true,
					menuDisabled : true,
					dataIndex : '',
					id : 'expander',
					lazyRender : true,
					enableCaching : true,
					getRowClass : function(record, rowIndex, p, ds) {
						p.cols = p.cols - 1;
						var content = this.bodyContent[record.id];
						if (!content && !this.lazyRender) {
							content = this.getBodyContent(record, rowIndex);
						}
						if (content) {
							p.body = content;
						}
						return this.state[record.id] ? 'x-grid3-row-expanded'
								: 'x-grid3-row-collapsed';
					},
					init : function(grid) {
						this.grid = grid;
						var view = grid.getView();
						view.getRowClass = this.getRowClass
								.createDelegate(this);
						view.enableRowBody = true;
						grid.on('render', function() {
							view.mainBody.on('mousedown', this.onMouseDown,
									this);
						}, this);
						this.fireEvent('init', this);
					},
					getBodyContent : function(record, index) {
						if (!this.enableCaching) {
							return this.tpl.apply(record.data);
						}
						var content = this.bodyContent[record.id];
						if (!content) {
							content = this.tpl.apply(record.data);
							this.bodyContent[record.id] = content;
						}
						return content;
					},
					onMouseDown : function(e, t) {
						if (t.className == 'x-grid3-row-expander') {
							e.stopEvent();
							var row = e.getTarget('.x-grid3-row');
							this.toggleRow(row);
						}
					},
					renderer : function(v, p, record) {
						p.cellAttr = 'rowspan="2"';
						return '<div class="x-grid3-row-expander">&#160;</div>';
					},
					beforeExpand : function(record, body, rowIndex) {
						if (this.fireEvent('beforeexpand', this, record, body,
								rowIndex) !== false) {
							if (this.tpl && this.lazyRender) {
								body.innerHTML = this.getBodyContent(record,
										rowIndex);
							}
							return true;
						} else {
							return false;
						}
					},
					toggleRow : function(row) {
						if (typeof row == 'number') {
							row = this.grid.view.getRow(row);
						}
						this[Ext.fly(row).hasClass('x-grid3-row-collapsed') ? 'expandRow'
								: 'collapseRow'](row);
					},
					expandRow : function(row) {
						if (typeof row == 'number') {
							row = this.grid.view.getRow(row);
						}
						var record = this.grid.store.getAt(row.rowIndex);
						var body = Ext.DomQuery.selectNode(
								'tr:nth(2) div.x-grid3-row-body', row);
						if (this.beforeExpand(record, body, row.rowIndex)) {
							this.state[record.id] = true;
							Ext.fly(row).replaceClass('x-grid3-row-collapsed',
									'x-grid3-row-expanded');
							this.fireEvent('expand', this, record, body,
									row.rowIndex);
						}
					},
					collapseRow : function(row) {
						if (typeof row == 'number') {
							row = this.grid.view.getRow(row);
						}
						var record = this.grid.store.getAt(row.rowIndex);
						var body = Ext.fly(row).child(
								'tr:nth(1) div.x-grid3-row-body', true);
						if (this.fireEvent('beforecollapse', this, record,
								body, row.rowIndex) !== false) {
							this.state[record.id] = false;
							Ext.fly(row).replaceClass('x-grid3-row-expanded',
									'x-grid3-row-collapsed');
							this.fireEvent('collapse', this, record, body,
									row.rowIndex);
						}
					}
				});
Ext.namespace("Styler");
Styler.ColorManager = function(config) {
	Ext.apply(this, config);
};
Ext.apply(Styler.ColorManager.prototype, {
	field : null,
	init : function(field) {
		this.register(field);
	},
	destroy : function() {
		if (this.field) {
			this.unregister(this.field);
		}
	},
	register : function(field) {
		if (this.field) {
			this.unregister(this.field);
		}
		this.field = field;
		field.on({
			focus : this.fieldFocus,
			destroy : this.destroy,
			scope : this
		});
	},
	unregister : function(field) {
		field.un("focus", this.fieldFocus, this);
		field.un("destroy", this.destroy, this);
		if (Styler.ColorManager.picker && field == this.field) {
			Styler.ColorManager.picker
					.un("pickcolor", this.setFieldValue, this);
		}
		this.field = null;
	},
	fieldFocus : function(field) {
		if (!Styler.ColorManager.pickerWin) {
			Styler.ColorManager.picker = new Ext.ux.ColorPanel({
				hidePanel : false,
				autoHeight : false
			});
			Styler.ColorManager.pickerWin = new Ext.Window({
				title : "Color Picker",
				layout : "fit",
				closeAction : "hide",
				width : 405,
				height : 300,
				plain : true,
				items : Styler.ColorManager.picker
			});
		}
		Styler.ColorManager.picker.purgeListeners();
		this.setPickerValue();
		Styler.ColorManager.picker.on({
			pickcolor : this.setFieldValue,
			scope : this
		});
		Styler.ColorManager.pickerWin.show();
	},
	setFieldValue : function(picker, color) {
		if (this.field.isVisible()) {
			this.field.setValue("#" + color);
		}
	},
	setPickerValue : function() {
		var field = this.field;
		var hex = field.getHexValue ? field.getHexValue() : field.getValue();
		if (hex) {
			Styler.ColorManager.picker.setColor(hex.substring(1));
		}
	}
});
Styler.ColorManager.picker = null;
Styler.ColorManager.pickerWin = null;
Ext.namespace('Ext.ux');
Ext.ux.ColorPicker = function(config) {
	config.bodyStyle = {
		'padding' : '3px'
	};
	Ext.ux.ColorPicker.superclass.constructor.call(this, config);
	this.initialize(config);
}
Ext
		.extend(
				Ext.ux.ColorPicker,
				Ext.util.Observable,
				{
					HCHARS : '0123456789ABCDEF',
					initialize : function(config) {
						this.events = {};
						this.config = this.config || config;
						this.config.captions = this.config.captions || {};
						this.config.pickerHotPoint = this.config.pickerHotPoint
								|| {
									x : 3,
									y : 3
								};
						this._HSV = {
							h : 0,
							s : 100,
							v : 100
						};
						this._RGB = {
							r : 255,
							g : 255,
							b : 255
						};
						this._HEX = '000000';
						this.lastXYRgb = {
							x : 0,
							y : 0
						};
						this.lastYHue = 0;
						this.domElement = this.config.renderTo
								|| Ext.DomHelper
										.append(document.body, {}, true);
						this.domElement.addClass('x-cp-panel');
						this.cpCreateDomObjects();
						if (this.config.hidePanel) {
							this.formContainer.hide();
						}
						this.rgbPicker.on('mousedown', this.rgbPickerClick
								.createDelegate(this), this);
						this.huePicker.on('mousedown', this.huePickerClick
								.createDelegate(this), this);
						this.wsColorContainer.on('mousedown',
								this.setColorFromWebsafe.createDelegate(this),
								this);
						this.inColorContainer.on('mousedown',
								this.setColorFromInvert.createDelegate(this),
								this);
						Ext.getCmp('redValue' + this.domElement.id).on(
								'change',
								this.changeRGBField.createDelegate(this));
						Ext.getCmp('greenValue' + this.domElement.id).on(
								'change',
								this.changeRGBField.createDelegate(this));
						Ext.getCmp('blueValue' + this.domElement.id).on(
								'change',
								this.changeRGBField.createDelegate(this));
						Ext.getCmp('hueValue' + this.domElement.id).on(
								'change',
								this.changeHSVField.createDelegate(this));
						Ext.getCmp('saturationValue' + this.domElement.id).on(
								'change',
								this.changeHSVField.createDelegate(this));
						Ext.getCmp('brightnessValue' + this.domElement.id).on(
								'change',
								this.changeHSVField.createDelegate(this));
						Ext.getCmp('colorValue' + this.domElement.id).on(
								'change',
								this.changeHexaField.createDelegate(this));
						Ext.getCmp('redValue' + this.domElement.id).on(
								'specialkey',
								this.changeRGBField.createDelegate(this));
						Ext.getCmp('greenValue' + this.domElement.id).on(
								'specialkey',
								this.changeRGBField.createDelegate(this));
						Ext.getCmp('blueValue' + this.domElement.id).on(
								'specialkey',
								this.changeRGBField.createDelegate(this));
						Ext.getCmp('hueValue' + this.domElement.id).on(
								'specialkey',
								this.changeHSVField.createDelegate(this));
						Ext.getCmp('saturationValue' + this.domElement.id).on(
								'specialkey',
								this.changeHSVField.createDelegate(this));
						Ext.getCmp('brightnessValue' + this.domElement.id).on(
								'specialkey',
								this.changeHSVField.createDelegate(this));
						Ext.getCmp('colorValue' + this.domElement.id).on(
								{
									'specialkey' : function(field, evt) {
										if (evt.getKey() === evt.ENTER) {
											this.changeHexaField(field, field
													.getValue());
										}
									},
									scope : this
								});
						this.checkConfig();
						this.addEvents({
							pickcolor : true,
							changergb : true,
							changehsv : true,
							changehexa : true
						});
					},
					cpCreateDomObjects : function() {
						this.rgbPicker = Ext.DomHelper.append(this.domElement,
								{
									tag : 'div',
									cls : 'x-cp-rgb-msk'
								}, true);
						this.rgbPointer = Ext.DomHelper.append(this.rgbPicker,
								{
									tag : 'div',
									cls : 'x-cp-rgb-picker'
								}, true);
						this.rgbPointer.setXY([
								this.rgbPicker.getLeft()
										- this.config.pickerHotPoint.x,
								this.rgbPicker.getTop()
										- this.config.pickerHotPoint.y ]);
						this.huePicker = Ext.DomHelper.append(this.domElement,
								{
									tag : 'div',
									cls : 'x-cp-hue-msk'
								}, true);
						this.huePointer = Ext.DomHelper.append(this.huePicker,
								{
									tag : 'div',
									cls : 'x-cp-hue-picker'
								}, true);
						this.huePointer.setXY([
								this.huePicker.getLeft()
										+ (this.huePointer.getWidth() / 2) + 1,
								this.huePicker.getTop()
										- this.config.pickerHotPoint.y ]);
						this.formContainer = Ext.DomHelper.append(Ext.DomHelper
								.append(this.domElement, {
									tag : 'div',
									cls : 'x-cp-control-container'
								}, true), {
							tag : 'div',
							cls : 'x-cp-rgb-container',
							style : 'clear:both'
						}, true);
						this.colorContainer = Ext.DomHelper.append(
								this.formContainer, {
									cls : 'x-cp-coloro-container'
								}, true).update(
								this.config.captions.color || 'Color');
						this.form = new Ext.FormPanel({
							frame : true,
							width : 'auto',
							height : 227,
							cls : 'x-cp-form',
							labelWidth : 12,
							items : [ {
								xtype : 'fieldset',
								title : 'RGB',
								autoHeight : true,
								style : 'padding: 2px',
								defaultType : 'numberfield',
								items : [ {
									fieldLabel : 'Red',
									id : 'redValue' + this.domElement.id
								}, {
									fieldLabel : 'Green',
									id : 'greenValue' + this.domElement.id
								}, {
									fieldLabel : 'Blue',
									id : 'blueValue' + this.domElement.id
								} ]
							}, {
								xtype : 'fieldset',
								title : 'HSV',
								autoHeight : true,
								style : 'padding: 2px',
								defaultType : 'numberfield',
								items : [ {
									fieldLabel : 'Hue',
									id : 'hueValue' + this.domElement.id
								}, {
									fieldLabel : 'Satur.',
									id : 'saturationValue' + this.domElement.id
								}, {
									fieldLabel : 'Bright.',
									id : 'brightnessValue' + this.domElement.id
								} ]
							}, {
								xtype : 'fieldset',
								title : 'Color',
								autoHeight : true,
								style : 'padding: 2px',
								defaultType : 'textfield',
								items : [ {
									fieldLabel : 'Color',
									id : 'colorValue' + this.domElement.id
								} ]
							} ]
						});
						this.form.render(this.formContainer);
						var temp = Ext.DomHelper.append(this.form.body, {
							cls : 'x-cp-colors-container x-unselectable'
						}, true);
						this.wsColorContainer = Ext.DomHelper.append(temp, {
							cls : 'x-cp-color-container x-unselectable'
						}, true).update(
								this.config.captions.websafe || 'Websafe');
						this.inColorContainer = Ext.DomHelper.append(temp, {
							cls : 'x-cp-color-container x-unselectable'
						}, true).update(
								this.config.captions.inverse || 'Inverse');
						Ext.DomHelper
								.append(
										temp,
										{
											tag : 'div',
											style : 'height:0px;border:none;clear:both;font-size:1px;'
										});
						this.form.render(this.formContainer);
						Ext.DomHelper
								.append(
										this.domElement,
										{
											tag : 'div',
											style : 'height:0px;border:none;clear:both;font-size:1px;'
										});
					},
					realToDec : function(n) {
						return Math.min(255, Math.round(n * 256));
					},
					hsvToRgb : function(h, s, v) {
						if (h instanceof Array) {
							return this.hsvToRgb.call(this, h[0], h[1], h[2]);
						}
						var r, g, b, i, f, p, q, t;
						i = Math.floor((h / 60) % 6);
						f = (h / 60) - i;
						p = v * (1 - s);
						q = v * (1 - f * s);
						t = v * (1 - (1 - f) * s);
						switch (i) {
						case 0:
							r = v;
							g = t;
							b = p;
							break;
						case 1:
							r = q;
							g = v;
							b = p;
							break;
						case 2:
							r = p;
							g = v;
							b = t;
							break;
						case 3:
							r = p;
							g = q;
							b = v;
							break;
						case 4:
							r = t;
							g = p;
							b = v;
							break;
						case 5:
							r = v;
							g = p;
							b = q;
							break;
						}
						return [ this.realToDec(r), this.realToDec(g),
								this.realToDec(b) ];
					},
					rgbToHsv : function(r, g, b) {
						if (r instanceof Array) {
							return this.rgbToHsv.call(this, r[0], r[1], r[2]);
						}
						r = r / 255;
						g = g / 255;
						b = b / 255;
						var min, max, delta, h, s, v;
						min = Math.min(Math.min(r, g), b);
						max = Math.max(Math.max(r, g), b);
						delta = max - min;
						switch (max) {
						case min:
							h = 0;
							break;
						case r:
							h = 60 * (g - b) / delta;
							if (g < b) {
								h += 360;
							}
							break;
						case g:
							h = (60 * (b - r) / delta) + 120;
							break;
						case b:
							h = (60 * (r - g) / delta) + 240;
							break;
						}
						s = (max === 0) ? 0 : 1 - (min / max);
						return [ Math.round(h), s, max ];
					},
					rgbToHex : function(r, g, b) {
						if (r instanceof Array) {
							return this.rgbToHex.call(this, r[0], r[1], r[2]);
						}
						return this.decToHex(r) + this.decToHex(g)
								+ this.decToHex(b);
					},
					decToHex : function(n) {
						n = parseInt(n, 10);
						n = (!isNaN(n)) ? n : 0;
						n = (n > 255 || n < 0) ? 0 : n;
						return this.HCHARS.charAt((n - n % 16) / 16)
								+ this.HCHARS.charAt(n % 16);
					},
					getHCharPos : function(c) {
						return this.HCHARS.indexOf(c.toUpperCase());
					},
					hexToDec : function(hex) {
						var s = hex.split('');
						return ((this.getHCharPos(s[0]) * 16) + this
								.getHCharPos(s[1]));
					},
					hexToRgb : function(hex) {
						return [ this.hexToDec(hex.substr(0, 2)),
								this.hexToDec(hex.substr(2, 2)),
								this.hexToDec(hex.substr(4, 2)) ];
					},
					checkSafeNumber : function(v) {
						if (!isNaN(v)) {
							v = Math.min(Math.max(0, v), 255);
							var i, next;
							for (i = 0; i < 256; i = i + 51) {
								next = i + 51;
								if (v >= i && v <= next) {
									return (v - i > 25) ? next : i;
								}
							}
						}
						return v;
					},
					websafe : function(r, g, b) {
						if (r instanceof Array) {
							return this.websafe.call(this, r[0], r[1], r[2]);
						}
						return [ this.checkSafeNumber(r),
								this.checkSafeNumber(g),
								this.checkSafeNumber(b) ];
					},
					invert : function(r, g, b) {
						if (r instanceof Array) {
							return this.invert.call(this, r[0], r[1], r[2]);
						}
						return [ 255 - r, 255 - g, 255 - b ];
					},
					getHue : function(y) {
						var hue = 360 - Math
								.round(((this.huePicker.getHeight() - y) / this.huePicker
										.getHeight()) * 360);
						return hue === 360 ? 0 : hue;
					},
					getHPos : function(hue) {
						return hue * (this.huePicker.getHeight() / 360);
					},
					getSaturation : function(x) {
						return x / this.rgbPicker.getWidth();
					},
					getSPos : function(saturation) {
						return saturation * this.rgbPicker.getWidth();
					},
					getValue : function(y) {
						return (this.rgbPicker.getHeight() - y)
								/ this.rgbPicker.getHeight();
					},
					getVPos : function(value) {
						return this.rgbPicker.getHeight()
								- (value * this.rgbPicker.getHeight());
					},
					updateColorsFromRGBPicker : function() {
						this._HSV = {
							h : this._HSV.h,
							s : this.getSaturation(this.lastXYRgb.x),
							v : this.getValue(this.lastXYRgb.y)
						};
					},
					updateColorsFromHUEPicker : function() {
						this._HSV.h = this.getHue(this.lastYHue);
						var temp = this.hsvToRgb(this._HSV.h, 1, 1);
						temp = this.rgbToHex(temp[0], temp[1], temp[2]);
						this.rgbPicker.setStyle({
							backgroundColor : '#' + temp
						});
					},
					updateColorsFromRGBFields : function() {
						var temp = this.rgbToHsv(Ext.getCmp(
								'redValue' + this.domElement.id).getValue(),
								Ext.getCmp('greenValue' + this.domElement.id)
										.getValue(), Ext.getCmp(
										'blueValue' + this.domElement.id)
										.getValue());
						this._HSV = {
							h : temp[0],
							s : temp[1],
							v : temp[2]
						};
					},
					updateColorsFromHexaField : function() {
						var temp = this.hexToRgb(this._HEX);
						this._RGB = {
							r : temp[0],
							g : temp[1],
							b : temp[2]
						};
						temp = this.rgbToHsv(temp[0], temp[1], temp[2]);
						this._HSV = {
							h : temp[0],
							s : temp[1],
							v : temp[2]
						};
					},
					updateColorsFromHSVFields : function() {
						var temp = this.hsvToRgb(this._HSV.h, this._HSV.s,
								this._HSV.v);
						this._RGB = {
							r : temp[0],
							g : temp[1],
							b : temp[2]
						};
					},
					updateRGBFromHSV : function() {
						var temp = this.hsvToRgb(this._HSV.h, this._HSV.s,
								this._HSV.v);
						this._RGB = {
							r : temp[0],
							g : temp[1],
							b : temp[2]
						};
					},
					updateInputFields : function() {
						Ext.getCmp('redValue' + this.domElement.id).setValue(
								this._RGB.r);
						Ext.getCmp('greenValue' + this.domElement.id).setValue(
								this._RGB.g);
						Ext.getCmp('blueValue' + this.domElement.id).setValue(
								this._RGB.b);
						Ext.getCmp('hueValue' + this.domElement.id).setValue(
								this._HSV.h);
						Ext.getCmp('saturationValue' + this.domElement.id)
								.setValue(Math.round(this._HSV.s * 100));
						Ext.getCmp('brightnessValue' + this.domElement.id)
								.setValue(Math.round(this._HSV.v * 100));
						Ext.getCmp('colorValue' + this.domElement.id).setValue(
								this._HEX);
					},
					updateColor : function() {
						this._HEX = this.rgbToHex(this._RGB.r, this._RGB.g,
								this._RGB.b);
						this.colorContainer.setStyle({
							backgroundColor : '#' + this._HEX
						});
						this.colorContainer.set({
							title : '#' + this._HEX
						});
						var temp = this.rgbToHex(this.websafe(this._RGB.r,
								this._RGB.g, this._RGB.b));
						this.wsColorContainer.setStyle({
							backgroundColor : '#' + temp
						});
						this.wsColorContainer.set({
							title : '#' + temp
						});
						this.wsColorContainer.setStyle({
							color : '#'
									+ this.rgbToHex(this.invert(this.websafe(
											this._RGB.r, this._RGB.g,
											this._RGB.b)))
						});
						var temp = this.rgbToHex(this.invert(this._RGB.r,
								this._RGB.g, this._RGB.b));
						this.inColorContainer.setStyle({
							backgroundColor : '#' + temp
						});
						this.inColorContainer.setStyle({
							color : '#' + this._HEX
						});
						this.inColorContainer.set({
							title : '#' + temp
						});
						this.colorContainer.setStyle({
							color : '#' + temp
						});
						this.updateInputFields();
						this.fireEvent('pickcolor', this, this._HEX);
					},
					updatePickers : function() {
						this.lastXYRgb = {
							x : this.getSPos(this._HSV.s),
							y : this.getVPos(this._HSV.v)
						};
						this.rgbPointer.setXY([
								this.lastXYRgb.x - this.config.pickerHotPoint.x
										+ this.rgbPicker.getLeft(),
								this.lastXYRgb.y - this.config.pickerHotPoint.y
										+ this.rgbPicker.getTop() ],
								this.config.animate);
						this.lastYHue = this.getHPos(this._HSV.h);
						this.huePointer.setXY([
								this.huePicker.getLeft()
										+ (this.huePointer.getWidth() / 2) + 1,
								this.lastYHue + this.huePicker.getTop()
										- this.config.pickerHotPoint.y ],
								this.config.animate);
						var temp = this.hsvToRgb(this._HSV.h, 1, 1);
						temp = this.rgbToHex(temp[0], temp[1], temp[2]);
						this.rgbPicker.setStyle({
							backgroundColor : '#' + temp
						});
					},
					rgbPickerClick : function(event, cp) {
						this.lastXYRgb = {
							x : event.getPageX() - this.rgbPicker.getLeft(),
							y : event.getPageY() - this.rgbPicker.getTop()
						};
						this.rgbPointer
								.setXY(
										[
												event.getPageX()
														- this.config.pickerHotPoint.x,
												event.getPageY()
														- this.config.pickerHotPoint.y ],
										this.config.animate);
						this.updateColorsFromRGBPicker();
						this.updateRGBFromHSV();
						this.updateColor();
					},
					huePickerClick : function(event, cp) {
						this.lastYHue = event.getPageY()
								- this.huePicker.getTop();
						this.huePointer.setY([ event.getPageY() - 3 ],
								this.config.animate);
						this.updateColorsFromHUEPicker();
						this.updateRGBFromHSV();
						this.updateColor();
					},
					changeRGBField : function(element, newValue, oldValue) {
						if (!(newValue instanceof String)) {
							newValue = element.getValue();
						}
						if (newValue < 0) {
							newValue = 0;
						}
						if (newValue > 255) {
							newValue = 255;
						}
						if (element == Ext.getCmp('redValue'
								+ this.domElement.id)) {
							this._RGB.r = newValue;
						} else if (element == Ext.getCmp('greenValue'
								+ this.domElement.id)) {
							this._RGB.g = newValue;
						} else if (element == Ext.getCmp('blueValue'
								+ this.domElement.id)) {
							this._RGB.b = newValue;
						}
						this.updateColorsFromRGBFields();
						this.updateColor();
						this.updatePickers();
						this.fireEvent('changergb', this, this._RGB);
					},
					changeHSVField : function(element, newValue, oldValue) {
						if (!(newValue instanceof String)) {
							newValue = element.getValue();
						}
						if (element == Ext.getCmp('hueValue'
								+ this.domElement.id)) {
							if (newValue < 0) {
								newValue = 0;
							}
							if (newValue > 360) {
								newValue = 360;
							}
							this._HSV.h = newValue;
						} else {
							if (newValue < 0) {
								newValue = 0;
							}
							if (newValue > 100) {
								newValue = 100;
							}
							if (element == Ext.getCmp('saturationValue'
									+ this.domElement.id)) {
								this._HSV.s = (newValue / 100);
							} else if (element == Ext.getCmp('brightnessValue'
									+ this.domElement.id)) {
								this._HSV.v = (newValue / 100);
							}
						}
						this.updateColorsFromHSVFields();
						this.updateColor();
						this.updatePickers();
						this.fireEvent('changehsv', this, this._HSV);
					},
					changeHexaField : function(element, newValue, oldValue) {
						newValue = newValue.trim().substring(0, 6);
						if (newValue.length === 3) {
							newValue = newValue[0] + newValue[0] + newValue[1]
									+ newValue[1] + newValue[2] + newValue[2];
						}
						if (!newValue.match(/^[0-9a-f]{6}$/i)) {
							newValue = "000000";
						}
						this._HEX = newValue;
						this.updateColorsFromHexaField();
						this.updateColor();
						this.updatePickers();
						this.fireEvent('changehexa', this, this._HEX);
					},
					setColorFromWebsafe : function() {
						this.setColor(this.wsColorContainer.getColor(
								'backgroundColor', '', ''));
					},
					setColorFromInvert : function() {
						this.setColor(this.inColorContainer.getColor(
								'backgroundColor', '', ''));
					},
					checkConfig : function() {
						if (this.config) {
							if (this.config.color) {
								this.setColor(this.config.color);
							} else if (this.config.hsv) {
								this.setHSV(this.config.hsv);
							} else if (this.config.rgb) {
								this.setRGB(this.config.rgb);
							}
						}
					},
					setColor : function(hexa) {
						var temp = this.hexToRgb(hexa);
						this._RGB = {
							r : temp[0],
							g : temp[1],
							b : temp[2]
						}
						var temp = this.rgbToHsv(temp);
						this._HSV = {
							h : temp[0],
							s : temp[1],
							v : temp[2]
						};
						this.updateColor();
						this.updatePickers();
					},
					setRGB : function(rgb) {
						this._RGB = rgb;
						var temp = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
						this._HSV = {
							h : temp[0],
							s : temp[1],
							v : temp[2]
						};
						this.updateColor();
						this.updatePickers();
					},
					setHSV : function(hsv) {
						this._HSV = {
							h : hsv.h,
							s : (hsv.s / 100),
							v : (hsv.v / 100)
						};
						var temp = this.hsvToRgb(hsv.h, (hsv.s / 100),
								(hsv.v / 100));
						this._RGB = {
							r : temp[0],
							g : temp[1],
							b : temp[2]
						};
						this.updateColor();
						this.updatePickers();
					},
					getColor : function(hash) {
						return (hash ? '' : '#') + this._HEX;
					},
					getRGB : function() {
						return this._RGB;
					},
					getHSV : function() {
						return this._HSV;
					},
					setPanelVisible : function(show, animate) {
						return this.formContainer.setVisible(show, animate);
					},
					isPanelVisible : function() {
						return this.formContainer.isDisplayed();
					},
					showPicker : function() {
						this.domElement.show();
					},
					hidePicker : function() {
						this.domElement.hide();
					}
				});
Ext.ux.ColorPanel = function(config) {
	this.config = config;
	this.config.renderTo = this.config.renderTo
			|| Ext.DomHelper.append(document.body, {}, true);
	Ext.ux.ColorPanel.superclass.constructor.call(this, config);
	this.domElement = Ext.get(this.config.renderTo);
	this.render(this.domElement);
	this.config.renderTo = this.body;
	this.initialize(this.config);
	this.getEl().addClass('x-cp-panel');
	this.domElement.removeClass('x-cp-panel')
	this.body.setStyle({
		'padding' : '5px'
	});
}
Ext.extend(Ext.ux.ColorPanel, Ext.Panel);
Ext.applyIf(Ext.ux.ColorPanel.prototype, Ext.ux.ColorPicker.prototype);
Ext.ux.ColorDialog = function(config) {
	this.config = config;
	this.config.resizable = false;
	this.config.renderTo = this.config.renderTo
			|| Ext.DomHelper.append(document.body, {}, true);
	Ext.ux.ColorDialog.superclass.constructor.call(this, config);
	this.domElement = Ext.get(this.config.renderTo);
	this.render(this.domElement);
	this.config.renderTo = this.body;
	this.initialize(this.config);
	this.body.addClass('x-cp-panel')
	this.body.setStyle({
		padding : '5px'
	});
	this.setSize(398, 300);
}
Ext.extend(Ext.ux.ColorDialog, Ext.Window);
Ext.applyIf(Ext.ux.ColorDialog.prototype, Ext.ux.ColorPicker.prototype);
Ext.ns('Ext.ux.form');
Ext.ux.form.FileUploadField = Ext.extend(Ext.form.TextField, {
	buttonText : 'Browse...',
	buttonOnly : false,
	buttonOffset : 3,
	readOnly : true,
	autoSize : Ext.emptyFn,
	initComponent : function() {
		Ext.ux.form.FileUploadField.superclass.initComponent.call(this);
		this.addEvents('fileselected');
	},
	onRender : function(ct, position) {
		Ext.ux.form.FileUploadField.superclass.onRender
				.call(this, ct, position);
		this.wrap = this.el.wrap({
			cls : 'x-form-field-wrap x-form-file-wrap'
		});
		this.el.addClass('x-form-file-text');
		this.el.dom.removeAttribute('name');
		this.createFileInput();
		var btnCfg = Ext.applyIf(this.buttonCfg || {}, {
			text : this.buttonText
		});
		this.button = new Ext.Button(Ext.apply(btnCfg, {
			renderTo : this.wrap,
			cls : 'x-form-file-btn' + (btnCfg.iconCls ? ' x-btn-icon' : '')
		}));
		if (this.buttonOnly) {
			this.el.hide();
			this.wrap.setWidth(this.button.getEl().getWidth());
		}
		this.bindListeners();
		this.resizeEl = this.positionEl = this.wrap;
	},
	bindListeners : function() {
		this.fileInput.on({
			scope : this,
			mouseenter : function() {
				this.button.addClass([ 'x-btn-over', 'x-btn-focus' ])
			},
			mouseleave : function() {
				this.button.removeClass([ 'x-btn-over', 'x-btn-focus',
						'x-btn-click' ])
			},
			mousedown : function() {
				this.button.addClass('x-btn-click')
			},
			mouseup : function() {
				this.button.removeClass([ 'x-btn-over', 'x-btn-focus',
						'x-btn-click' ])
			},
			change : function() {
				var v = this.fileInput.dom.value;
				this.setValue(v);
				this.fireEvent('fileselected', this, v);
			}
		});
	},
	createFileInput : function() {
		this.fileInput = this.wrap.createChild({
			id : this.getFileInputId(),
			name : this.name || this.getId(),
			cls : 'x-form-file',
			tag : 'input',
			type : 'file',
			size : 1
		});
	},
	reset : function() {
		this.fileInput.remove();
		this.createFileInput();
		this.bindListeners();
		Ext.ux.form.FileUploadField.superclass.reset.call(this);
	},
	getFileInputId : function() {
		return this.id + '-file';
	},
	onResize : function(w, h) {
		Ext.ux.form.FileUploadField.superclass.onResize.call(this, w, h);
		this.wrap.setWidth(w);
		if (!this.buttonOnly) {
			var w = this.wrap.getWidth() - this.button.getEl().getWidth()
					- this.buttonOffset;
			this.el.setWidth(w);
		}
	},
	onDestroy : function() {
		Ext.ux.form.FileUploadField.superclass.onDestroy.call(this);
		Ext.destroy(this.fileInput, this.button, this.wrap);
	},
	onDisable : function() {
		Ext.ux.form.FileUploadField.superclass.onDisable.call(this);
		this.doDisable(true);
	},
	onEnable : function() {
		Ext.ux.form.FileUploadField.superclass.onEnable.call(this);
		this.doDisable(false);
	},
	doDisable : function(disabled) {
		this.fileInput.dom.disabled = disabled;
		this.button.setDisabled(disabled);
	},
	preFocus : Ext.emptyFn,
	alignErrorIcon : function() {
		this.errorIcon.alignTo(this.wrap, 'tl-tr', [ 2, 0 ]);
	}
});
Ext.reg('fileuploadfield', Ext.ux.form.FileUploadField);
Ext.form.FileUploadField = Ext.ux.form.FileUploadField;