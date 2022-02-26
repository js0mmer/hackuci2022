import imageio
import matplotlib.pyplot as plt
import numpy as np
from sklearn.cluster import KMeans
import cv2
from collections import Counter
import os 

def RGB_HEX(color):
    return "#{:02x}{:02x}{:02x}".format(int(color[0]), int(color[1]), int(color[2])) 

def get_colors(image, number_of_colors, show_chart):
    reshaped_image = cv2.resize(image, (600, 400))
    reshaped_image = reshaped_image.reshape(reshaped_image.shape[0]*reshaped_image.shape[1], 3)
    clf = KMeans(n_clusters = number_of_colors)
    labels = clf.fit_predict(reshaped_image)
    counts = Counter(labels)
    counts = dict(sorted(counts.items()))
    center_colors = clf.cluster_centers_
    ordered_colors = [center_colors[i] for i in counts.keys()]
    hex_colors = [RGB_HEX(ordered_colors[i]) for i in counts.keys()]
    rgb_colors = [ordered_colors[i] for i in counts.keys()]
    if (show_chart):
        plt.figure(figsize = (8, 6))
        plt.pie(counts.values(), labels = hex_colors, colors = hex_colors)
    return rgb_colors 

img = input('image: ')

pic=imageio.imread(img)
plt.figure(figsize=(10,10))
plt.imshow(pic)
image = cv2.imread(img)
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
plt.imshow(image) 

print('Type of the image : ',type(pic))
print('Shape of the image : {}'.format(pic.shape))
print('Hight of the image {}'.format(pic.shape[0]))
print('Width of the image {}'.format(pic.shape[1]))
print('Dimension of the Image {}'.format(pic.ndim)) 

print('Image size {}'.format(pic.size))
print('Maximum RGB value in this image {}'.format(pic.max()))
print('Minimum RGB value in this image {}'.format(pic.min())) 

print('Value of only R channel {}'.format(pic[ 150, 100, 0]))
print('Value of only G channel {}'.format(pic[ 150, 100, 1]))
print('Value of only B channel {}'.format(pic[ 150, 100, 2])) 

raw_colors = get_colors(image, 8, True)
 
# show plot
plt.show()

