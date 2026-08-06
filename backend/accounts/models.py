"""
مدل‌های اپ accounts — مسئول: عضو اول
جزئیات کامل در docs/backend/checklist-member1-auth-users.md
"""
from django.contrib.auth.models import AbstractUser
from django.db import models

ROLE_CHOICES = [
    ("user", "user"),
    ("artist", "artist"),
    ("support", "support"),
    ("admin", "admin"),
]
TIER_CHOICES = [("free", "free"), ("silver", "silver"), ("gold", "gold")]
ARTIST_STATUS_CHOICES = [
    ("pending", "pending"),
    ("approved", "approved"),
    ("rejected", "rejected"),
]
GENDER_CHOICES = [("male", "male"), ("female", "female"), ("other", "other")]


class User(AbstractUser):
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")
    subscription = models.CharField(max_length=10, choices=TIER_CHOICES, default="free")
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    display_name = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    bio = models.TextField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class Artist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="artist_profile")
    artist_name = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=ARTIST_STATUS_CHOICES, default="pending")
    rejection_reason = models.TextField(blank=True)
    portfolio_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    total_streams = models.PositiveIntegerField(default=0)
    unique_listeners = models.PositiveIntegerField(default=0)
    monthly_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.artist_name


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "following")


class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings")
    notification_prefs = models.JSONField(default=dict, blank=True)
    language = models.CharField(max_length=10, default="fa")
    sound_volume = models.FloatField(default=1.0)
