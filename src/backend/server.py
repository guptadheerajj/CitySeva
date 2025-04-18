from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
from werkzeug.utils import secure_filename
import tensorflow as tf
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://127.0.0.1:5500", "http://localhost:8080"]}})

# Configuration
UPLOAD_FOLDER = "Uploads"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MODEL_PATH = "image_classifier_model_resaved.h5"

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_civic_issue(image_path, model_path=MODEL_PATH):
    """
    Detects civic issues from an image using a pre-trained TensorFlow model.

    Args:
        image_path (str): Path to the input image file.
        model_path (str): Path to the .h5 model file.

    Returns:
        str: Predicted civic issue label ('Pothole', 'Waterlogging', or 'Streetlight Issue').
    """
    # Define class labels
    CLASS_LABELS = ["Pothole", "Waterlogging", "Streetlight Issue"]

    # Load the model
    try:
        model = tf.keras.models.load_model(model_path, safe_mode=False, compile=False)
    except Exception as e:
        return f"Error loading model: {str(e)}"

    # Preprocess the image
    try:
        image = Image.open(image_path)
        image = image.resize((224, 224))  # Resize to match model input
        image = np.array(image) / 255.0  # Normalize
        image = np.expand_dims(image, axis=0)  # Add batch dimension

        # Make prediction
        predictions = model.predict(image, verbose=0)
        predicted_class = CLASS_LABELS[np.argmax(predictions)]

        return predicted_class

    except Exception as e:
        return f"Error processing image: {str(e)}"

@app.route("/upload", methods=["POST"])
def upload_file():
    # Log request headers
    print("Request headers:", dict(request.headers))

    # Check if image and userId are in the form data
    if "image" not in request.files or "userId" not in request.form:
        print("Error: Missing image or userId")
        return jsonify({"error": "Image and userId are required"}), 400

    file = request.files["image"]
    user_id = request.form["userId"]

    print("Received - userId:", user_id)
    print("Received - file:", file.filename if file else None)

    # Validate userId
    if not user_id:
        print("Error: userId is empty")
        return jsonify({"error": "userId is required"}), 400

    # Validate file
    if not file or file.filename == "":
        print("Error: No file selected")
        return jsonify({"error": "No image uploaded"}), 400

    if not allowed_file(file.filename):
        print("Error: Invalid file type")
        return jsonify({"error": "Only JPG and PNG files are allowed!"}), 400

    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    if file_size > MAX_FILE_SIZE:
        print("Error: File too large")
        return jsonify({"error": "File size exceeds 5MB limit"}), 400
    file.seek(0)  # Reset file pointer

    # Create user-specific upload directory
    user_upload_path = os.path.join(UPLOAD_FOLDER, secure_filename(user_id))
    os.makedirs(user_upload_path, exist_ok=True)

    # Generate filename with timestamp
    timestamp = int(time.time() * 1000)
    extension = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{timestamp}.{extension}"
    file_path = os.path.join(user_upload_path, filename)

    # Save file
    file.save(file_path)
    print("Upload successful:", file_path)

    return jsonify({
        "message": "Image uploaded successfully",
        "filename": filename,
        "file_path": file_path
    }), 200

@app.route("/detect", methods=["POST"])
def detect_issue():
    # Log request headers
    print("Request headers:", dict(request.headers))

    # Check if file_path is provided
    if not request.json or "file_path" not in request.json:
        print("Error: Missing file_path")
        return jsonify({"error": "file_path is required"}), 400

    file_path = request.json["file_path"]
    print("Received - file_path:", file_path)

    # Validate file existence
    if not os.path.exists(file_path):
        print("Error: File does not exist")
        return jsonify({"error": "File does not exist"}), 400

    # Run detection
    result = detect_civic_issue(file_path)
    print("Detection result:", result)

    if result.startswith("Error"):
        return jsonify({"error": result}), 400

    return jsonify({"issue": result}), 200

@app.errorhandler(Exception)
def handle_error(error):
    print("Server error:", str(error))
    return jsonify({"error": str(error)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)