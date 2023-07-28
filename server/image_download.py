import requests
import concurrent.futures
from uuid import uuid4
import os


def download_image(image_url,target_location):
    try:
        img = requests.get(image_url)

        img_type=img.headers['Content-type']
        
        img_size= int(img.headers['Content-length']) /(1024*1024)

        if img_size>2 or (img_type not in ('image/png', 'image/jpeg', 'image/gif')):
            print('skipped image not an image',image_url)
            return
        
        img_bytes=img.content
        
        img_name=f'{uuid4()}.{img_type.split("/")[1]}'

        with open(os.path.join(target_location,img_name),'wb') as img_file:
            img_file.write(img_bytes)
            print('downloaded')

    except Exception as e:
        print('Error in download_image',e)
        print('image url',image_url)

def download_images(image_urls,target_location):
    # print('image urls',image_urls)
    with concurrent.futures.ThreadPoolExecutor() as executor:
        for url in image_urls:
            executor.submit(download_image, url,target_location)
