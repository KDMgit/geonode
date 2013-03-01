# -*- coding: utf-8 -*- 

from decimal import Decimal

from django.db import models
from django.shortcuts import get_object_or_404, render_to_response
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from django.views.decorators.http import require_POST

from django.http import HttpResponse
from django.template import RequestContext

import dialogos.views as dialogos
from dialogos.models import Comment

import agon_ratings.views as do_rating
import agon_ratings.templatetags.agon_ratings_tags as get_rating
from agon_ratings.models import Rating, OverallRating
from agon_ratings.categories import category_value

from geonode.layers.models import Layer, TopicCategory
from geonode.poi.models import Poi
from geonode.settings import GEOSERVER_BASE_URL

import geonode.mobile.utils as utils

import requests
import simplejson as json


@login_required
def poi_detail(request, poi_id):
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


'''Aggiunge un commento al poi

Vuole nalla chiamata POST:

    comment: il commento

'''
@login_required
def add_poi_comment(request, poi_id):
    # Prendiamo gli id numerici del tipo e del poi
    ct_id, obj_id = utils.get_ct_obj_id(poi_id)
    
    # Creiamo il commento
    return dialogos.post_comment(request, ct_id, obj_id)


def get_poi_comments(request, poi_id):
    # Prendiamo gli id numerici del tipo e del poi
    ct_id, obj_id = utils.get_ct_obj_id(poi_id)
    
    data = []
    
    comments = Comment.objects.all().filter(object_id=obj_id)
    for c in comments:
        comment = {}
        comment['id'] = c.id
        comment['author'] = utils.get_user_bean(c.author)
        comment['comment'] = c.comment
        
        data.append(comment)
    
    return HttpResponse(json.dumps(data), content_type="application/json")
    
    
def login(request):
    try:
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
    except Exception:
        return HttpResponse(status=500)
    

@login_required
def logout(request):
    auth_logout(request)
    return HttpResponse(status=200)
        
    
def get_categories(request):
    data = []
    for x in TopicCategory.objects.all():
        b = utils.get_category_bean(x)
        data.append(b)
        
    return HttpResponse(json.dumps(data), content_type="application/json")


def get_layers(request, category_slug):
    category = get_object_or_404(TopicCategory, slug=category_slug)
    layers = category.layer_set
    
    data = []
    for l in layers.all():
        b = utils.get_layer_bean(l)
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
    
    return HttpResponse(json.dumps(j), content_type="application/json")

        
def get_poi_user_rating(request, poi_id, category=None):
    poi = Poi.objects.get(poi_id=poi_id)
    rating = get_rating.user_rating_value(request.user, poi, category)
    
    return HttpResponse(rating)


def get_poi_overall_rating(request, poi_id, category=None):
    '''
    Il codice di questo metodo è stato riadattato dal sorgente di agon-rating:
    https://github.com/eldarion/agon-ratings/blob/master/agon_ratings/templatetags/agon_ratings_tags.py
    
    Il metodo preso in considerazione è user_rating_value.
    '''
    
    try:
        # Prendiamo gli id numerici del tipo e del poi
        ct_id, obj_id = utils.get_ct_obj_id(poi_id)
        
        # Prendiamo il poi
        obj = Poi.objects.get(poi_id=poi_id)
    
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
    
    return HttpResponse(rating)
        

'''Fa il rating di un poi

Vuole una chiamata POST che contenga i campi:
    
    rating: un valore numerico 1-5
    category: una categoria ('poi' per ora)

'''  
@require_POST
@login_required
def set_poi_rating(request, poi_id):
    ct_id, obj_id = utils.get_ct_obj_id(poi_id)
    return do_rating.user_rating_value(ct_id, obj_id)
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
