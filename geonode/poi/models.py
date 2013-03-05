# -*- coding: utf-8 -*- 
from decimal import Decimal

from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.contenttypes.models import ContentType

from geonode.settings import GEOSERVER_BASE_URL
from geonode.settings import MAPQUEST_GETMAP_SERVICE

from dialogos.models import Comment

from agon_ratings.models import OverallRating
import agon_ratings.templatetags.agon_ratings_tags as get_rating

import requests
import simplejson
import urllib





""""Restituisce una tupla contenete 'id del content type, id dell'oggetto'

"""
def get_ct_obj_id(poi_id):
    print poi_id
    poi_ct = ContentType.objects.all().filter(name='poi')[0]
    poi = Poi.objects.get(poi_id=poi_id)
    
    return poi_ct.pk, poi.pk


def get_poi_comments(poi):
    poi_id = poi.poi_id
    
    # Prendiamo gli id numerici del tipo e del poi
    ct_id, obj_id = get_ct_obj_id(poi_id)
    
    return Comment.objects.all().filter(object_id=obj_id)


def get_poi_overall_rating(poi, category=None):
    '''
    Il codice di questo metodo è stato riadattato dal sorgente di agon-rating:
    https://github.com/eldarion/agon-ratings/blob/master/agon_ratings/templatetags/agon_ratings_tags.py
    
    Il metodo preso in considerazione è user_rating_value.
    '''
    
    try:
        poi_id = poi.poi_id
        
        # Prendiamo gli id numerici del tipo e del poi
        ct_id, obj_id = get_ct_obj_id(poi_id)
        
        # Prendiamo il poi
        obj = poi
    
        # Da qui segue per lo più il metodo originale di agon-rating.
        if category is None:
            rating = OverallRating.objects.filter(
                object_id=obj.pk,
                content_type=ct_id
            ).aggregate(r=models.Avg("rating"))["r"]
            rating = Decimal(str(rating or "0"))
        else:
            rating = OverallRating.objects.get(
                object_id=obj.pk,
                content_type=ct_id,
                category=category_value(obj, category)
            ).rating or 0
    except OverallRating.DoesNotExist:
        rating = 0
    
    return rating
    
    
    
    

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
    
    def latitude(self):
        return self.coordinates()[0]
    
    def longitude(self):
        return self.coordinates()[1]
    
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
        
        r = urllib.urlencode(p)
        
        return url + '?' + r
    
    def comments(self):
        return get_poi_comments(self)
    
    def rating(self, user=None, category=None):
        if user == None:
            return get_poi_overall_rating(self, category)
        else:
            return get_rating.user_rating_value(user, self, category)
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
