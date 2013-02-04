from django.shortcuts import get_object_or_404, render_to_response
from geonode.poi.models import Poi

def detail(self, poi_id):
    try:
        p = Poi.objects.get(poi_id=poi_id)
    except Poi.DoesNotExist:
        p = Poi(poi_id = poi_id)
        p.save()
    return render_to_response('poi/detail.html', {'poi': p})