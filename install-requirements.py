import os
requirements=[
        # native dependencies
        "PIL",
        "lxml",
        # python dependencies
        "gsconfig==0.6.1",
        "OWSLib==0.6.1",
        "Django==1.4.3",
        "httplib2>=0.7",
        # Django Apps
        "pinax-theme-bootstrap==2.2.1",
        "pinax-theme-bootstrap-account==1.0b2",
        "django-user-accounts==1.0b7",
        "django-forms-bootstrap==2.0.3.post1",
        "django-pagination",
        "django-jsonfield==0.8.11",
        "django-friendly-tag-loader==1.1",
        "django-taggit==0.9.3",
        "django-taggit-templatetags",
        "django-geoexplorer==3.0.2.devdc5e859e",
        "django-user-accounts==1.0b7",
        "django-relationships==0.3.2",
        "django-notification==1.0",
        "django-announcements==1.0.2",
        "django-activity-stream==0.4.4",
        "django-request==0.3",
        "user-messages==0.1.1",
        "geonode-avatar==2.1.1",
        "dialogos==0.2",
        "agon-ratings==0.2",
        "South==0.7.3",
        #catalogue
        "Shapely>=1.2.15",
        "pycsw>=1.4.0",
        # setup
        "Paver",
        # sample and test data / metadata
        "gisdata==0.5.4",
        # testing
        "django-nose",
        "nose>=1.0",
        "beautifulsoup4",
        "MultipartPostHandler",
        # translation
        "transifex-client",
        # ocd
        "simplejson",
        "requests",
        "ipdb",
        "psycopg2",
    ]
 
for r in requirements:
    os.system('pip install ' + r)
    
os.system('easy_install pycsw')
 