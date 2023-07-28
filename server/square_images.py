from PIL import Image, ImageDraw
import os
import errno

import concurrent.futures


def process_image(src_dir,dst_dir,filename):
    full_src_path = os.path.join(src_dir, filename)
    img = Image.open(full_src_path)
    min_dim = min(img.size)
    cropped_img = img.crop((0, 0, min_dim, min_dim))

    full_dst_path = os.path.join(dst_dir, filename)
    cropped_img.save(full_dst_path)
    print("Squared " + filename)

def process_images(src_dir,dst_dir):
    
    os.mkdir(dst_dir)

    with concurrent.futures.ThreadPoolExecutor() as executor:
        for filename in os.listdir(src_dir):
            executor.submit(process_image,src_dir,dst_dir,filename)

    
        
        

