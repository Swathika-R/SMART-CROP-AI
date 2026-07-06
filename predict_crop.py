import sys
import os
import pickle
import json
import math

# Default crop centroids as inline fallback
FALLBACK_PROFILES = {
    'Rice': [80.0, 40.0, 40.0, 23.0, 82.0, 6.5, 220.0],
    'Maize': [70.0, 48.0, 20.0, 22.0, 65.0, 6.2, 80.0],
    'Chickpea': [40.0, 60.0, 80.0, 20.0, 16.0, 7.0, 80.0],
    'Kidneybeans': [20.0, 60.0, 20.0, 20.0, 21.0, 5.7, 95.0],
    'Pigeonpeas': [20.0, 68.0, 20.0, 27.0, 48.0, 5.7, 149.0],
    'Mothbeans': [20.0, 48.0, 20.0, 28.0, 65.0, 6.8, 51.0],
    'Mungbean': [20.0, 47.0, 20.0, 28.0, 85.0, 6.7, 48.0],
    'Blackgram': [40.0, 67.0, 20.0, 29.0, 65.0, 7.2, 67.0],
    'Lentil': [20.0, 68.0, 20.0, 24.0, 64.0, 5.9, 45.0],
    'Pomegranate': [20.0, 18.0, 40.0, 22.0, 90.0, 6.4, 107.0],
    'Banana': [100.0, 82.0, 50.0, 27.0, 80.0, 5.9, 100.0],
    'Mango': [20.0, 27.0, 30.0, 32.0, 50.0, 5.7, 95.0],
    'Grapes': [23.0, 132.0, 200.0, 23.0, 81.0, 6.0, 69.0],
    'Watermelon': [99.0, 18.0, 50.0, 25.0, 85.0, 6.4, 50.0],
    'Muskmelon': [100.0, 17.0, 50.0, 28.0, 92.0, 6.3, 22.0],
    'Apple': [20.0, 136.0, 200.0, 22.0, 92.0, 5.9, 112.0],
    'Orange': [20.0, 10.0, 10.0, 22.0, 92.0, 7.0, 110.0],
    'Papaya': [49.0, 59.0, 50.0, 33.0, 92.0, 6.7, 242.0],
    'Coconut': [17.0, 17.0, 30.0, 27.0, 96.0, 5.9, 220.0],
    'Cotton': [120.0, 40.0, 20.0, 23.0, 80.0, 6.9, 80.0],
    'Jute': [80.0, 40.0, 40.0, 24.0, 80.0, 6.7, 174.0],
    'Coffee': [100.0, 28.0, 30.0, 26.0, 55.0, 6.7, 150.0]
}
FALLBACK_SCALES = [140.0, 150.0, 220.0, 40.0, 100.0, 14.0, 300.0]

def predict(n, p, k, temp, hum, ph, rain, soil_type=None):
    # Load model if available
    model_path = os.path.join(os.path.dirname(__file__), '../../ml_models/crop_recommendation_model.pkl')
    centroids = FALLBACK_PROFILES
    scales = FALLBACK_SCALES
    
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
                centroids = model_data.get('centroids', FALLBACK_PROFILES)
                scales = model_data.get('scales', FALLBACK_SCALES)
        except Exception as e:
            pass # Use fallback

    input_vector = [float(n), float(p), float(k), float(temp), float(hum), float(ph), float(rain)]
    
    # Calculate distances
    scores = {}
    for crop, centroid in centroids.items():
        dist_sq = 0
        for i in range(len(input_vector)):
            # Normalize difference based on scale
            diff = (input_vector[i] - centroid[i]) / scales[i]
            dist_sq += diff * diff
        scores[crop] = math.sqrt(dist_sq)
        
    # Convert distances to suitability scores (negative exponent)
    # Smaller distance = higher suitabilty
    exp_scores = {}
    sum_exp = 0.0
    for crop, dist in scores.items():
        # Using -dist * 5 to make probability distribution steeper
        val = math.exp(-dist * 4.0)
        exp_scores[crop] = val
        sum_exp += val
        
    # Softmax probabilities
    recommendations = []
    for crop, val in exp_scores.items():
        prob = val / sum_exp
        recommendations.append((crop, prob))
        
    # Sort recommendations by probability
    recommendations.sort(key=lambda x: x[1], reverse=True)
    
    # Format top recommendations
    top_recommendations = []
    for crop, prob in recommendations[:3]:
        top_recommendations.append({
            'crop': crop,
            'confidence': round(prob * 100, 2)
        })
        
    return {
        'prediction': top_recommendations[0]['crop'],
        'confidence': top_recommendations[0]['confidence'],
        'alternatives': top_recommendations[1:],
        'input_features': {
            'nitrogen': n,
            'phosphorus': p,
            'potassium': k,
            'temperature': temp,
            'humidity': hum,
            'pH': ph,
            'rainfall': rain,
            'soil_type': soil_type or "Loamy"
        }
    }

if __name__ == '__main__':
    if len(sys.argv) < 8:
        print(json.dumps({'error': 'Insufficient arguments. Expected: N P K Temperature Humidity pH Rainfall [SoilType]'}))
        sys.exit(1)
        
    try:
        n_arg = float(sys.argv[1])
        p_arg = float(sys.argv[2])
        k_arg = float(sys.argv[3])
        temp_arg = float(sys.argv[4])
        hum_arg = float(sys.argv[5])
        ph_arg = float(sys.argv[6])
        rain_arg = float(sys.argv[7])
        soil_type_arg = sys.argv[8] if len(sys.argv) > 8 else "Loamy"
        
        result = predict(n_arg, p_arg, k_arg, temp_arg, hum_arg, ph_arg, rain_arg, soil_type_arg)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)
