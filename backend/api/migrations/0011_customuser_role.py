# Generated by Django 5.2 on 2025-05-02 15:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_order_text_address'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='role',
            field=models.CharField(choices=[('user', 'User'), ('staff', 'Staff'), ('admin', 'Admin')], default='user', max_length=10),
        ),
    ]
