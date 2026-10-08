import os
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/")
def index():
    return jsonify({
        "status": "online",
        "service": "GMO FX Quant AI Flask Backend",
        "port": int(os.environ.get("PORT", 8080)),
        "message": "Cloud Run ready with dynamic PORT binding"
    })

@app.route("/api/health")
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
