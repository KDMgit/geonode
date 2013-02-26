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
    url(r'^login/$', 'login', name='login'),
    url(r'^logout/$', 'logout', name='logout'),
    
    url(r'^categories/$', 'get_categories', name='get_categories'),
    url(r'^categories/(?P<category_slug>[^/]+)/$', 'get_layers', name='get_layers'),
    
    url(r'^search/(?P<layer>[^/]+)/(?P<bbox>[^/]+)/$', 'search', name='search'),
    
    url(r'^(?P<poi_id>[^/]+)/$', 'poi_json_detail', name='poi_json_detail'),
    url(r'^(?P<poi_id>[^/]+)/comments/add$', 'add_poi_comment', name='add_poi_comment'),
    url(r'^(?P<poi_id>[^/]+)/comments/$', 'get_poi_comments', name='get_poi_comments'),
)
