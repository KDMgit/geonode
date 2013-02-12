from django.db import models
from django.core.urlresolvers import reverse

from geonode.settings import GEOSERVER_BASE_URL
from geonode.settings import MAPQUEST_GETMAP_SERVICE

import requests
import simplejson

class Poi(models.Model):
    poi_id = models.CharField(max_length=300)
    
    def __init__(self, *args, **kwargs):
        super(Poi, self).__init__(*args, **kwargs)
        self.__cache = {}
    
    def data(self):
        if self.__cache.get('data') == None:
            p = {}
            p['featureid'] = self.poi_id
            p['outputformat'] = "json"
            p['request'] = "getFeature"
            
            url = GEOSERVER_BASE_URL + "wfs"
            
            r = requests.get(url, params=p)
            self.__cache['data'] = simplejson.loads(r.text)
        
        return self.__cache.get('data')
    
    def properties(self):
        return self.feature()['properties']
    
    def crs(self):
        return self.data()['crs']
    
    def feature(self):
        return self.data()['features'][0]
    
    def geometry(self):
        return self.feature()['geometry']
        
    def coordinates(self):
        return self.geometry()['coordinates']
    
    def get_absolute_url(self):
        return reverse('poi_detail', current_app='poi', args=[self.poi_id])
    
    def get_preview_url(self):
        url = MAPQUEST_GETMAP_SERVICE['url']
        
        x = self.coordinates()[0]
        y = self.coordinates()[1]
        coordinates = str(x)  + ',' + str(y)
        
        p = MAPQUEST_GETMAP_SERVICE['params']
        
        p['center'] = coordinates
        p['pois'] = 'blue_1,' + coordinates
        
        r = requests.get(url, params=p)
        
        return r.url
    
