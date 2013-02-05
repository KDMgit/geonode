from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext
from geonode.poi.models import Poi
from geonode.settings import STATIC_URL

def poi_detail(request, poi_id):
    try:
        p = Poi.objects.get(poi_id=poi_id)
    except Poi.DoesNotExist:
        p = Poi(poi_id = poi_id)
        p.save()
        
    context = RequestContext(request, {
               'poi': p,
               'STATIC_URL' : STATIC_URL,
               })
        
    return render_to_response('poi/poi_detail.html', context)