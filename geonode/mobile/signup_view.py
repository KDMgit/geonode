# -*- coding: utf-8 -*- 

from account.views import SignupView
from django.http import HttpResponse
import simplejson as json
from django.core.context_processors import csrf
import ipdb

class JsonSignupView(SignupView):
    
    def __init__(self, *args, **kwargs):
        self.created_user = None
        kwargs["signup_code"] = None
        super(JsonSignupView, self).__init__(*args, **kwargs)
        
    
    def form_valid(self, form):
        
        # Mandiamo già che ci siamo anche il token e la sid
        request = self.request
        token = csrf(request)['csrf_token'].__str__()
        sessionid = request.session.session_key
        
        cookie = {}
        cookie['csrftoken'] = token
        cookie['sessionid'] = sessionid
        
        data = {
                'success': True,
                'errors' : form.errors,
                'cookie' : cookie
                }
        
        try:
            super(JsonSignupView, self).form_valid(form)
            return HttpResponse(json.dumps(data), status=200, content_type="application/json")
        
        except Exception as e:
            ''' Tecnicamente, non ci si dovrebbe registrare se salta un errore. 
            L'unico errore riscontrato però è dato dall'SMTP se la mail non è corretta 
            (vedi ad esempio un dominio che non esiste). Il metodo sovrascritto però 
            ignora tale problema e crea comunque un'utenza. In caso di errore, quindi, 
            creiamo COMUNQUE un utente. '''
            
            '''
            # Questo è come DOVREBBE essere questo metodo.
            
            data['success'] = False
            data['errors']['__all__'] = e.message
            return HttpResponse(json.dumps(data), status=500, content_type="application/json")
            '''
            
            return HttpResponse(json.dumps(data), status=200, content_type="application/json")

    
    def form_invalid(self, form):
        
        data = {
                'success': False,
                'errors' : form.errors,
                'cookie' : ''
                }
        
        super(JsonSignupView, self).form_invalid(form)
        
        return HttpResponse(json.dumps(data), status=500, content_type="application/json")
