from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS, cross_origin
import os
import time
from werkzeug.utils import secure_filename
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import uuid
from datetime import datetime
import threading
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import queue

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:8080", "http://127.0.0.1:5500"]}}, supports_credentials=True)

# Configuration
UPLOAD_FOLDER = os.path.abspath("Uploads")
ISSUES_FOLDER = os.path.abspath("issues")
TRENDS_FOLDER = os.path.abspath("trends")
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MODEL_PATH = "image_classifier_model_resaved.h5"
BASE_URL = "http://localhost:3000"

# Ensure upload, issues, and trends folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ISSUES_FOLDER, exist_ok=True)
os.makedirs(TRENDS_FOLDER, exist_ok=True)

# Load TensorFlow model at startup
model = None
try:
    model = tf.keras.models.load_model(MODEL_PATH, safe_mode=False, compile=False)
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model at startup: {str(e)}")

# Email queue for asynchronous sending
email_queue = queue.Queue()
SENDER_EMAIL = "testg14225@gmail.com"
APP_PASSWORD = "zctk pccd yhvk scmw"

# Serve static files from Uploads directory
@app.route("/Uploads/<path:filename>")
@cross_origin()
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

def detect_civic_issue(image_path):
    CLASS_LABELS = ["Pothole", "Waterlogging", "Streetlight Issue"]
    if model is None:
        return "Error: Model not loaded"
    try:
        start_time = time.time()
        image = Image.open(image_path).convert("RGB")
        image = image.resize((224, 224))
        image = np.array(image) / 255.0
        image = np.expand_dims(image, axis=0)
        predictions = model.predict(image, verbose=0)
        predicted_class = CLASS_LABELS[np.argmax(predictions)]
        print(f"Image detection took {time.time() - start_time:.2f} seconds")
        return predicted_class
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return f"Error processing image: {str(e)}"

@app.route("/upload", methods=["POST"])
@cross_origin()
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
    return jsonify({"message": "Image uploaded successfully", "filename": filename, "file_path": file_path}), 200

@app.route("/detect", methods=["POST"])
@cross_origin()
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
@cross_origin()
def submit_issue():
    print("Request headers:", dict(request.headers))
    start_time = time.time()
    if not request.json or "userId" not in request.json or "issue" not in request.json or "location" not in request.json or "imagePath" not in request.json:
        print("Error: Missing userId, issue, location, or imagePath")
        return jsonify({"error": "userId, issue, location, and imagePath are required"}), 400
    user_id = request.json["userId"]
    issue = request.json["issue"]
    location = request.json["location"]
    description = request.json.get("description", "")
    image_path = request.json["imagePath"]
    upvotes = request.json.get("upvotes", 0)
    downvotes = request.json.get("downvotes", 0)
    if not location.strip():
        print("Error: Location is required")
        return jsonify({"error": "Location is required"}), 400
    relative_path = os.path.relpath(image_path, UPLOAD_FOLDER)
    full_image_url = f"{BASE_URL}/Uploads/{relative_path.replace(os.sep, '/')}"
    current_time = datetime.now()
    issue_data = {
        "_id": str(uuid.uuid4()),
        "userId": user_id,
        "username": user_id.split("@")[0] if "@" in user_id else user_id[:2].upper(),
        "date": current_time.strftime("%d/%m/%Y"),
        "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
        "issue": issue,
        "location": location,
        "description": description,
        "image": full_image_url,
        "status": "Open",
        "upvotes": upvotes,
        "downvotes": downvotes,
        "votes": []
    }
    issues_file = os.path.join(ISSUES_FOLDER, "issues.json")
    io_start = time.time()
    if os.path.exists(issues_file):
        with open(issues_file, "r") as f:
            issues = json.load(f)
    else:
        issues = []
    print(f"File I/O (read) took {time.time() - io_start:.2f} seconds")
    issues.append(issue_data)
    io_start = time.time()
    with open(issues_file, "w") as f:
        json.dump(issues, f, indent=4)
    print(f"File I/O (write) took {time.time() - io_start:.2f} seconds")
    update_trending_issues()
    email_body = f"New issue reported:\n\nIssue: {issue}\nLocation: {location}\nDescription: {description or 'N/A'}\nUser: {user_id}"
    email_queue.put((SENDER_EMAIL, "nitingupta10a@gmail.com", "New Issue Reported", email_body, image_path))
    print("Email queued for sending")
    print(f"Total submit processing time: {time.time() - start_time:.2f} seconds")
    return jsonify({"message": "Issue submitted successfully"}), 200

@app.route("/vote", methods=["POST"])
@cross_origin()
def update_vote():
    print("Request headers:", dict(request.headers))
    if not request.json or "issueId" not in request.json or "voteType" not in request.json or "userId" not in request.json:
        print("Error: Missing issueId, voteType, or userId")
        return jsonify({"error": "issueId, voteType, and userId are required"}), 400
    issue_id = request.json["issueId"]
    vote_type = request.json["voteType"]
    user_id = request.json["userId"]
    issues_file = os.path.join(ISSUES_FOLDER, "issues.json")
    if not os.path.exists(issues_file):
        print("Error: Issues file not found")
        return jsonify({"error": "Issues file not found"}), 400
    try:
        with open(issues_file, "r") as f:
            issues = json.load(f)
        print(f"Looking for issue with _id: {issue_id}, type: {type(issue_id)}")
        for issue in issues:
            print(f"Checking issue _id: {issue['_id']}, type: {type(issue['_id'])}")
            if str(issue["_id"]) == str(issue_id):
                print(f"Match found for issue: {issue}")
                user_vote = next((v for v in issue["votes"] if v["userId"] == user_id), None)
                if user_vote:
                    if user_vote["voteType"] == vote_type:
                        return jsonify({"message": "You have already voted this way"}), 200
                    else:
                        if user_vote["voteType"] == "up":
                            issue["upvotes"] -= 1
                        elif user_vote["voteType"] == "down":
                            issue["downvotes"] -= 1
                        if vote_type == "up":
                            issue["upvotes"] += 1
                        elif vote_type == "down":
                            issue["downvotes"] += 1
                        user_vote["voteType"] = vote_type
                else:
                    if vote_type == "up":
                        issue["upvotes"] += 1
                    elif vote_type == "down":
                        issue["downvotes"] += 1
                    issue["votes"].append({"userId": user_id, "voteType": vote_type})
                break
        else:
            return jsonify({"error": "Issue not found"}), 404
        with open(issues_file, "w") as f:
            json.dump(issues, f, indent=4)
        update_trending_issues()
        print("Vote updated:", {issue_id: {"upvotes": issue["upvotes"], "downvotes": issue["downvotes"]}})
        return jsonify({"message": "Vote updated successfully"}), 200
    except Exception as e:
        print(f"Server error with traceback: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/issues", methods=["GET"])
@cross_origin()
def get_issues():
    issues_file = os.path.join(ISSUES_FOLDER, "issues.json")
    trending_file = os.path.join(TRENDS_FOLDER, "trending_issues.json")
    if os.path.exists(issues_file):
        try:
            with open(issues_file, "r") as f:
                all_issues = json.load(f)
            for issue in all_issues:
                if "_id" not in issue:
                    issue["_id"] = str(uuid.uuid4())
            trending_ids = []
            if os.path.exists(trending_file):
                try:
                    with open(trending_file, "r") as f:
                        content = f.read().strip()
                        if content:
                            trending_issues = json.loads(content)
                            trending_ids = [issue["_id"] for issue in trending_issues]
                except json.JSONDecodeError:
                    pass
            recent_issues = [issue for issue in all_issues if issue["_id"] not in trending_ids]
            # Sort by timestamp if available, otherwise fall back to date
            recent_issues.sort(key=lambda x: datetime.strptime(
                x.get("timestamp", "/".join(x["date"].split("/")[::-1])),  # Convert DD/MM/YYYY to YYYY/MM/DD
                "%Y-%m-%d %H:%M:%S" if "timestamp" in x else "%Y/%m/%d"
            ), reverse=True)
            return jsonify(recent_issues)
        except json.JSONDecodeError as e:
            print(f"Error decoding issues.json: {str(e)}")
            return jsonify({"error": "Invalid issues data"}), 500
        except Exception as e:
            print(f"Error in /issues endpoint: {str(e)}")
            return jsonify({"error": str(e)}), 500
    return jsonify([])

@app.route("/trending", methods=["GET"])
@cross_origin()
def get_trending_issues():
    trending_file = os.path.join(TRENDS_FOLDER, "trending_issues.json")
    if os.path.exists(trending_file):
        try:
            with open(trending_file, "r") as f:
                content = f.read().strip()
                if not content:
                    print(f"Trending file is empty: {trending_file}")
                    return jsonify([])
                trending_issues = json.loads(content)
            print(f"Trending issues served: {trending_issues}")
            return jsonify(trending_issues)
        except json.JSONDecodeError as e:
            print(f"Error decoding trending_issues.json: {str(e)} - Returning empty list")
            return jsonify([])
    print(f"Trending file not found: {trending_file}")
    return jsonify([])

@app.route("/send-email", methods=["POST", "OPTIONS"])
@cross_origin()
def send_email():
    print("Request headers:", dict(request.headers))
    if request.method == "OPTIONS":
        print("Handling OPTIONS preflight request")
        return jsonify({}), 200
    print("Request JSON:", request.json)
    if not request.json or "to" not in request.json or "subject" not in request.json or "body" not in request.json:
        print("Error: Missing to, subject, or body")
        return jsonify({"error": "to, subject, and body are required"}), 400
    to_email = request.json["to"]
    subject = request.json["subject"]
    body = request.json["body"]
    image_path = request.json.get("image_path")
    print(f"Attempting to send email to {to_email} with subject: {subject}")
    try:
        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg.attach(MIMEText(body, 'plain'))
        if image_path and os.path.exists(image_path):
            with open(image_path, 'rb') as img_file:
                img = MIMEImage(img_file.read(), name=os.path.basename(image_path))
                msg.attach(img)
            print(f"Attached image: {image_path}")
        else:
            print("No valid image path provided or file not found")
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            print("Connecting to SMTP server...")
            server.starttls()
            print("Starting TLS...")
            print("Logging in...")
            server.login(SENDER_EMAIL, APP_PASSWORD)
            print("Sending message...")
            server.send_message(msg)
        print(f"Email sent successfully to {to_email}")
        return jsonify({"message": "Email sent successfully"}), 200
    except smtplib.SMTPAuthenticationError as auth_error:
        print(f"SMTP Authentication Error: {str(auth_error)} - Check password and Gmail settings")
        return jsonify({"error": f"Authentication failed: {str(auth_error)}"}), 500
    except smtplib.SMTPException as smtp_error:
        print(f"SMTP Error: {str(smtp_error)} - Check network or SMTP server connection")
        return jsonify({"error": f"SMTP error: {str(smtp_error)}"}), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)} - General failure in email sending process")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

def update_trending_issues():
    issues_file = os.path.join(ISSUES_FOLDER, "issues.json")
    trending_file = os.path.join(TRENDS_FOLDER, "trending_issues.json")
    if os.path.exists(issues_file):
        try:
            with open(issues_file, "r") as f:
                issues = json.load(f)
            print(f"Issues loaded for trending: {issues}")
            trending_issues = sorted(issues, key=lambda x: x.get("upvotes", 0), reverse=True)[:3]
            print(f"Top 3 trending issues: {trending_issues}")
            os.makedirs(os.path.dirname(trending_file), exist_ok=True)
            with open(trending_file, "w") as f:
                json.dump(trending_issues, f, indent=4)
            print("Trending issues updated:", trending_issues)
        except Exception as e:
            print(f"Error updating trending issues: {str(e)}")
    else:
        print(f"Issues file not found: {issues_file}")

def periodic_trending_update():
    while True:
        update_trending_issues()
        time.sleep(60)  # 1 minute interval

def email_sending_thread():
    while True:
        try:
            sender, receiver, subject, body, image_path = email_queue.get()
            send_email_notification(receiver, subject, body, image_path)
            email_queue.task_done()
        except Exception as e:
            print(f"Error in email sending thread: {str(e)}")

def send_email_notification(to_email, subject, body, image_path):
    try:
        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg.attach(MIMEText(body, 'plain'))
        if image_path and os.path.exists(image_path):
            with open(image_path, 'rb') as img_file:
                img = MIMEImage(img_file.read(), name=os.path.basename(image_path))
                msg.attach(img)
            print(f"Attached image: {image_path}")
        else:
            print("No valid image path provided or file not found")
        start_time = time.time()
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            print("Connecting to SMTP server in notification...")
            server.starttls()
            print("Starting TLS in notification...")
            print("Logging in in notification...")
            server.login(SENDER_EMAIL, APP_PASSWORD)
            print("Sending message in notification...")
            server.send_message(msg)
        print(f"Email sending took {time.time() - start_time:.2f} seconds")
        print(f"Email sent successfully to {to_email} in notification")
    except Exception as e:
        print(f"Failed to send email in notification: {str(e)}")

threading.Thread(target=email_sending_thread, daemon=True).start()
threading.Thread(target=periodic_trending_update, daemon=True).start()

@app.errorhandler(Exception)
def handle_error(error):
    print(f"Server error with traceback: {str(error)}")
    return jsonify({"error": str(error)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)