from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
from werkzeug.utils import secure_filename
import tensorflow as tf
import numpy as np
from PIL import Image
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:8080", "http://127.0.0.1:5500"]}})

# Configuration
UPLOAD_FOLDER = os.path.abspath("Uploads")  # Use absolute path
ISSUES_FOLDER = os.path.abspath("issues")
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MODEL_PATH = "image_classifier_model_resaved.h5"
BASE_URL = "http://localhost:3000"  # Backend URL

# Ensure upload and issues folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ISSUES_FOLDER, exist_ok=True)

# Serve static files from Uploads directory, handling nested paths
@app.route("/Uploads/<path:filename>")
def serve_uploaded_file(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return "File not found", 404
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except Exception as e:
        print(f"Error serving file {filename}: {str(e)}")
        return str(e), 500

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_civic_issue(image_path, model_path=MODEL_PATH):
    """
    Detects civic issues from an image using a pre-trained TensorFlow model.
    """
    CLASS_LABELS = ["Pothole", "Waterlogging", "Streetlight Issue"]

    try:
        model = tf.keras.models.load_model(model_path, safe_mode=False, compile=False)
    except Exception as e:
        return f"Error loading model: {str(e)}"

    try:
        # Open image and convert to RGB to remove alpha channel
        image = Image.open(image_path).convert("RGB")
        image = image.resize((224, 224))
        image = np.array(image) / 255.0
        image = np.expand_dims(image, axis=0)

        predictions = model.predict(image, verbose=0)
        predicted_class = CLASS_LABELS[np.argmax(predictions)]

        return predicted_class
    except Exception as e:
        return f"Error processing image: {str(e)}"

@app.route("/upload", methods=["POST"])
def upload_file():
    print("Request headers:", dict(request.headers))

    if "image" not in request.files or "userId" not in request.form:
        print("Error: Missing image or userId")
        return jsonify({"error": "Image and userId are required"}), 400

    file = request.files["image"]
    user_id = request.form["userId"]

    print("Received - userId:", user_id)
    print("Received - file:", file.filename if file else None)

    if not user_id:
        print("Error: userId is empty")
        return jsonify({"error": "userId is required"}), 400

    if not file or file.filename == "":
        print("Error: No file selected")
        return jsonify({"error": "No image uploaded"}), 400

    if not allowed_file(file.filename):
        print("Error: Invalid file type")
        return jsonify({"error": "Only JPG and PNG files are allowed!"}), 400

    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    if file_size > MAX_FILE_SIZE:
        print("Error: File too large")
        return jsonify({"error": "File size exceeds 5MB limit"}), 400
    file.seek(0)

    user_upload_path = os.path.join(UPLOAD_FOLDER, secure_filename(user_id))
    os.makedirs(user_upload_path, exist_ok=True)

    timestamp = int(time.time() * 1000)
    extension = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{timestamp}.{extension}"
    file_path = os.path.join(user_upload_path, filename)

    file.save(file_path)
    print("Upload successful:", file_path)

    return jsonify({
        "message": "Image uploaded successfully",
        "filename": filename,
        "file_path": file_path
    }), 200

@app.route("/detect", methods=["POST"])
def detect_issue():
    print("Request headers:", dict(request.headers))

    if not request.json or "file_path" not in request.json:
        print("Error: Missing file_path")
        return jsonify({"error": "file_path is required"}), 400

    file_path = request.json["file_path"]
    print("Received - file_path:", file_path)

    if not os.path.exists(file_path):
        print("Error: File does not exist")
        return jsonify({"error": "File does not exist"}), 400

    result = detect_civic_issue(file_path)
    print("Detection result:", result)

    if result.startswith("Error"):
        return jsonify({"error": result}), 400

    return jsonify({"issue": result}), 200

@app.route("/submit", methods=["POST"])
def submit_issue():
    print("Request headers:", dict(request.headers))

    if not request.json or "userId" not in request.json or "issue" not in request.json or "location" not in request.json or "imagePath" not in request.json:
        print("Error: Missing userId, issue, location, or imagePath")
        return jsonify({"error": "userId, issue, location, and imagePath are required"}), 400

    user_id = request.json["userId"]
    issue = request.json["issue"]
    location = request.json["location"]
    description = request.json.get("description", "")  # Optional
    image_path = request.json["imagePath"]

    if not location.strip():
        print("Error: Location is required")
        return jsonify({"error": "Location is required"}), 400

    # Prepare issue data with full URL for image
    relative_path = os.path.relpath(image_path, UPLOAD_FOLDER)
    full_image_url = f"{BASE_URL}/Uploads/{relative_path.replace(os.sep, '/')}"

    issue_data = {
        "userId": user_id,
        "username": user_id.split("@")[0] if "@" in user_id else user_id[:2].upper(),
        "date": time.strftime("%d/%m/%Y"),
        "issue": issue,
        "location": location,
        "description": description,
        "image": full_image_url,
        "status": "Open",
        "engagement": 6  # Initial engagement (as per example)
    }

    # Load existing issues or create new file
    issues_file = os.path.join(ISSUES_FOLDER, "issues.json")
    if os.path.exists(issues_file):
        with open(issues_file, "r") as f:
            issues = json.load(f)
    else:
        issues = []

    # Append new issue
    issues.append(issue_data)

    # Save to JSON file
    with open(issues_file, "w") as f:
        json.dump(issues, f, indent=4)

    print("Issue submitted:", issue_data)
    return jsonify({"message": "Issue submitted successfully"}), 200

@app.route("/issues", methods=["GET"])
def get_issues():
    issues_file = os.path.join(ISSUES_FOLDER, "issues.json")
    if os.path.exists(issues_file):
        with open(issues_file, "r") as f:
            issues = json.load(f)
        return jsonify(issues)
    return jsonify([])

@app.errorhandler(Exception)
def handle_error(error):
    print("Server error:", str(error))
    return jsonify({"error": str(error)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)