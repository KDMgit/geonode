from django import template
register = template.Library()

#Custom filter
@register.filter
def get(dictionary, key):
    return dictionary.get(key)