from django.db import models
from geonode.settings import GEOSERVER_BASE_URL
import requests
import simplejson

class Poi(models.Model):
    poi_id = models.CharField(max_length=300)
    
    def properties(self):
        p = {}
        p['featureid'] = self.poi_id
        p['outputformat'] = "json"
        p['request'] = "getFeature"
        
        url = GEOSERVER_BASE_URL + "wfs"
        
        r = requests.get(url, params=p)
        j = simplejson.loads(r.text)
        
        
        properties = j['features'][0]['properties']
        
        return properties
