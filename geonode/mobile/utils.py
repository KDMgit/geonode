from django.contrib.contenttypes.models import ContentType

from geonode.layers.models import Layer, TopicCategory, TOPIC_CATEGORIES
from geonode.poi.models import Poi

import dialogos.views as dialogos
from dialogos.models import Comment



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
    data['count'] = topic.layer_set.count()
    
    return data


def get_layer_bean(layer):
    data = {}
    
    data['id'] = layer.pk
    data['name'] = layer.name
    data['title'] = layer.title
    data['typename' ] = layer.typename
    data['abstract'] = layer.abstract
    
    return data

def get_comment_bean(comment):
    data = {}
    
    data = {}
    data['id'] = comment.id
    data['author'] = get_user_bean(comment.author)
    data['comment'] = comment.comment
    data['date'] = comment.submit_date.date().strftime('%X %x')
    
    return data


def get_comments_bean_list(poi):
    data = []
    
    for c in poi.comments():
        data.append(get_comment_bean(c))

    return data
    
    
        





