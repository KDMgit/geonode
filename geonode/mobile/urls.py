# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2012 OpenPlans
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################

from django.conf.urls import patterns, include, url

urlpatterns = patterns('geonode.mobile.views',
    
    #LOGIN
    url(r'^login$', 'login', name='mobile_login'),
    url(r'^logout$', 'logout', name='mobile_logout'),
    
    #CATEGORIE
    url(r'^categories/$', 'get_categories', name='mobile_get_categories'),
    url(r'^categories/(?P<category_slug>[^/]+)/$', 'get_layers', name='mobile_get_layers'),
    
    #LAYER
    url(r'^search/(?P<layer>[^/]+)/(?P<bbox>[^/]+)/$', 'search', name='mobile_search'),
    
    #POI
    url(r'^(?P<poi_id>[^/]+)/$', 'poi_detail', name='mobile_poi_detail'),
    
    url(r'^(?P<poi_id>[^/]+)/comments/add$', 'add_poi_comment', name='mobile_add_poi_comment'),
    url(r'^(?P<poi_id>[^/]+)/comments/$', 'get_poi_comments', name='mobile_get_poi_comments'),
    
    url(r'^(?P<poi_id>[^/]+)/rating/user/set$', 'set_poi_rating', name='mobile_set_poi_rating'),
    
    url(r'^(?P<poi_id>[^/]+)/rating/user$', 'get_poi_user_rating', name='mobile_get_poi_user_rating'),
    url(r'^(?P<poi_id>[^/]+)/rating/user/(?P<category>[^/]+)$', 'get_poi_user_rating', name='mobile_get_poi_user_rating'),
    
    url(r'^(?P<poi_id>[^/]+)/rating/overall$', 'get_poi_overall_rating', name='mobile_get_poi_overall_rating'),
    url(r'^(?P<poi_id>[^/]+)/rating/overall/(?P<category>[^/]+)$', 'get_poi_overall_rating', name='mobile_get_poi_overall_rating'),
)
