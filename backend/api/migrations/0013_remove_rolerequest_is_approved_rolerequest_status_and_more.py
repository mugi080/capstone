# Generated by Django 5.2 on 2025-05-02 16:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_rolerequest'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='rolerequest',
            name='is_approved',
        ),
        migrations.AddField(
            model_name='rolerequest',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=10),
        ),
        migrations.AlterField(
            model_name='rolerequest',
            name='requested_role',
            field=models.CharField(choices=[('user', 'User'), ('staff', 'Staff'), ('admin', 'Admin')], max_length=10),
        ),
    ]
