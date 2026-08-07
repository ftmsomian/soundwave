from django.apps import AppConfig


class PlatformOpsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "platform_ops"

    def ready(self):
        # Register cross-app notification receivers after all models are loaded.
        from . import signals  # noqa: F401
