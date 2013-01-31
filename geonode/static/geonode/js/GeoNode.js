/*
Copyright (c) 2008-2009, The Open Planning Project
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
 * Neither the name of the Open Planning Project nor the names
      of its contributors may be used to endorse or promote products derived
      from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
 */
Ext.namespace("GeoNode"); 
GeoNode.DataGrid = Ext
		.extend(
				Ext.util.Observable,
				{
					dataTitleHeaderText : "UT:Title",
					dataNameHeaderText : "UT:Name",
					dataDetailText : 'UT: Click here for more information about this layer.',
					constructor : function(config) {
						Ext.apply(this, config);
						this.loadData();
					},
					owsURL : function(params) {
						var url = this.ows + '?' + Ext.urlEncode(params);
						if (this.proxy) {
							url = this.proxy + '?' + Ext.urlEncode({
								"url" : url
							});
						}
						return url;
					},
					loadData : function() {
						var url = this.owsURL({
							'service' : 'WMS',
							'request' : 'GetCapabilities'
						});
						this.capabilities = new GeoExt.data.WMSCapabilitiesStore(
								{
									url : url,
									fields : [ {
										name : "name",
										type : "string"
									}, {
										name : "abstract",
										type : "string"
									}, {
										name : "queryable",
										type : "boolean"
									}, {
										name : "formats"
									}, {
										name : "styles"
									}, {
										name : "llbbox"
									}, {
										name : "minScale"
									}, {
										name : "maxScale"
									}, {
										name : "prefix"
									}, {
										name : "attribution"
									}, {
										name : "keywords"
									}, {
										name : "metadataURLs"
									}, {
										name : "owsType"
									} ]
								});
						gxp.util.dispatch([ function(done) {
							this.capabilities.load({
								callback : done,
								scope : this
							});
						} ], this.doLayout, this);
					},
					doLayout : function() {
						var expanderTemplate = '<p><b>'
								+ GeoExplorer.CapabilitiesRowExpander.prototype.abstractText
								+ '</b> {abstract}</p>'
								+ '<p><b>'
								+ GeoExplorer.CapabilitiesRowExpander.prototype.attributionText
								+ '</b> {attribution:this.attributionLink}</p>'
								+ '<p><b>'
								+ GeoExplorer.CapabilitiesRowExpander.prototype.metadataText
								+ '</b> {metadataURLs:this.metadataLinks}</p>'
								+ '<p><b>'
								+ GeoExplorer.CapabilitiesRowExpander.prototype.keywordText
								+ '</b> {keywords:this.keywordList}</p>'
								+ '<p><b>'
								+ GeoExplorer.CapabilitiesRowExpander.prototype.downloadText
								+ '</b> '
								+ '<a class="download pdf" href="{name:this.pdfUrl}">PDF</a>, '
								+ '<a class="download kml" href="{name:this.kmlUrl}">KML</a>, '
								+ '<a class="download geotiff" href="{name:this.geoTiffUrl}">GeoTIFF</a>'
								+ '<span class="{owsType:this.showWFS}">, '
								+ '<a class="download shp" href="{name:this.shpUrl}">SHP (ZIP)</a>'
								+ '</span>' + '</p>'
								+ '<p><a href="/data/{name}">'
								+ this.dataDetailText + '</a></p>';
						var expander = new GeoExplorer.CapabilitiesRowExpander(
								{
									tpl : new Ext.Template(expanderTemplate),
									ows : this.ows
								});
						new Ext.grid.GridPanel({
							store : this.capabilities,
							plugins : [ expander ],
							columns : [ expander, {
								header : this.dataTitleHeaderText,
								dataIndex : 'title'
							}, {
								header : this.dataNameHeaderText,
								dataIndex : 'name'
							} ],
							viewConfig : {
								autoFill : true
							},
							height : 300,
							renderTo : this.renderTo
						})
					}
				});
Ext.namespace("GeoNode");
GeoNode.SearchTable = Ext.extend(Ext.util.Observable, {
	selectHeaderText : 'UT: Select',
	nameHeaderText : 'UT: Name',
	titleHeaderText : 'UT: Title',
	selectText : 'UT: Select:',
	selectAllText : 'UT: All',
	selectNoneText : 'UT: None',
	previousText : 'UT: Prev',
	nextText : 'UT: Next',
	ofText : 'UT: of',
	noResultsText : 'UT: Your search did not match any items.',
	searchLabelText : 'UT: Search Data',
	searchButtonText : 'UT: Search',
	showingText : 'UT: Showing',
	loadingText : 'UT: Loading',
	permalinkText : 'UT: permalink',
	unviewableTooltip : 'UT: Unviewable Data',
	remoteTooltip : 'UT: Remote Data',
	constructor : function(config) {
		this.addEvents('load');
		Ext.apply(this, config);
		this.initFromQuery();
		this.loadData();
	},
	loadData : function() {
		this.searchStore = new Ext.data.JsonStore({
			url : this.searchURL,
			root : 'rows',
			idProperty : 'uuid',
			remoteSort : true,
			totalProperty : 'total',
			fields : [ {
				name : 'name',
				type : 'string'
			}, {
				name : 'title',
				type : 'string'
			}, {
				name : 'uuid',
				type : 'string'
			}, {
				name : 'abstract',
				type : 'string'
			}, {
				name : 'keywords'
			}, {
				name : 'detail',
				type : 'string'
			}, {
				name : 'attribution'
			}, {
				name : 'download_links'
			}, {
				name : 'metadata_links'
			}, {
				name : 'bbox'
			}, {
				name : '_local'
			}, {
				name : '_permissions'
			} ]
		});
		this.searchStore.on('load', function() {
			this.updateControls();
			if (this.dataCart) {
				this.dataCart.reselect();
			}
			this.fireEvent('load', this);
		}, this);
		this.doLayout();
		this.doSearch();
	},
	initFromQuery : function() {
		if (!this.searchParams) {
			this.searchParams = {};
		}
		if (!this.searchParams.start) {
			this.searchParams.start = 0;
		}
		if (!this.searchParams.limit) {
			this.searchParams.limit = 25;
		}
		if (this.constraints) {
			for ( var i = 0; i < this.constraints.length; i++) {
				this.constraints[i].initFromQuery(this, this.searchParams);
			}
		}
	},
	doSearch : function() {
		this.searchParams.start = 0;
		if (this.constraints) {
			for ( var i = 0; i < this.constraints.length; i++) {
				this.constraints[i].applyConstraint(this.searchParams);
			}
		}
		this._search(this.searchParams);
	},
	_search : function(params) {
		this.disableControls();
		this.searchStore.load({
			params : params
		});
		this.updatePermalink(params);
	},
	loadNextBatch : function() {
		this.searchParams.start += this.searchParams.limit;
		this._search(this.searchParams);
	},
	loadPrevBatch : function() {
		this.searchParams.start -= this.searchParams.limit;
		if (this.searchParams.start < 0) {
			this.searchParams.start = 0;
		}
		this._search(this.searchParams);
	},
	disableControls : function() {
		this.nextButton.setDisabled(true);
		this.prevButton.setDisabled(true);
		this.pagerLabel.setText(this.loadingText);
	},
	updateControls : function() {
		var total = this.searchStore.getTotalCount();
		if (this.searchParams.start > 0) {
			this.prevButton.setDisabled(false);
		} else {
			this.prevButton.setDisabled(true);
		}
		if (this.searchParams.start + this.searchParams.limit < total) {
			this.nextButton.setDisabled(false);
		} else {
			this.nextButton.setDisabled(true);
		}
		var minItem = this.searchParams.start + 1;
		var maxItem = minItem + this.searchParams.limit - 1;
		if (minItem > total) {
			minItem = total;
		}
		if (maxItem > total) {
			maxItem = total;
		}
		this.pagerLabel.setText(this.showingText + ' ' + minItem + '-'
				+ maxItem + ' ' + this.ofText + ' ' + total);
	},
	updatePermalink : function() {
		if (this.permalink) {
			this.permalink.href = Ext.urlAppend(this.permalinkURL, Ext
					.urlEncode(this.searchParams));
		}
	},
	updateQuery : function() {
		this.searchParams.q = this.queryInput.getValue();
		this.doSearch();
	},
	hookupSearchButtons : function(el) {
		var root = Ext.get(el);
		var buttons = root.query('.search-button');
		for ( var i = 0; i < buttons.length; i++) {
			var text = buttons[i].innerHTML || this.searchButtonText;
			Ext.get(buttons[i]).update('');
			var searchButton = new Ext.Button({
				text : text,
				renderTo : buttons[i]
			});
			searchButton.on('click', this.doSearch, this);
		}
	},
	doLayout : function() {
		var widgetHTML = '<div class="search-results">'
				+ '<div class="search-input"></div>'
				+ '<div class="search-table"></div>'
				+ '<div class="search-controls"></div>' + '</div>';
		var el = Ext.get(this.renderTo);
		el.update(widgetHTML);
		var input_el = el.query('.search-input')[0];
		var table_el = el.query('.search-table')[0];
		var controls_el = el.query('.search-controls')[0];
		var expander = new GeoNode.SearchTableRowExpander({
			fetchURL : this.layerDetailURL
		});
		tableCfg = {
			store : this.searchStore,
			plugins : [ expander ],
			autoExpandColumn : 'title',
			viewConfig : {
				autoFill : true,
				forceFit : true,
				emptyText : this.noResultsText
			},
			autoHeight : true,
			renderTo : table_el
		};
		var unviewableTooltip = this.unviewableTooltip;
		var remoteTooltip = this.remoteTooltip;
		var columns = [
				expander,
				{
					header : this.titleHeaderText,
					dataIndex : 'title',
					id : 'title',
					renderer : function(value, metaData, record, rowIndex,
							colIndex, store) {
						var is_local = record.get('_local');
						var detail = record.get('detail');
						if (is_local) {
							var permissions = record.get('_permissions');
							if (permissions.view != true) {
								detail = '';
							}
						}
						if (detail) {
							detail = '<a href="' + detail + '">' + value
									+ '</a>';
						} else {
							detail = value;
						}
						return detail;
					}
				},
				{
					dataIndex : '_local',
					id : 'layer_info',
					width : 6,
					resizable : false,
					renderer : function(value, metaData, record, rowIndex,
							colIndex, store) {
						var is_local = record.get('_local');
						var info_type = '';
						var tooltip = '';
						if (is_local) {
							var permissions = record.get('_permissions');
							if (permissions.view != true) {
								detail = '';
								info_type = 'unviewable-layer';
								tooltip = unviewableTooltip;
							} else {
								info_type = 'info-layer';
							}
						} else {
							info_type = 'remote-layer';
							tooltip = remoteTooltip;
						}
						info = '<span class="' + info_type + '" title="'
								+ tooltip + '"></span>';
						return info;
					}
				} ];
		if (this.trackSelection == true) {
			sm = new Ext.grid.CheckboxSelectionModel({
				checkOnly : true,
				renderer : function(v, p, record) {
					var permissions = record.get('_permissions');
					if (permissions.view != true) {
						return '<div>&#160;</div>'
					} else {
						return '<div class="x-grid3-row-checker">&#160;</div>';
					}
				},
				listeners : {
					'beforerowselect' : function(sm, rowIndex, keepExisting,
							record) {
						var permissions = record.get('_permissions');
						if (permissions.view != true) {
							return false;
						}
					}
				}
			});
			this.dataCart = new GeoNode.DataCartStore({
				selModel : sm
			});
			columns.push(sm);
			tableCfg.selModel = sm;
		}
		var colModel = new Ext.grid.ColumnModel({
			defaults : {
				sortable : false,
				menuDisabled : true
			},
			columns : columns
		});
		tableCfg.colModel = colModel;
		this.table = new Ext.grid.GridPanel(tableCfg);
		this.queryInput = new Ext.form.TextField({
			fieldLabel : this.searchLabelText,
			name : 'search',
			allowBlank : true,
			width : 350
		});
		this.queryInput.on('specialkey', function(field, e) {
			if (e.getKey() == e.ENTER) {
				this.updateQuery();
			}
		}, this);
		var searchButton = new Ext.Button({
			text : this.searchButtonText
		});
		searchButton.on('click', this.updateQuery, this)
		var searchForm = new Ext.Panel({
			frame : false,
			border : false,
			layout : new Ext.layout.HBoxLayout({
				defaultMargins : {
					top : 10,
					bottom : 10,
					left : 0,
					right : 10
				}
			}),
			items : [ this.queryInput, searchButton ]
		});
		searchForm.render(input_el);
		this.prevButton = new Ext.Button({
			text : this.previousText
		});
		this.prevButton.on('click', this.loadPrevBatch, this);
		this.nextButton = new Ext.Button({
			text : this.nextText
		});
		this.nextButton.on('click', this.loadNextBatch, this);
		this.pagerLabel = new Ext.form.Label({
			text : ""
		});
		var controls = new Ext.Panel({
			frame : false,
			border : false,
			layout : new Ext.layout.HBoxLayout({
				defaultMargins : {
					top : 10,
					bottom : 10,
					left : 0,
					right : 10
				}
			}),
			items : [ this.prevButton, this.nextButton, this.pagerLabel ]
		});
		controls.render(controls_el);
		this.permalink = Ext.query('a.permalink')[0];
		this.disableControls();
		if (this.searchParams.q) {
			this.queryInput.setValue(this.searchParams.q);
		}
		this.updatePermalink();
	}
});
Ext.namespace("GeoNode");
GeoNode.MapSearchTable = Ext.extend(Ext.util.Observable,
		{
			autoExpandColumn : 'title',
			titleHeaderText : 'UT: Title',
			contactHeaderText : "UT: Contact",
			lastModifiedHeaderText : "UT: Last Modified",
			mapAbstractLabelText : "UT: Abstract",
			mapLinkLabelText : "UT:View this Map",
			previousText : 'UT: Prev',
			nextText : 'UT: Next',
			ofText : 'UT: of',
			noResultsText : 'UT: Your search did not match any items.',
			searchLabelText : 'UT: Search Maps',
			searchButtonText : 'UT: Search',
			showingText : 'UT: Showing',
			loadingText : 'UT: Loading',
			permalinkText : 'UT: permalink',
			constructor : function(config) {
				this.addEvents('load');
				Ext.apply(this, config);
				this.initFromQuery();
				this.loadData();
			},
			loadData : function() {
				this.searchStore = new Ext.data.JsonStore({
					url : this.searchURL,
					root : 'rows',
					idProperty : 'name',
					remoteSort : true,
					totalProperty : 'total',
					fields : [ {
						name : 'id',
						mapping : 'id'
					}, {
						name : 'title',
						type : 'string'
					}, {
						name : 'abstract',
						type : 'string'
					}, {
						name : 'detail',
						type : 'string'
					}, {
						name : 'owner',
						type : 'string'
					}, {
						name : 'owner_detail',
						type : 'string'
					}, {
						name : 'last_modified',
						type : 'string'
					} ]
				});
				this.searchStore.on('load', function() {
					this.updateControls();
					this.fireEvent('load', this);
				}, this);
				this.doLayout();
				this.doSearch();
			},
			initFromQuery : function() {
				if (!this.searchParams) {
					this.searchParams = {};
				}
				if (!this.searchParams.start) {
					this.searchParams.start = 0;
				}
				if (!this.searchParams.limit) {
					this.searchParams.limit = 25;
				}
				if (this.constraints) {
					for ( var i = 0; i < this.constraints.length; i++) {
						this.constraints[i].initFromQuery(this,
								this.searchParams);
					}
				}
			},
			doSearch : function() {
				this.searchParams.start = 0;
				if (this.constraints) {
					for ( var i = 0; i < this.constraints.length; i++) {
						this.constraints[i].applyConstraint(this.searchParams);
					}
				}
				this._search(this.searchParams);
			},
			_search : function(params) {
				this.disableControls();
				this.searchStore.load({
					params : params
				});
				this.updatePermalink(params);
			},
			loadNextBatch : function() {
				this.searchParams.start += this.searchParams.limit;
				this._search(this.searchParams);
			},
			loadPrevBatch : function() {
				this.searchParams.start -= this.searchParams.limit;
				if (this.searchParams.start < 0) {
					this.searchParams.start = 0;
				}
				this._search(this.searchParams);
			},
			disableControls : function() {
				this.nextButton.setDisabled(true);
				this.prevButton.setDisabled(true);
				this.pagerLabel.setText(this.loadingText);
			},
			updateControls : function() {
				var total = this.searchStore.getTotalCount();
				if (this.searchParams.start > 0) {
					this.prevButton.setDisabled(false);
				} else {
					this.prevButton.setDisabled(true);
				}
				if (this.searchParams.start + this.searchParams.limit < total) {
					this.nextButton.setDisabled(false);
				} else {
					this.nextButton.setDisabled(true);
				}
				var minItem = this.searchParams.start + 1;
				var maxItem = minItem + this.searchParams.limit - 1;
				if (maxItem > total) {
					maxItem = total;
				}
				this.pagerLabel.setText(this.showingText + ' ' + minItem + '-'
						+ maxItem + ' ' + this.ofText + ' ' + total);
			},
			updatePermalink : function() {
				if (this.permalink) {
					this.permalink.href = Ext.urlAppend(this.permalinkURL, Ext
							.urlEncode(this.searchParams));
				}
			},
			updateQuery : function() {
				this.searchParams.q = this.queryInput.getValue();
				this.doSearch();
			},
			hookupSearchButtons : function(el) {
				var root = Ext.get(el);
				var buttons = root.query('.search-button');
				for ( var i = 0; i < buttons.length; i++) {
					var text = buttons[i].innerHTML || this.searchButtonText;
					Ext.get(buttons[i]).update('');
					var searchButton = new Ext.Button({
						text : text,
						renderTo : buttons[i]
					});
					searchButton.on('click', this.doSearch, this);
				}
			},
			doLayout : function() {
				var widgetHTML = '<div class="search-results">'
						+ '<div class="search-input"></div>'
						+ '<div class="search-table"></div>'
						+ '<div class="search-controls"></div>' + '</div>';
				var el = Ext.get(this.renderTo);
				el.update(widgetHTML);
				var input_el = el.query('.search-input')[0];
				var table_el = el.query('.search-table')[0];
				var controls_el = el.query('.search-controls')[0];
				var tpl = new Ext.Template('<p><b>' + this.mapAbstractLabelText
						+ ':</b> {abstract}</p>' + '<p><a href="/maps/{id}">'
						+ this.mapLinkLabelText + '</a></p>');
				var expander = new Ext.grid.RowExpander({
					tpl : tpl
				});
				expander.on("expand", function(expander, record, body, idx) {
					Ext.select("a", Ext.get(body)).on("click", function(evt) {
						evt.stopPropagation();
					});
				});
				tableCfg = {
					store : this.searchStore,
					plugins : [ expander ],
					autoExpandColumn : 'title',
					viewConfig : {
						autoFill : true,
						forceFit : true,
						emptyText : this.noResultsText,
						listeners : {
							refresh : function(view) {
								Ext.select("a", Ext.get(view.mainBody)).on(
										"click", function(evt) {
											evt.stopPropagation();
										});
							},
							rowsinserted : function(view, start, end) {
								for ( var i = start; i < end; i++) {
									Ext.select("a", Ext.get(view.getRow(i)))
											.on("click", function(evt) {
												evt.stopPropagation();
											});
								}
							},
							rowupdated : function(view, idx, record) {
								Ext.select("a", Ext.get(view.getRow(idx))).on(
										"click", function(evt) {
											evt.stopPropagation();
										});
							}
						}
					},
					autoHeight : true,
					renderTo : table_el
				};
				tableCfg.listeners = {
					"rowdblclick" : function(grid, rowIndex, evt) {
						var rec = grid.store.getAt(rowIndex);
						if (rec != null) {
							location.href = rec.get('detail');
						}
					},
					"rowclick" : function(grid, rowIndex, evt) {
						expander.toggleRow(rowIndex);
					},
					"beforerender" : function(grid) {
						grid.on('render', function() {
							grid.getView().mainBody.un('mousedown',
									expander.onMouseDown, expander);
						})
					}
				};
				var columns = [
						expander,
						{
							header : this.titleHeaderText,
							dataIndex : 'title',
							id : 'title',
							renderer : function(value, metaData, record,
									rowIndex, colIndex, store) {
								var detail = record.get('detail');
								if (detail) {
									return '<a href="' + detail + '">' + value
											+ '</a>';
								} else {
									return value;
								}
							}
						},
						{
							header : this.contactHeaderText,
							dataIndex : 'owner',
							id : 'owner',
							renderer : function(value, metaData, record,
									rowIndex, colIndex, store) {
								var detail = record.get('owner_detail');
								if (detail) {
									return '<a href="' + detail + '">' + value
											+ '</a>';
								} else {
									return value;
								}
							}
						},
						{
							header : this.lastModifiedHeaderText,
							dataIndex : 'last_modified',
							id : 'last_modified',
							renderer : function(value, metaData, record,
									rowIndex, colIndex, store) {
								dt = Date.parseDate(value, 'c');
								return dt.format("F j, Y");
							}
						} ];
				var colModel = new Ext.grid.ColumnModel({
					defaults : {
						menuDisabled : true,
						sortable : true
					},
					columns : columns
				});
				tableCfg.colModel = colModel;
				this.table = new Ext.grid.GridPanel(tableCfg);
				this.queryInput = new Ext.form.TextField({
					fieldLabel : this.searchLabelText,
					name : 'search',
					allowBlank : true,
					width : 350
				});
				this.queryInput.on('specialkey', function(field, e) {
					if (e.getKey() == e.ENTER) {
						this.updateQuery();
					}
				}, this);
				var searchButton = new Ext.Button({
					text : this.searchButtonText
				});
				searchButton.on('click', this.updateQuery, this)
				var searchForm = new Ext.Panel({
					frame : false,
					border : false,
					layout : new Ext.layout.HBoxLayout({
						defaultMargins : {
							top : 10,
							bottom : 10,
							left : 0,
							right : 10
						}
					}),
					items : [ this.queryInput, searchButton ]
				});
				searchForm.render(input_el);
				this.prevButton = new Ext.Button({
					text : this.previousText
				});
				this.prevButton.on('click', this.loadPrevBatch, this);
				this.nextButton = new Ext.Button({
					text : this.nextText
				});
				this.nextButton.on('click', this.loadNextBatch, this);
				this.pagerLabel = new Ext.form.Label({
					text : ""
				});
				var controls = new Ext.Panel(
						{
							frame : false,
							border : false,
							layout : new Ext.layout.HBoxLayout({
								defaultMargins : {
									top : 10,
									bottom : 10,
									left : 0,
									right : 10
								}
							}),
							items : [ this.prevButton, this.nextButton,
									this.pagerLabel ]
						});
				controls.render(controls_el);
				this.permalink = Ext.query('a.permalink')[0];
				this.disableControls();
				if (this.searchParams.q) {
					this.queryInput.setValue(this.searchParams.q);
				}
				this.updatePermalink();
			}
		});
Ext.namespace("GeoNode");
GeoNode.UserSelector = Ext
		.extend(
				Ext.util.Observable,
				{
					constructor : function(config) {
						Ext.apply(this, config);
						this.initUserStore();
						this.panel = this.doLayout();
					},
					initUserStore : function() {
						if (!this.userstore) {
							var cfg = {
								proxy : new Ext.data.HttpProxy({
									url : this.userLookup,
									method : 'POST'
								}),
								reader : new Ext.data.JsonReader({
									root : 'users',
									totalProperty : 'count',
									fields : [ {
										name : 'username'
									} ]
								})
							};
							Ext.apply(cfg, this.availableUserConfig || {});
							this.userstore = new Ext.data.Store(cfg);
							this.userstore.load({
								params : {
									query : ''
								}
							});
						}
						if (!this.store) {
							this.store = new Ext.data.ArrayStore({
								idIndex : 0,
								fields : [ 'username' ],
								data : []
							});
						}
					},
					doLayout : function() {
						var owner = this.owner;
						var plugin = (function() {
							var view;
							function init(v) {
								view = v;
								view.on('render', addHooks);
							}
							function addHooks() {
								view.getEl().on('mousedown', removeItem, this,
										{
											delegate : 'button'
										});
							}
							function removeItem(e, target) {
								var item = view.findItemFromChild(target);
								var idx = view.indexOf(item);
								var rec = view.store.getAt(idx);
								if (rec.get("username") !== owner) {
									view.store.removeAt(view.indexOf(item));
								}
							}
							return {
								init : init
							};
						})();
						this.selectedUsers = new Ext.DataView(
								{
									store : this.store,
									itemSelector : 'div.user_item',
									tpl : new Ext.XTemplate(
											'<div><tpl for="."> <div class="x-btn user_item"><button class="icon-removeuser remove-button">&nbsp;</button>{username}</div></tpl></div>'),
									plugins : [ plugin ],
									autoHeight : true,
									multiSelect : true
								});
						function addSelectedUser() {
							var value = this.availableUsers.getValue();
							var index = this.availableUsers.store.findExact(
									'username', value);
							if (index != -1
									&& this.selectedUsers.store.findExact(
											'username', value) == -1) {
								this.selectedUsers.store
										.add([ this.availableUsers.store
												.getAt(index) ]);
								this.availableUsers.reset();
							}
						}
						this.addButton = new Ext.Button({
							iconCls : 'icon-adduser',
							handler : addSelectedUser,
							scope : this
						});
						this.availableUsers = new Ext.form.ComboBox({
							width : 180,
							store : this.userstore,
							typeAhead : true,
							minChars : 0,
							align : 'right',
							border : 'false',
							displayField : 'username',
							emptyText : gettext("Add user..."),
							listeners : {
								scope : this,
								select : addSelectedUser
							}
						});
						return new Ext.Panel({
							border : false,
							renderTo : this.renderTo,
							items : [ this.selectedUsers, {
								layout : 'hbox',
								border : false,
								items : [ this.addButton, this.availableUsers ]
							} ]
						});
					},
					setDisabled : function(disabled) {
						this.selectedUsers.setDisabled(disabled);
						this.availableUsers.setDisabled(disabled);
						this.addButton.setDisabled(disabled);
					}
				});
Ext.namespace("GeoNode");
GeoNode.PermissionsEditor = Ext
		.extend(
				Ext.util.Observable,
				{
					viewMode : 'EDITORS',
					editMode : 'LIST',
					editors : null,
					editorChooser : null,
					managers : null,
					managerChooser : null,
					levels : {
						'admin' : 'layer_admin',
						'readwrite' : 'layer_readwrite',
						'readonly' : 'layer_readonly',
						'none' : '_none'
					},
					constructor : function(config) {
						Ext.apply(this, config);
						this.addEvents({
							'updated' : true
						});
						GeoNode.PermissionsEditor.superclass.constructor.call(
								this, config);
						this.initStores();
						this.readPermissions(config.permissions);
						this.doLayout();
					},
					initStores : function(config) {
						var notifyOfUpdate = (function(t) {
							return function() {
								return t.fireEvent("updated", t);
							}
						})(this);
						this.editors = new Ext.data.Store({
							reader : new Ext.data.JsonReader({
								root : 'users',
								totalProperty : 'count',
								fields : [ {
									name : 'username'
								} ]
							}),
							listeners : {
								add : notifyOfUpdate,
								remove : notifyOfUpdate,
								update : notifyOfUpdate
							}
						});
						this.managers = new Ext.data.Store({
							reader : new Ext.data.JsonReader({
								root : 'users',
								totalProperty : 'count',
								fields : [ {
									name : 'username'
								} ]
							}),
							listeners : {
								add : notifyOfUpdate,
								remove : notifyOfUpdate,
								update : notifyOfUpdate
							}
						});
					},
					buildUserChooser : function(cfg) {
						var finalConfig = {
							owner : this.permissions.owner,
							userLookup : this.userLookup
						};
						Ext.apply(finalConfig, cfg);
						return new GeoNode.UserSelector(finalConfig);
					},
					buildViewPermissionChooser : function() {
						return new Ext.Panel(
								{
									border : false,
									items : [
											{
												html : "<strong>"
														+ gettext("Who can view and download this data?")
														+ "</strong>",
												flex : 1,
												border : false
											},
											{
												xtype : 'radiogroup',
												columns : 1,
												value : this.viewMode,
												items : [
														{
															xtype : 'radio',
															name : 'viewmode',
															inputValue : 'ANYONE',
															boxLabel : gettext('Anyone')
														},
														{
															xtype : 'radio',
															name : 'viewmode',
															inputValue : 'REGISTERED',
															boxLabel : gettext('Any registered user')
														},
														{
															xtype : 'radio',
															name : 'viewmode',
															inputValue : 'EDITORS',
															boxLabel : gettext('Only users who can edit')
														} ],
												listeners : {
													change : function(grp,
															checked) {
														this.viewMode = checked.inputValue;
														this
																.fireEvent(
																		"updated",
																		this);
													},
													scope : this
												}
											} ]
								});
					},
					buildEditPermissionChooser : function() {
						this.editorChooser = this
								.buildUserChooser({
									store : this.editors,
									availableUserConfig : {
										listeners : {
											load : function(store, recs, opts) {
												store
														.filterBy(
																function(rec) {
																	return this.editors
																			.findExact(
																					"username",
																					rec
																							.get("username")) == -1
																			&& this.managers
																					.findExact(
																							"username",
																							rec
																									.get("username")) == -1;
																}, this);
											},
											scope : this
										}
									}
								});
						this.editorChooser
								.setDisabled(this.editMode !== 'LIST');
						return new Ext.Panel(
								{
									border : false,
									items : [
											{
												html : "<strong>"
														+ gettext('Who can edit this data?')
														+ "</strong>",
												flex : 1,
												border : false
											},
											{
												xtype : 'radiogroup',
												columns : 1,
												value : this.editMode,
												items : [
														{
															xtype : 'radio',
															name : 'editmode',
															inputValue : 'REGISTERED',
															boxLabel : gettext('Any registered user')
														},
														{
															xtype : 'radio',
															name : 'editmode',
															inputValue : 'LIST',
															boxLabel : gettext('Only the following users or groups:')
														} ],
												listeners : {
													change : function(grp,
															checked) {
														this.editMode = checked.inputValue;
														this.editorChooser
																.setDisabled(this.editMode !== 'LIST');
														this
																.fireEvent(
																		"updated",
																		this);
													},
													scope : this
												}
											}, this.editorChooser.panel ]
								});
					},
					buildManagePermissionChooser : function() {
						this.managerChooser = this
								.buildUserChooser({
									store : this.managers,
									availableUserConfig : {
										listeners : {
											load : function(store, recs, opts) {
												store
														.filterBy(
																function(rec) {
																	return this.editors
																			.findExact(
																					"username",
																					rec
																							.get("username")) == -1
																			&& this.managers
																					.findExact(
																							"username",
																							rec
																									.get("username")) == -1;
																}, this);
											},
											scope : this
										}
									}
								});
						return new Ext.Panel(
								{
									border : false,
									items : [
											{
												html : "<strong>"
														+ gettext('Who can manage and edit this data?')
														+ "</strong>",
												flex : 1,
												border : false
											}, this.managerChooser.panel ]
								});
					},
					readPermissions : function(json) {
						this.editors.suspendEvents();
						this.managers.suspendEvents();
						if (json['authenticated'] == this.levels['readwrite']) {
							this.editMode = 'REGISTERED';
						} else if (json['authenticated'] == this.levels['readonly']) {
							this.viewMode = 'REGISTERED';
						}
						if (json['anonymous'] == this.levels['readonly']) {
							this.viewMode = 'ANYONE';
						}
						for ( var i = 0; i < json.users.length; i++) {
							if (json.users[i][1] === this.levels['readwrite']) {
								this.editors.add(new this.editors.recordType({
									username : json.users[i][0]
								}, i + 500));
							} else if (json.users[i][1] === this.levels['admin']) {
								this.managers.add(new this.managers.recordType(
										{
											username : json.users[i][0]
										}, i + 500));
							}
						}
						this.editors.resumeEvents();
						this.managers.resumeEvents();
					},
					writePermissions : function() {
						var anonymousPermissions, authenticatedPermissions, perUserPermissions;
						if (this.viewMode === 'ANYONE') {
							anonymousPermissions = this.levels['readonly'];
						} else {
							anonymousPermissions = this.levels['_none'];
						}
						if (this.editMode === 'REGISTERED') {
							authenticatedPermissions = this.levels['readwrite'];
						} else if (this.viewMode === 'REGISTERED') {
							authenticatedPermissions = this.levels['readonly'];
						} else {
							authenticatedPermissions = this.levels['_none'];
						}
						perUserPermissions = [];
						if (this.editMode === 'LIST') {
							this.editors.each(function(rec) {
								perUserPermissions.push([ rec.get("username"),
										this.levels['readwrite'] ]);
							}, this);
						}
						this.managers.each(function(rec) {
							perUserPermissions.push([ rec.get("username"),
									this.levels['admin'] ]);
						}, this);
						return {
							anonymous : anonymousPermissions,
							authenticated : authenticatedPermissions,
							users : perUserPermissions
						};
					},
					doLayout : function() {
						this.container = new Ext.Panel({
							renderTo : this.renderTo,
							border : false,
							items : [ this.buildViewPermissionChooser(),
									this.buildEditPermissionChooser(),
									this.buildManagePermissionChooser() ]
						});
					}
				});
Lang = {
	registerLinks : function() {
		var languages = {
			'#spanish' : 'es',
			'#english' : 'en'
		};
		for ( var id in languages) {
			var domNode = Ext.DomQuery.selectNode(id);
			if (domNode) {
				domNode.onclick = (function(langcode) {
					return function() {
						(new Ext.state.CookieProvider).set("locale", langcode);
						window.location.reload();
						return false;
					};
				})(languages[id]);
			}
		}
	}
};
Ext.onReady(Lang.registerLinks);
Ext.namespace("GeoNode");
GeoNode.DataCartStore = Ext.extend(Ext.data.Store, {
	constructor : function(config) {
		this.selModel = config.selModel;
		this.reselecting = false;
		this.selModel.on('rowselect', function(model, index, record) {
			if (this.reselecting == true) {
				return;
			}
			if (this.indexOfId(record.id) == -1) {
				this.add([ record ]);
			}
		}, this);
		this.selModel.on('rowdeselect', function(model, index, record) {
			if (this.reselecting == true) {
				return;
			}
			var index = this.indexOfId(record.id)
			if (index != -1) {
				this.removeAt(index);
			}
		}, this);
		GeoNode.DataCartStore.superclass.constructor.call(this, config);
	},
	reselect : function() {
		this.reselecting = true;
		this.selModel.clearSelections();
		var store = this.selModel.grid.store;
		this.each(function(rec) {
			var index = store.indexOfId(rec.id);
			if (index != -1) {
				this.selModel.selectRow(index, true);
			}
			return true;
		}, this);
		this.reselecting = false;
	}
});
Ext.namespace("GeoNode");
GeoNode.SearchTableRowExpander = Ext
		.extend(Ext.grid.RowExpander,
				{
					errorText : 'UT: Unable to fetch layer details.',
					loadingText : 'UT: Loading...',
					constructor : function(config) {
						this.fetchURL = config.fetchURL;
						GeoNode.SearchTableRowExpander.superclass.constructor
								.call(this, config);
					},
					getRowClass : function(record, rowIndex, p, ds) {
						p.cols = p.cols - 1;
						return this.state[record.id] ? 'x-grid3-row-expanded'
								: 'x-grid3-row-collapsed';
					},
					fetchBodyContent : function(body, record, index) {
						if (!this.enableCaching) {
							this._fetchBodyContent(body, record, index);
						}
						var content = this.bodyContent[record.id];
						if (!content) {
							this._fetchBodyContent(body, record, index);
						} else {
							body.innerHTML = content;
						}
					},
					_fetchBodyContent : function(body, record, index) {
						body.innerHTML = this.loadingText;
						var template_url = this.fetchURL + '?uuid='
								+ record.get('uuid');
						var this_expander = this;
						Ext.Ajax.request({
							url : template_url,
							method : "GET",
							success : function(result) {
								var content = result.responseText;
								body.innerHTML = content;
								this_expander.bodyContent[record.id] = content;
							},
							failure : function(result) {
								body.innerHTML = this_expander.errorText;
							}
						});
					},
					beforeExpand : function(record, body, rowIndex) {
						if (this.fireEvent('beforeexpand', this, record, body,
								rowIndex) !== false) {
							this.fetchBodyContent(body, record, rowIndex);
							return true;
						} else {
							return false;
						}
					}
				});
Ext.namespace("GeoNode");
GeoNode.DataCart = Ext.extend(Ext.util.Observable, {
	selectedLayersText : 'UT: Selected Layers',
	emptySelectionText : 'UT: No Layers Selected',
	titleText : 'UT: Title',
	clearSelectedButtonText : 'UT: Clear Selected',
	clearAllButtonText : 'UT: Clear All',
	constructor : function(config) {
		Ext.apply(this, config);
		this.doLayout();
	},
	getSelectedLayerIds : function() {
		var layerIds = [];
		this.grid.selModel.each(function(rec) {
			layerIds.push(rec.get('name'));
		});
		return layerIds;
	},
	doLayout : function() {
		var widgetHTML = '<div class="selection-table"></div>'
				+ '<div class="selection-controls"></div>'
				+ '<div class="selection-ops></div>"';
		var el = Ext.get(this.renderTo);
		el.update(widgetHTML);
		var controls_el = el.query('.selection-controls')[0];
		var table_el = el.query('.selection-table')[0];
		var ops_el = el.query('.selection-ops')[0];
		sm = new Ext.grid.CheckboxSelectionModel({});
		this.grid = new Ext.grid.GridPanel({
			store : this.store,
			viewConfig : {
				autoFill : true,
				forceFit : true,
				emptyText : this.emptySelectionText,
				deferEmptyText : false
			},
			height : 150,
			renderTo : table_el,
			selModel : sm,
			hideHeaders : true,
			colModel : new Ext.grid.ColumnModel({
				defaults : {
					sortable : false,
					menuDisabled : true
				},
				columns : [ sm, {
					dataIndex : 'title'
				} ]
			})
		});
		this.store.on('add', function(store, records, index) {
			sm.selectRow(index, true);
		})
		var clearSelectedButton = new Ext.Button({
			text : this.clearSelectedButtonText
		});
		clearSelectedButton.on('click', function() {
			sm.each(function(rec) {
				var index = this.store.indexOfId(rec.id);
				if (index >= 0) {
					this.store.removeAt(index);
				}
			}, this);
			this.store.reselect();
		}, this);
		var clearAllButton = new Ext.Button({
			text : this.clearAllButtonText
		});
		clearAllButton.on('click', function() {
			this.store.removeAll();
			this.store.reselect();
		}, this);
		var controlsForm = new Ext.Panel({
			frame : false,
			border : false,
			layout : new Ext.layout.HBoxLayout({
				defaultMargins : {
					top : 10,
					bottom : 10,
					left : 0,
					right : 0
				}
			}),
			items : [ clearSelectedButton, clearAllButton ]
		});
		controlsForm.render(controls_el);
	}
});
Ext.namespace("GeoNode");
GeoNode.BatchDownloadWidget = Ext.extend(Ext.util.Observable, {
	downloadingText : 'UT: Downloading...',
	cancelText : 'UT: Cancel',
	windowMessageText : 'UT: Please wait',
	constructor : function(config) {
		Ext.apply(this, config);
		this.beginDownload();
	},
	beginDownload : function() {
		var this_widget = this;
		Ext.Ajax.request({
			url : this.begin_download_url,
			method : 'POST',
			params : {
				layer : this.layers,
				format : this.format
			},
			success : function(result) {
				var result = Ext.util.JSON.decode(result.responseText);
				this_widget.monitorDownload(result.id);
			}
		});
	},
	monitorDownload : function(download_id) {
		var checkStatus;
		var this_widget = this;
		var pb = new Ext.ProgressBar({
			text : this.downloadingText
		});
		var cancel_download = function() {
			Ext.Ajax.request({
				url : this_widget.stop_download_url + download_id,
				method : "GET",
				success : function(result) {
					clearInterval(checkStatus);
				},
				failure : function(result) {
					clearInterval(checkStatus);
				}
			})
		};
		var win = new Ext.Window({
			width : 250,
			height : 100,
			plain : true,
			modal : true,
			closable : false,
			hideBorders : true,
			items : [ pb ],
			buttons : [ {
				text : this.cancelText,
				handler : function() {
					cancel_download();
					win.hide();
				}
			} ]
		});
		var update_progress = function() {
			Ext.Ajax.request({
				url : this_widget.begin_download_url + '?id=' + download_id,
				method : "GET",
				success : function(result) {
					var process = Ext.util.JSON.decode(result.responseText);
					if (process["process"]["status"] === "FINISHED") {
						clearInterval(checkStatus);
						pb.updateProgress(1, "Done....", true);
						win.close();
						location.href = this_widget.download_url + download_id;
					} else {
						pb.updateProgress(process["process"]["progress"] / 100,
								this_widget.downloadingText, true);
					}
				},
				failure : function(result) {
					clearInterval(checkStatus);
					win.close();
				}
			});
		};
		checkStatus = setInterval(update_progress, 1000);
		win.show();
	}
});
Ext.namespace("GeoNode");
GeoNode.DataCartOps = Ext.extend(Ext.util.Observable, {
	failureText : 'UT: Operation Failed',
	noLayersText : 'UT: No layers are currently selected.',
	constructor : function(config) {
		Ext.apply(this, config);
		this.doLayout();
	},
	doLayout : function() {
		var el = Ext.get(this.renderTo);
		var createMapLink = Ext.get(el.query('a.create-map')[0]);
		this.createMapForm = Ext.get(el.query('#create_map_form')[0]);
		createMapLink.on('click', function(evt) {
			evt.preventDefault();
			var layers = this.cart.getSelectedLayerIds();
			if (layers && layers.length) {
				this.createNewMap(layers);
			} else {
				Ext.MessageBox.alert(this.failureText, this.noLayersText);
			}
		}, this);
		batch_links = el.query('a.batch-download');
		for ( var i = 0; i < batch_links.length; i++) {
			var bel = Ext.get(batch_links[i]);
			bel.on('click', function(e, t, o) {
				e.preventDefault();
				var layers = this.cart.getSelectedLayerIds();
				if (layers && layers.length) {
					var format = Ext.get(t).getAttribute('href').substr(1);
					this.batchDownload(layers, format);
				} else {
					Ext.MessageBox.alert(this.failureText, this.noLayersText);
				}
			}, this);
		}
	},
	createNewMap : function(layerIds) {
		var inputs = [];
		for ( var i = 0; i < layerIds.length; i++) {
			inputs.push({
				tag : 'input',
				type : 'hidden',
				name : 'layer',
				value : layerIds[i]
			});
		}
		inputs.push({
			tag : 'input',
			type : 'hidden',
			name : 'csrfmiddlewaretoken',
			value : Ext.util.Cookies.get("csrftoken")
		});
		Ext.DomHelper.overwrite(this.createMapForm, {
			'tag' : 'div',
			cn : inputs
		});
		this.createMapForm.dom.submit();
	},
	batchDownload : function(layerIds, format) {
		new GeoNode.BatchDownloadWidget({
			layers : layerIds,
			format : format,
			begin_download_url : this.begin_download_url,
			stop_download_url : this.stop_download_url,
			download_url : this.download_url
		});
	}
});
Ext.namespace("GeoNode");
GeoNode.BoundingBoxWidget = Ext.extend(Ext.util.Observable, {
	viewerConfig : null,
	constructor : function(config) {
		Ext.apply(this, config);
		this.doLayout();
	},
	doLayout : function() {
		var el = Ext.get(this.renderTo);
		var viewerConfig = {
			proxy : this.proxy,
			useCapabilities : false,
			useBackgroundCapabilities : false,
			useToolbar : false,
			useMapOverlay : false,
			portalConfig : {
				collapsed : true,
				border : false,
				height : 300,
				renderTo : el.query('.bbox-expand')[0]
			},
			listeners : {
				"ready" : function() {
					this._ready = true;
				},
				scope : this
			}
		}
		viewerConfig = Ext.apply(viewerConfig, this.viewerConfig)
		this.viewer = new GeoExplorer.Viewer(viewerConfig);
		this.enabledCB = el.query('.bbox-enabled input')[0];
		this.disable();
		Ext.get(this.enabledCB).on('click', function() {
			if (this.enabledCB.checked == true) {
				this.enable();
			} else {
				this.disable();
			}
		}, this);
	},
	isActive : function() {
		return this.enabledCB.checked == true;
	},
	hasConstraint : function() {
		return this.isActive()
	},
	applyConstraint : function(query) {
		if (this.hasConstraint()) {
			var bounds = this.viewer.mapPanel.map.getExtent();
			bounds.transform(new OpenLayers.Projection(
					this.viewerConfig.map.projection),
					new OpenLayers.Projection("EPSG:4326"));
			query.bbox = bounds.toBBOX();
		} else if (this._ready) {
			delete query.bbox;
		}
	},
	initFromQuery : function(grid, query) {
		if (query.bbox) {
			var bounds = OpenLayers.Bounds.fromString(query.bbox);
			if (bounds) {
				bounds.transform(new OpenLayers.Projection("EPSG:4326"),
						new OpenLayers.Projection(
								this.viewerConfig.map.projection));
				var setMapExtent = function() {
					var map = this.viewer.mapPanel.map;
					map.events.register("moveend", this, function() {
						map.events
								.unregister("moveend", this, arguments.callee);
						map.zoomToExtent(bounds, true);
					});
					this.enable();
				};
				if (this._ready) {
					setMapExtent.call(this);
				} else {
					this.viewer.on("ready", setMapExtent, this)
				}
			}
		}
	},
	enable : function() {
		this.enabledCB.checked = true;
		this.viewer.portal && this.viewer.portal.expand();
	},
	disable : function() {
		this.enabledCB.checked = false;
		this.viewer.portal && this.viewer.portal.collapse();
	}
});