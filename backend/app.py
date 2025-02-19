from datetime import datetime
from flask import Flask, request, jsonify
from google.cloud import firestore
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Initialize Firestore Client
db = firestore.Client(database="glenview-data")

# Firestore Collection Name
COLLECTION_NAME = "glenview-data"

@app.route('/store_data', methods=['POST'])
def store_data():
    try:
        data = request.json.get("data", [])
        current_timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

        for entry in data:
            city_name = entry.get("city")
            if not city_name:
                continue

            # Get existing document reference
            doc_ref = db.collection(COLLECTION_NAME).document(city_name)
            
            # Get existing data
            doc = doc_ref.get()
            
            if doc.exists:
                # If document exists, only update previousData and currentLevels
                existing_data = doc.to_dict()
                existing_previous_data = existing_data.get('previousData', [])
                
                # Add new previous data to existing data
                new_previous_data = existing_previous_data + entry.get('previousData', [])
                
                # Update document with combined data
                update_data = {
                    'previousData': new_previous_data,
                    'currentLevels': entry.get('currentLevels')
                }
                
                doc_ref.update(update_data)
            else:
                # If document doesn't exist, create it with all data
                doc_ref.set(entry)

        return jsonify({"message": "Data stored successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    # try:
    #     data = request.json.get("data", [])

    #     for entry in data:
    #         city_name = entry.get("city")
    #         if not city_name:
    #             continue  # Skip invalid entries

    #         # Store data in Firestore with city name as document ID
    #         doc_ref = db.collection(COLLECTION_NAME).document(city_name)
    #         doc_ref.set(entry)

    #     return jsonify({"message": "Data stored successfully"}), 200

    # except Exception as e:
    #     return jsonify({"error": str(e)}), 500


@app.route('/retrieve_data', methods=['GET'])
def retrieve_data():
    try:
        docs = db.collection(COLLECTION_NAME).stream()
        data = [{doc.id: doc.to_dict()} for doc in docs]

        return jsonify({"data": data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/retrieve_city_data', methods=['GET'])
def retrieve_city_data():
    try:
        city_name = request.args.get('city')  # Get city name from query parameter

        if city_name:
            # Retrieve data for a specific city
            doc_ref = db.collection(COLLECTION_NAME).document(city_name)
            doc = doc_ref.get()

            if doc.exists:
                return jsonify({city_name: doc.to_dict()}), 200
            else:
                return jsonify({"error": "City not found"}), 404
        else:
            # Retrieve all data
            docs = db.collection(COLLECTION_NAME).stream()
            data = [{doc.id: doc.to_dict()} for doc in docs]
            return jsonify({"data": data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))  # Get PORT from environment variables
    app.run(host='0.0.0.0', port=port)  # Ensure Flask listens on all interfaces (Cloud Run requirement)
