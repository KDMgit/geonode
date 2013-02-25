from django.db import models
from django.core.urlresolvers import reverse

from geonode.settings import GEOSERVER_BASE_URL
from geonode.settings import MAPQUEST_GETMAP_SERVICE

import requests
import simplejson
import urllib
    
