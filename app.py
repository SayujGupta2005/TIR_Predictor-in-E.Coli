from flask import Flask, render_template, send_from_directory, request, jsonify
import os
from predictor import calculateInitiationRate
from optimize_utr import optimize_sequence

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/templates/<path:filename>')
def serve_template_file(filename):
    return send_from_directory(app.template_folder, filename)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        utr = data.get('utr', '').strip().upper()
        cds = data.get('cds', '').strip().upper()

        # Validate inputs
        if not utr or not cds:
            return jsonify({'error': 'UTR and CDS sequences are required'}), 400
        if not all(c in 'ATGC' for c in utr + cds):
            return jsonify({'error': 'Sequences must contain only A, T, G, C'}), 400

        # Calculate initiation rate
        predicted_rate = calculateInitiationRate(utr, cds)
        return jsonify({'predictedRate': round(predicted_rate, 4)})
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/optimize', methods=['POST'])
def optimize():
    try:
        data = request.json
        utr = data.get('utr', '').strip().upper()
        cds = data.get('cds', '').strip().upper()
        target_rate = data.get('targetRate')
        iterations = data.get('iterations', 1000)

        # Validate inputs
        if not utr or not cds:
            return jsonify({'error': 'UTR and CDS sequences are required'}), 400
        if not all(c in 'ATGC' for c in utr + cds):
            return jsonify({'error': 'Sequences must contain only A, T, G, C'}), 400
        try:
            target_rate = float(target_rate)
            iterations = int(iterations)
            if target_rate < 0 or target_rate > 1:
                return jsonify({'error': 'Target rate must be between 0 and 1'}), 400
            if iterations < 100 or iterations > 10000:
                return jsonify({'error': 'Iterations must be between 100 and 10000'}), 400
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid target rate or iterations'}), 400

        # Perform optimization
        result = optimize_sequence(utr, cds, target_rate, iterations)
        return jsonify({
            'optimizedUTR': result['optimized_utr'],
            'predictedRate': result['predicted_initiation_rate']
        })
    except Exception as e:
        return jsonify({'error': f'Optimization failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("Static files:", os.listdir('static'))
    print("Template files:", os.listdir('templates'))
    app.run(debug=True)