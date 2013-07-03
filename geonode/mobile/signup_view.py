from account.views import SignupView
from django.http import HttpResponse
import simplejson as json
import ipdb

class JsonSignupView(SignupView):
    
    def __init__(self, *args, **kwargs):
        self.created_user = None
        kwargs["signup_code"] = None
        super(JsonSignupView, self).__init__(*args, **kwargs)
        
    
    def form_valid(self, form):
        
        data = {'success': True}
        data['errors'] = form.errors
        
        return HttpResponse(json.dumps(data), status=200, content_type="application/json")

    
    def form_invalid(self, form):
        
        data = {'success': False}
        data['errors'] = form.errors
        
        return HttpResponse(json.dumps(data), status=500, content_type="application/json")