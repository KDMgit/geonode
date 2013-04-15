# -*- coding: utf-8 -*- 

from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST

from django.http import HttpResponse

import dialogos.views as dialogos

import agon_ratings.views as do_rating

from geonode.layers.models import TopicCategory
from geonode.poi.models import Poi, get_ct_obj_id
from geonode.settings import GEOSERVER_BASE_URL

import geonode.mobile.utils as utils

import requests
import simplejson as json
import ipdb
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        super(DecimalEncoder, self).default(o)



@login_required
def poi_detail(request, poi_id, comments=False):
    try:
        p = Poi.objects.get(poi_id=poi_id)
    except Poi.DoesNotExist:
        p = Poi(poi_id=poi_id)
        p.save()
        
    data = {}
    
    data['id'] = poi_id
    data['get_preview_url'] = p.get_preview_url()
    data['coordinates'] = p.coordinates()
    data['properties'] = p.properties()
    
    if comments:
        data['comments'] = utils.get_comments_bean_list(p)
        
    data['rating'] = {
                      'user' : p.rating(user=request.user, category='poi'),
                      'overall' : p.rating()
                      }
        
    return HttpResponse(json.dumps(data, cls=DecimalEncoder), content_type="application/json")


'''Aggiunge un commento al poi

Vuole nalla chiamata POST:

    comment: il commento

'''
@login_required
def add_poi_comment(request, poi_id):
    # Prendiamo gli id numerici del tipo e del poi
    ct_id, obj_id = get_ct_obj_id(poi_id)
    
    # Creiamo il commento
    ret = dialogos.post_comment(request, ct_id, obj_id)
    
    # Non è ben chiaro perché restituisca errore 302
    # anche quando l'inserimento è andato a buon fine
    if ret.status_code == 302:
        ret.status_code = 200
    
    return ret


def get_poi_comments(request, poi_id):
    poi = Poi.objects.get(poi_id=poi_id)
    
    data = utils.get_comments_bean_list(poi)
    
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

        
def get_poi_user_rating(request, poi_id, category='poi'):
    poi = Poi.objects.get(poi_id=poi_id)
    rating = poi.rating(user=request.user, category=category)
    
    return HttpResponse(rating)


def get_poi_overall_rating(request, poi_id, category=None):
    poi = Poi.objects.get(poi_id=poi_id)
    rating = poi.rating(category=category)
    
    return HttpResponse(rating)
        

'''Fa il rating di un poi

Vuole una chiamata POST che contenga i campi:
    
    rating: un valore numerico 1-5
    category: una categoria ('poi' per ora)

'''  
@require_POST
@login_required
def set_poi_rating(request, poi_id):
    ct_id, obj_id = get_ct_obj_id(poi_id)
    return do_rating.rate(request, ct_id, obj_id)
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
