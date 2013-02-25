from django.shortcuts import get_object_or_404, render_to_response
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType

from django.http import HttpResponse
from django.template import RequestContext

import dialogos.views as dialogos


from geonode.poi.models import Poi

import json

def __get_ct_obj_id(poi_id):
    poi_ct = None
    for x in ContentType.objects.all():
        if x.name == 'poi':
            poi_ct = x
            break
        
    poi = None
    for x in Poi.objects.all():
        if x.poi_id == poi_id:
            poi = x
            break
    
    return poi_ct.pk, poi.pk

@login_required
def poi_json_detail(request, poi_id):
    print request.user.username
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
    content_type_id, obj_id = __get_ct_obj_id(poi_id)
    return dialogos.post_comment(request, content_type_id, obj_id)
    
def login(request):
    username = request.REQUEST['username']
    password = request.REQUEST['password']
    
    # Controlliamo l'autenticazione
    user = authenticate(username=username, password=password)
    
    if user is not None:
        if user.is_active:
            
            auth_login(request, user)
            return HttpResponse(status=200)
        
        else:
            # Return a 'disabled account' error message
            return HttpResponse(status=500)
    else:
        # Return an 'invalid login' error message.
        return HttpResponse(status=500)
    
def search(request):
    pass
        
        
        
        
        
        
        
        
