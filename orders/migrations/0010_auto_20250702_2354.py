# Generated by Django 2.2.7 on 2025-07-02 18:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0009_savedcarts'),
    ]

    operations = [
        migrations.RenameField(
            model_name='salad',
            old_name='price',
            new_name='large_price',
        ),
        migrations.AddField(
            model_name='salad',
            name='small_price',
            field=models.DecimalField(decimal_places=2, default=5.95, max_digits=6),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='userorder',
            name='price',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=6),
        ),
    ]
