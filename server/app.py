from flask import Flask, flash, request
from werkzeug.utils import secure_filename
from flask_cors import cross_origin
import os
import imghdr
from shutil import rmtree
from uuid import uuid4
# from flask_socketio import SocketIO
import threading
import base64

from BingImageScraper import BingImageScraper
from image_download import download_images

from settings import ACCEPTED_EXTENSIONS,MAX_NUMBER_OF_FILES_TO_UPLOAD

from square_images import process_images

from mosaic import mosaic

import time


cwd = os.getcwd()
UPLOAD_FOLDER = os.path.join(cwd, 'Uploads')
SQUARE_IMAGES_FOLDER = os.path.join(cwd, 'Square')
GENERATED_IMAGES_FOLDER = os.path.join(cwd, 'Generated')
CACHE_FOLDER = os.path.join(cwd, 'Cache')
TARGET_FOLDER=os.path.join(cwd,'Target')

app = Flask(__name__, static_folder='./build', static_url_path='/')

app.config['SECRET_KEY'] = 'secret!'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SQUARE_IMAGES_FOLDER'] = SQUARE_IMAGES_FOLDER
app.config['GENERATED_IMAGES_FOLDER'] = GENERATED_IMAGES_FOLDER
app.config['CACHE_FOLDER'] = CACHE_FOLDER
app.config['TARGET_FOLDER'] = TARGET_FOLDER


# socketio = SocketIO(app,cors_allowed_origins=['http://localhost:3000'],engineio_logger=True,ping_timeout=120,ping_interval=120)
# socketio = SocketIO(app)


if not os.path.isdir(app.config['UPLOAD_FOLDER']):
    os.mkdir(app.config['UPLOAD_FOLDER'])

if not os.path.isdir(app.config['SQUARE_IMAGES_FOLDER']):
    os.mkdir(app.config['SQUARE_IMAGES_FOLDER'])

if not os.path.isdir(app.config['GENERATED_IMAGES_FOLDER']):
    os.mkdir(app.config['GENERATED_IMAGES_FOLDER'])

if not os.path.isdir(app.config['CACHE_FOLDER']):
    os.mkdir(app.config['CACHE_FOLDER'])

if not os.path.isdir(app.config['TARGET_FOLDER']):
    os.mkdir(app.config['TARGET_FOLDER'])


def delele_upload(dirname):
    print('dirname about to be deleted ',dirname)

    if dirname=='test' or dirname=='':
        return

    uploads_location = os.path.join(
        app.config['UPLOAD_FOLDER'], dirname)
    square_location = os.path.join(
        app.config['SQUARE_IMAGES_FOLDER'], dirname)
    generated_location = os.path.join(
        app.config['GENERATED_IMAGES_FOLDER'], dirname)
    cache_location=os.path.join(
        app.config['CACHE_FOLDER'], f'{dirname}.json')
    target_location=os.path.join(
        app.config['TARGET_FOLDER'], dirname)

    for location in [uploads_location, square_location, generated_location,cache_location,target_location]:

        if os.path.exists(location):
            if os.path.isdir(location):
                rmtree(location)
            else:
                os.remove(location)
            print(f'deleting {dirname}')




def is_image(img_path):
    return imghdr.what(img_path) in ACCEPTED_EXTENSIONS

# @cross_origin(['http://localhost:3000'])

@app.route('/api/delete', methods=['POST'])
def delete():
    try:
        print('delete route called', request.form['dirname'])
        delele_upload(request.form['dirname'])
    except Exception as e:
        return {'error': e}

    return {'message': 'Successfully deleted directory!!'}

# @socketio.on('disconnect')
# def handle_disconnect():
#     print('disconnected')


@app.route('/api/grab', methods=['POST'])
def grab_from_internet():
    try:
        image_urls=request.form['image_urls']
        image_urls=image_urls.split(" ")

        print(image_urls)

        dirname=str(uuid4())

        upload_location = os.path.join(
                app.config['UPLOAD_FOLDER'],dirname)
        
        square_location = os.path.join(
                app.config['SQUARE_IMAGES_FOLDER'],dirname)

        os.mkdir(upload_location)

        # DEVELOPMENT
        # download_images(image_urls[:min(2,len(image_urls))],upload_location)

        # PRODUCTION
        download_images(image_urls[:min(MAX_NUMBER_OF_FILES_TO_UPLOAD,len(image_urls))],upload_location)

        delete_thread = threading.Timer(60*20, delele_upload, [dirname])
        delete_thread.start()

        process_images(upload_location,square_location)         

       
        return {'dirname':dirname,'abort':False}


    except Exception as e:
        print('Exception in grab_from_internet route ',str(e))
        return {'abort':True} 
        


# @socketio.on('download_images')
# def handle_download(image_urls):

#     try:

#         image_urls=image_urls.split(" ")

#         dirname=str(uuid4())

#         upload_location = os.path.join(
#                 app.config['UPLOAD_FOLDER'],dirname)
        
#         square_location = os.path.join(
#                 app.config['SQUARE_IMAGES_FOLDER'],dirname)

#         os.mkdir(upload_location)

#         # DEVELOPMENT
#         # download_images(image_urls[:min(50,len(image_urls))],upload_location)

#         # PRODUCTION
#         download_images(image_urls[:min(MAX_NUMBER_OF_FILES_TO_UPLOAD,len(image_urls))],upload_location)

#         delete_thread = threading.Timer(60*20, delele_upload, [dirname])
#         delete_thread.start()

#         process_images(upload_location,square_location)

         

       
#         return {'dirname':dirname,'abort':False}

#     except Exception as e:
#         print('Eception in download',e)
#         return {'abort':True}


@app.route('/api/search', methods=['POST'])
def search():
    try:
        
        search_term=request.form['searchText']
        search_count=int(request.form['count'])

        print(search_term)
        
        bing = BingImageScraper(search_term)

        results = bing.get_results(search_count)

        return {'search_results':results}

    except Exception :
        return {'search_results': []}

@app.route('/api/tile', methods=['POST'])
def tile():
    try:

        print("You hit the tile route")

        dirname=request.form['dirname']

        print('dirname',dirname)
        square_size=int(request.form['squareSize'])

        print('squre_size',square_size)

        target_location = os.path.join(
            app.config['TARGET_FOLDER'], dirname)
        
        uploads_location=os.path.join(app.config['UPLOAD_FOLDER'],dirname)

        if not os.path.isdir(uploads_location):
            return {'abort':True}
        square_location = os.path.join(
                app.config['SQUARE_IMAGES_FOLDER'],dirname)
        
        if not os.path.isdir(square_location):
            try:
                process_images(uploads_location,square_location)
            except FileExistsError as e:
                print('Error while creating Square directory in Tile route',str(e))
        
        if not os.path.isdir(target_location):
            try:
                os.mkdir(target_location)
            except FileExistsError as e:
                print('Error while creating Target directory in Tile route',str(e))

        file = request.files['file']

        
        
        extension=file.mimetype.split('/')[1]

        print('extension',extension)
        
        if not extension in ACCEPTED_EXTENSIONS:
            return {'error': 'Not an image'}

        filename=f'{uuid4()}.{extension}'

        destination = os.path.join(target_location, filename)
        file.save(destination)

        

        generated_location = os.path.join(app.config['GENERATED_IMAGES_FOLDER'], dirname)
        
        if not os.path.isdir(generated_location):
            try:
                os.mkdir(generated_location)
            except FileExistsError as e:
                print('Error while creating Generated directory in Tile route',str(e))

        
        start=time.perf_counter()

        mosaic(dirname,filename,square_size)

        end=time.perf_counter()

        print(f'Time taken by route => {round(end-start,2)}')

        generated_file=os.path.join(generated_location,filename)
        
        with open(generated_file, "rb") as img_file:
            img = base64.b64encode(img_file.read())
        
        os.remove(generated_file)
        os.remove(destination)

        return {'abort':False,'img':str(img.decode('utf-8'))}


    except Exception as e:

        print('Exception in tile route',str(e))
        
        return {'error':'Error in server please try again'}

@app.route('/api/upload', methods=['POST'])
def fileUpload():
    try:
        target_location = os.path.join(
            app.config['UPLOAD_FOLDER'], request.form['dirname'])
        
        if not os.path.isdir(target_location):
            try:
                os.mkdir(target_location)
                delete_thread = threading.Timer(60*20, delele_upload, [request.form['dirname']])
                delete_thread.start()
            except FileExistsError as e:
                print('Error while creating directory in fileUpload route',e)
        
        file = request.files['file']
        
        filename = secure_filename(
            request.form['filename']+'.'+request.form['extension'])
        
        destination = os.path.join(target_location, filename)
        file.save(destination)
        
        if not is_image(destination):
            delele_upload(request.form['dirname'])
            return {'abort': True}

        
        
        return {'abort': False}
    except Exception as e:
        delele_upload(request.form['dirname'])
        return {'abort': True}

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == "__main__":
    # socketio.run(app,debug=False)
    app.run(debug=False)
