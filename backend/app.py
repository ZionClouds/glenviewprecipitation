from flask import Flask, request, jsonify
from google.cloud import firestore
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Initialize Firestore Client
db = firestore.Client()

# Firestore Collection Name
COLLECTION_NAME = "glenview-data"

@app.route('/store_data', methods=['POST'])
def store_data():
    try:
        data = request.json.get("data", [])

        for entry in data:
            city_name = entry.get("city")
            if not city_name:
                continue  # Skip invalid entries

            # Store data in Firestore with city name as document ID
            doc_ref = db.collection(COLLECTION_NAME).document(city_name)
            doc_ref.set(entry)

        return jsonify({"message": "Data stored successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/retrieve_data', methods=['GET'])
def retrieve_data():
    try:
        docs = db.collection(COLLECTION_NAME).stream()
        data = [{doc.id: doc.to_dict()} for doc in docs]

        return jsonify({"data": data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))  # Get PORT from environment variables
    app.run(host='0.0.0.0', port=port)  # Ensure Flask listens on all interfaces (Cloud Run requirement)
