from django.contrib import admin

from .models import Artist, Follow, User, UserSettings

admin.site.register(User)
admin.site.register(Artist)
admin.site.register(Follow)
admin.site.register(UserSettings)
