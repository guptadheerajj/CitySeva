from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": ["http://127.0.0.1:5500", "http://localhost:8080"]}})

# Configuration
UPLOAD_FOLDER = "Uploads"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

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
        "path": file_path
    }), 200

@app.errorhandler(Exception)
def handle_error(error):
    print("Server error:", str(error))
    return jsonify({"error": str(error)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)