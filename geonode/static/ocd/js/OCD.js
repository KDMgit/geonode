Ext.namespace("OCD.plugins");

OCD.plugins.InfoPOIButton = Ext.extend(Ext.Button, {
	text : "Get ID",
	enableToggle : "true",
	listeners : {
		toggle : function(self, pressed) {
			if (pressed) {
				app.ocd.controls.selectFeature.activate();
			} else {
				app.ocd.controls.selectFeature.deactivate();
			}
		},
	},
});

// Start toolbar component
OCD.plugToolbar = function(app) {
	app.toolbar.addButton(new OCD.plugins.InfoPOIButton());
	app.toolbar.doLayout();
};

// Starts layers controls
OCD.plugLayers = function(app) {
	var map = app.mapPanel.map;

	// Let's find WMS Layers
	var layers = [];
	map.layers.forEach(function(l) {
		// Check if l is instanceof OpenLayers.Layer.WMS
		if (l instanceof OpenLayers.Layer.WMS)
			// If it's so, add it to the queriable layers
			layers.push(l)
	})

	select = new OpenLayers.Control.WMSGetFeatureInfo({
		layers : layers,
		output : "object",
		eventListeners : {
			getfeatureinfo : function(event) {
				/* The event sucks, so we have to look for the ID inside HTML */
				var table = null;

				// Let's find the table
				$(event.text).each(function(index) {
					if ($(this).is('table')) {
						table = this;
					}
				});

				// The table may contain more than one POI, so let's get the
				// first one only
				var id = $(table).find('td').first().text();

				// If there is an ID, let's do stuff...
				if (id != null && id != "") {
					alert(id);
				}
			}
		}
	});

	// Let's add the control
	map.addControl(select);

	// Save the control somewhere easily accessable
	Ext.apply(app, {
		ocd : {
			controls : {
				selectFeature : select
			}
		}
	});
};