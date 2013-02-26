# -*- coding: utf-8 -*- 

from django.shortcuts import get_object_or_404, render_to_response
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType

from django.http import HttpResponse
from django.template import RequestContext

import dialogos.views as dialogos
from dialogos.models import Comment

from geonode.layers.models import Layer, TopicCategory, TOPIC_CATEGORIES
from geonode.poi.models import Poi
from geonode.settings import GEOSERVER_BASE_URL

import requests
import simplejson as json

""""Restituisce una tupla contenete 'id del content type, id dell'oggetto'

"""
def __get_ct_obj_id(poi_id):
    poi_ct = ContentType.objects.all().filter(name='poi')[0]
    poi = Poi.objects.get(poi_id=poi_id)
    
    return poi_ct.pk, poi.pk


def __get_user_bean(user):
    data = {}
    
    data['username'] = user.username
    data['id'] = user.pk
    
    return data


def __get_category_bean(topic):
    data = {}
    
    data['id'] = topic.pk
    data['name'] = topic.name
    data['description'] = topic.description
    data['slug'] = topic.slug
    
    return data

def __get_layer_bean(layer):
    data = {}
    
    data['id'] = layer.pk
    data['name'] = layer.name
    data['title'] = layer.title
    data['typename' ] = layer.typename
    data['abstract'] = layer.abstract
    
    return data


@login_required
def poi_json_detail(request, poi_id):
    try:
        p = Poi.objects.get(poi_id=poi_id)
    except Poi.DoesNotExist:
        p = Poi(poi_id=poi_id)
        p.save()
        
    data = {}
    data['get_preview_url'] = p.get_preview_url()
    data['coordinates'] = p.coordinates()
    data['properties'] = p.properties()
        
    return HttpResponse(json.dumps(data), content_type="application/json")


@login_required
def add_poi_comment(request, poi_id):
    # Prendiamo gli id numerici del tipo e del poi
    ct_id, obj_id = __get_ct_obj_id(poi_id)
    
    # Creiamo il commento
    return dialogos.post_comment(request, ct_id, obj_id)


def get_poi_comments(request, poi_id):
    # Prendiamo gli id numerici del tipo e del poi
    ct_id, obj_id = __get_ct_obj_id(poi_id)
    
    data = []
    
    comments = Comment.objects.all().filter(object_id=obj_id)
    for c in comments:
        comment = {}
        comment['id'] = c.id
        comment['author'] = __get_user_bean(c.author)
        comment['comment'] = c.comment
        
        data.append(comment)
    
    return HttpResponse(json.dumps(data), content_type="application/json")
    
    
def login(request):
    username = request.REQUEST['username']
    password = request.REQUEST['password']
    
    # Controlliamo l'autenticazione
    user = authenticate(username=username, password=password)
    
    if user is not None:
        if user.is_active:
            # Facciamo la login
            auth_login(request, user)
            return HttpResponse(status=200)
        else:
            # Se l'account non è attivo restituiamo 500
            return HttpResponse(status=500)
    else:
        # Se i dati non sono corretti restituiamo 500
        return HttpResponse(status=500)
    

@login_required
def logout(request):
    auth_logout(request)
    return HttpResponse(status=200)
        
    
def get_categories(request):
    data = []
    for x in TopicCategory.objects.all():
        b = __get_category_bean(x)
        data.append(b)
        
    return HttpResponse(json.dumps(data), content_type="application/json")


def get_layers(request, category_slug):
    category = get_object_or_404(TopicCategory, slug=category_slug)
    layers = category.layer_set
    
    data = []
    for l in layers.all():
        b = __get_layer_bean(l)
        data.append(b)
    
    return HttpResponse(json.dumps(data), content_type="application/json")

    
def search(request, layer, bbox):
    
    url = GEOSERVER_BASE_URL + 'wfs'
    
    params = {}
    params['request'] = 'getFeature'
    params['outputFormat'] = 'json'
    params['bbox'] = bbox
    params['typeName'] = layer
    
    r = requests.get(url, params=params)
    j = json.loads(r.text)
    
    # Cancelliamo i dati che non ci servono
    j.pop('type', None)
    j.pop('crs', None)
    
    for f in j['features']:
        f.pop('geometry', None)
        f.pop('type', None)
        f.pop('geometry_name', None)
    
    return HttpResponse(json.dumps(j))
        
        
        
        
        
        
        
        
