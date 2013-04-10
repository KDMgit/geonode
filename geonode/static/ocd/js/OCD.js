Ext.namespace("OCD.plugins");

OCD.plugins.InfoPOIButton = Ext.extend(Ext.Button, {
	icon : "/static/ocd/img/select_poi.png",
	enableToggle : "true",
	tooltip : 'Dettagli POI',
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

Ext.ComponentMgr.registerType("ocd_getinfo", OCD.plugins.InfoPOIButton);

/**
 * La funzione che segue prima di essere invocata ha bisogno di essere
 * correttamente inizializzata. E' necessario infatti prima popolare
 * l'OCD.context come una mappa con i seguenti valori:
 * 
 * <b>app</b>: qui, non appena pronta, deve essere inserita l'app di
 * GeoExplorer. <b>getToolbar</b>: questa funzione deve restituire la toolbar
 * dove deve essere inserito il pulsate GetFeature. Riceve come input l'app
 * specificata nel context.
 */
Ext.namespace("OCD.context");
OCD.apply = function(config) {
	return Ext.apply(config, {
		listeners : {
			"portalready" : function() {
				/*
				 * After GeoExplorer has started apply our plugin to the toolbar
				 */
				OCD.plugToolbar(OCD.context.getToolbar(OCD.context.app));
			},
			"ready" : function() {
				/*
				 * After GeoExplorer has started apply our plugin to the layers
				 */
				OCD.plugLayers(OCD.context.app);
			},
			"layerselectionchange" : function() {
				OCD.plugLayers(OCD.context.app);
			}
		}
	});
}

// Start toolbar component
OCD.plugToolbar = function(toolbar) {
	toolbar.addButton(new OCD.plugins.InfoPOIButton());
	toolbar.doLayout();
};

// Starts layers controls
OCD.plugLayers = function(app) {
	var map = app.mapPanel.map;

	// Let's find WMS Layers
	var layers = [];
	map.layers.forEach(function(l) {
		// Check if l is instanceof OpenLayers.Layer.WMS
		if (l instanceof OpenLayers.Layer.WMS)
			// If it's true, add it to the queriable layers
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
					OCD.openPOI(id);
				}
			}
		}
	});

	// Let's do stuff!!!!!!
	OCD.openPOI = function(id) {
		location = "/poi/" + id + "/"
	};

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