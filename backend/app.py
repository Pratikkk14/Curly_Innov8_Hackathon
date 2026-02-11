import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
from keras.layers import TFSMLayer
from keras import Model, Input
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.vgg16 import preprocess_input

# -------- CONFIG --------
BRAIN_MODEL_PATH = r"C:\ml\brain_tumor_savedmodel"
SKIN_MODEL_PATH  = r"C:\ml\dermnet_savedmodel"
ORAL_MODEL_PATH  = r"C:\ml\oral_savedmodel"
PORT = 4000

app = Flask(__name__)
CORS(app)

# -------- LOAD MODELS --------
def load_brain_model(path):
    layer = TFSMLayer(path, call_endpoint="serve")
    inp = Input(shape=(224, 224, 3))
    out = layer(inp)
    return Model(inp, out)

def load_skin_model(path):
    layer = TFSMLayer(path, call_endpoint="serve")
    inp = Input(shape=(224, 224, 3))
    out = layer([inp])
    return Model(inp, out)

def load_oral_model(path):
    layer = TFSMLayer(path, call_endpoint="serve")
    inp = Input(shape=(224, 224, 3))
    out = layer(inp)
    return Model(inp, out)

# -------- CHECK PATHS --------
for p, name in [
    (BRAIN_MODEL_PATH, "Brain"),
    (SKIN_MODEL_PATH, "Skin"),
    (ORAL_MODEL_PATH, "Oral"),
]:
    if not os.path.exists(p):
        raise FileNotFoundError(f"{name} model not found")

# -------- INIT MODELS --------
brain_model = load_brain_model(BRAIN_MODEL_PATH)
skin_model  = load_skin_model(SKIN_MODEL_PATH)
oral_model  = load_oral_model(ORAL_MODEL_PATH)

# -------- CLASS LABELS --------
brain_classes = ["glioma", "meningioma", "notumor", "pituitary"]

skin_classes  = ["Acne", "Eczema", "Psoriasis", "Melanoma", "BCC", "Nevus"]

# -------- UTILS --------
def preprocess(img):
    # 1. Resize to match the 224x224 used in training
    img = img.resize((224, 224))
    
    # 2. Convert to array
    img_array = image.img_to_array(img)
    
    # 3. Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    # DO NOT use preprocess_input(img_array) here.
    # Your notebook training did not use it, so your API shouldn't either.
    
    return img_array


    

def predict_multiclass(model, classes, img):
    preds_output = model(preprocess(img))
    
    # If using TFSMLayer, output is often a dict
    if isinstance(preds_output, dict):
        preds = preds_output[list(preds_output.keys())[0]].numpy()
    else:
        preds = preds_output.numpy()
        
    idx = int(np.argmax(preds))
    return {
        "label": classes[idx],
        "confidence": round(float(np.max(preds)) * 100, 2)
    }




def predict_oral(model, img):
    preds = model(preprocess(img)).numpy()

    class_names = ['CANCER', 'NON CANCER']
    idx = int(np.argmax(preds))
    confidence = float(np.max(preds)) * 100

    return {
        "label": class_names[idx],
        "confidence": round(confidence, 2)
    }



# -------- ROUTES --------
@app.route("/predict", methods=["POST"])
def predict_brain():
    img = Image.open(request.files["file"]).convert("RGB")
    return jsonify(predict_multiclass(brain_model, brain_classes, img))

@app.route("/predict/skin", methods=["POST"])
def predict_skin():
    img = Image.open(request.files["file"]).convert("RGB")
    return jsonify(predict_multiclass(skin_model, skin_classes, img))

@app.route("/predict/oral", methods=["POST"])
def predict_oral_route():
    img = Image.open(request.files["file"]).convert("RGB")
    return jsonify(predict_oral(oral_model, img))


# -------- RUN --------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)




