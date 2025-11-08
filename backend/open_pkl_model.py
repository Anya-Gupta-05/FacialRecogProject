#this file will print the result of the ds_model_arcface
import pickle
# Replace with your file name
file_path = '/Users/anyagupta/FacialRecogProject/backend/user_faces/ds_model_arcface_detector_opencv_aligned_normalization_base_expand_0.pkl'
with open(file_path, 'rb') as f:
    data = pickle.load(f)

print(type(data))
print(data)
