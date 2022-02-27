import requests

api_key = 'acc_70d8068e509a25f'
api_secret = '46db5f57a8139d367db2aabdea5404e9'
image_url = 'https://cdn.discordapp.com/attachments/890119354128142336/934666345272979526/IMG_1587.jpg'

response = requests.get(
    'https://api.imagga.com/v2/tags?image_url=%s' % image_url,
    auth=(api_key, api_secret))

print(response.json())

"""
api stops accepting api_key if program exceeds 1000 req/month
"""