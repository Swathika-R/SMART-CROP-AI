import os
import pickle

# Define crop profiles based on optimal conditions
CROP_PROFILES = {
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

FEATURE_SCALES = [140.0, 150.0, 220.0, 40.0, 100.0, 14.0, 300.0] # N, P, K, temp, humidity, pH, rainfall
FEATURE_NAMES = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'pH', 'rainfall']

def main():
    model_data = {
        'centroids': CROP_PROFILES,
        'scales': FEATURE_SCALES,
        'feature_names': FEATURE_NAMES
    }
    
    # Ensure models directory exists
    model_dir = os.path.join(os.path.dirname(__file__), '../../ml_models')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'crop_recommendation_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)
        
    print(f"Success: Model saved to {model_path}")

if __name__ == '__main__':
    main()
