from django.db import models
from django.core.urlresolvers import reverse

from geonode.settings import GEOSERVER_BASE_URL

import requests
import simplejson

class Poi(models.Model):
    poi_id = models.CharField(max_length=300)
    __propertiesCache__ = None
    
    def properties(self):
        if self.__propertiesCache__ == None:
            p = {}
            p['featureid'] = self.poi_id
            p['outputformat'] = "json"
            p['request'] = "getFeature"
            
            url = GEOSERVER_BASE_URL + "wfs"
            
            r = requests.get(url, params=p)
            j = simplejson.loads(r.text)
            
            
            self.__propertiesCache__ = j['features'][0]['properties']
        
        return self.__propertiesCache__
    
    def get_absolute_url(self):
        return reverse('poi_detail', current_app='poi', args=[self.poi_id])
    
