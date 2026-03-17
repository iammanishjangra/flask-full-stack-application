import os
import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for frontend-backend communication
CORS(app)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            # host=os.getenv('DB_HOST', 'localhost'),
            # user=os.getenv('DB_USER', 'root'),
            # password=os.getenv('DB_PASSWORD', 'rootpassword'), # Yahan apna actual password daliye
            # database=os.getenv('DB_NAME', 'app_db')
            host='localhost',
            user='root',
            password='rootpassword',
            database='app_db'
        )
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({"status": "Backend is running successfully!"})

@app.route('/api/messages', methods=['GET'])
def get_messages():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM messages ORDER BY created_at DESC;")
    messages = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(messages)

@app.route('/api/messages', methods=['POST'])
def add_message():
    data = request.get_json()
    if not data or 'content' not in data:
        return jsonify({"error": "Invalid request, 'content' is required"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    cursor = conn.cursor()
    query = "INSERT INTO messages (content) VALUES (%s)"
    cursor.execute(query, (data['content'],))
    conn.commit()
    
    new_id = cursor.lastrowid
    
    cursor.close()
    conn.close()
    
    return jsonify({"message": "Message added successfully", "id": new_id}), 201

if __name__ == '__main__':
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)
