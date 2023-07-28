from PIL import Image, ImageDraw
import os
import json

import concurrent.futures


def get_pixel_matrix(img):
    pixels = list(img.getdata())
    
    return [pixels[i:i+img.width] for i in range(0, len(pixels), img.width)]


def mean_rgb(pixels):
    
    r_total = 0
    g_total = 0
    b_total = 0
    n_pixels = 0
    for row in pixels:
        for p in row:
            r_total += p[0]
            g_total += p[1]
            b_total += p[2]

            n_pixels += 1

    return (r_total / n_pixels, g_total / n_pixels, b_total / n_pixels)


def pythagoras_nearest_rgb(target_rgb, source_images_mean_rgbs):
    
    best_match_name = None
    best_match_color_difference = None
    for path, source_rgb in source_images_mean_rgbs.items():
        color_difference = pythagoras_color_difference(target_rgb, source_rgb)
        if best_match_color_difference is None or color_difference < best_match_color_difference:
            best_match_name = path
            best_match_color_difference = color_difference

    return best_match_name


def pythagoras_color_difference(p1, p2):
    
    tot = 0
    for c1, c2 in zip(p1, p2):
        tot += (c1 - c2)**2

    return tot**0.5


def get_image_square(pixels, corner, size):
    
    opposite_corner = (corner[0]+size, corner[1]+size)

    square_rows = pixels[corner[0]:opposite_corner[0]]
    square = []
    for row in square_rows:
        square.append(row[corner[1]:opposite_corner[1]])

    return square


def load_and_scale_source_imgs(dir_path, dim):
    
    imgs = {}
    for filename in os.listdir(dir_path):        
        full_path = os.path.join(dir_path, filename)
        img = Image.open(full_path)
        img=img.convert('RGB')
        img.thumbnail((dim, dim))
        imgs[filename] = img
    return imgs


def get_mean_rgbs(imgs):
    rgbs = {}
    for path, img in imgs.items():
        pixels = get_pixel_matrix(img)
        rgbs[path] = mean_rgb(pixels)
    return rgbs


class JSONCache:

    def __init__(self, cache_path):
        self.cache_path = cache_path

    def has_data(self):
        return os.path.isfile(self.cache_path)

    def write_all(self, data):
        with open(self.cache_path, 'w') as f:
            json.dump(data, f)

    def read_all(self):
        with open(self.cache_path) as f:
            return json.load(f)


# Make sure you have a dir called "./square_images
# source_img_dir = "./example_square_images"
# source_img_dir = "./aos_square"
# # Change this to the location of your input image
# input_path = "test4.jpeg"

# square_size = 30


# source_imgs = load_and_scale_source_imgs(source_img_dir, square_size)

# # Optional - using a cache (see extensions)
# cache = JSONCache("./mean_rgb_cache.json")
# if not cache.has_data():
#     mean_rgbs = get_mean_rgbs(source_imgs)
#     cache.write_all(mean_rgbs)

# mean_rgbs = cache.read_all()

# target_img = Image.open(input_path)
# target_pixels = get_pixel_matrix(target_img)
# target_image_width, target_image_height = target_img.size

# output_img = Image.new(
#     'RGB', (target_image_width, target_image_height), (255, 255, 255, 0))
# for x in range(0, target_image_width-1, square_size):
#     for y in range(0, target_image_height-1, square_size):
#         square = get_image_square(target_pixels, (y, x), square_size)
#         target_rgb = mean_rgb(square)
#         source_img_name = pythagoras_nearest_rgb(target_rgb, mean_rgbs)

#         source_img = source_imgs[source_img_name]

#         output_img.paste(source_img, (x, y))

# output_img.save('otest403.jpeg')

import time

def mosaic(dirname,filename,square_size):

    try:
        cwd = os.getcwd()
        SQUARE_IMAGES_FOLDER = os.path.join(cwd, 'Square')
        GENERATED_IMAGES_FOLDER = os.path.join(cwd, 'Generated')
        CACHE_FOLDER = os.path.join(cwd, 'Cache')
        TARGET_FOLDER=os.path.join(cwd,'Target')

        source_img_dir=os.path.join(SQUARE_IMAGES_FOLDER,dirname)
        input_path = os.path.join(*[TARGET_FOLDER,dirname,filename])
        source_imgs = load_and_scale_source_imgs(source_img_dir, square_size)

        cache = JSONCache(os.path.join(CACHE_FOLDER,f'{dirname}.json'))
        if not cache.has_data():
            mean_rgbs = get_mean_rgbs(source_imgs)
            
            cache.write_all(mean_rgbs)

        mean_rgbs = cache.read_all()
        target_img = Image.open(input_path)
        target_pixels = get_pixel_matrix(target_img)
        target_image_width, target_image_height = target_img.size


        output_img = Image.new('RGB', (target_image_width, target_image_height), (255, 255, 255, 0))
        
        
    
        for x in range(0, target_image_width-1, square_size):
            for y in range(0, target_image_height-1, square_size):
                
                square = get_image_square(target_pixels, (y, x), square_size)
                target_rgb = mean_rgb(square)

                source_img_name = pythagoras_nearest_rgb(target_rgb, mean_rgbs)



                source_img = source_imgs[source_img_name]

                output_img.paste(source_img, (x, y))
        
        
        output_img.save(os.path.join(*[GENERATED_IMAGES_FOLDER,dirname,filename]))
    except Exception as e:
        print('Error in mosaic ',str(e))

    





if __name__ == "__main__":
    start=time.perf_counter()

    

    end=time.perf_counter()

    print(f'Time taken : {round(end-start,2)}...')


