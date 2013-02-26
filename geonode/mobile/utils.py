from django.contrib.contenttypes.models import ContentType

from geonode.layers.models import Layer, TopicCategory, TOPIC_CATEGORIES
from geonode.poi.models import Poi



""""Restituisce una tupla contenete 'id del content type, id dell'oggetto'

"""
def get_ct_obj_id(poi_id):
    poi_ct = ContentType.objects.all().filter(name='poi')[0]
    poi = Poi.objects.get(poi_id=poi_id)
    
    return poi_ct.pk, poi.pk



def get_user_bean(user):
    data = {}
    
    data['username'] = user.username
    data['id'] = user.pk
    
    return data


def get_category_bean(topic):
    data = {}
    
    data['id'] = topic.pk
    data['name'] = topic.name
    data['description'] = topic.description
    data['slug'] = topic.slug
    
    return data


def get_layer_bean(layer):
    data = {}
    
    data['id'] = layer.pk
    data['name'] = layer.name
    data['title'] = layer.title
    data['typename' ] = layer.typename
    data['abstract'] = layer.abstract
    
    return data