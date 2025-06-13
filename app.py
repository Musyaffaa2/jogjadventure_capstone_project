import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from sklearn.metrics.pairwise import cosine_similarity
import joblib

# Inisialisasi aplikasi Flask
app = Flask(__name__)
CORS(app) # Mengizinkan Cross-Origin Resource Sharing (agar bisa diakses frontend)

# --- MEMUAT SEMUA ARTEFAK MODEL ---
try:
    # Memuat data inferensi
    df = pd.read_csv('Rekomendasi/tourism_data_final_for_inference.csv')
    
    # Memuat model encoder
    encoder = tf.keras.models.load_model('Rekomendasi/tourism_encoder.h5')
    
    # Memuat vectorizer dan scaler
    tfidf = joblib.load('Rekomendasi/tfidf_vectorizer.joblib')
    scaler = joblib.load('Rekomendasi/scaler.joblib')
    
    print("Semua model dan data berhasil dimuat.")

except Exception as e:
    print(f"Error saat memuat model atau data: {e}")


# --- PREPROCESSING DATA UNTUK INFERENSI ---
# Gabungkan fitur teks
df['Content_String'] = df['Place_Name'] + ' ' + df['Description'] + ' ' + df['Category'] + ' ' + df['City']

# Vektorisasi teks dan scaling fitur numerik
tfidf_matrix = tfidf.transform(df['Content_String'])
scaled_features = scaler.transform(df[['Price', 'Rating']])

# Gabungkan semua fitur
combined_features = np.hstack([tfidf_matrix.toarray(), scaled_features])

# Hasilkan embedding untuk semua data menggunakan encoder
all_embeddings = encoder.predict(combined_features)

@app.route('/recommend', methods=['POST'])
def recommend():
    # Ambil nama tempat wisata dari request JSON
    data = request.get_json()
    place_name = data.get('place_name')

    if not place_name:
        return jsonify({'error': 'Nama tempat wisata tidak boleh kosong'}), 400

    try:
        # Cari index dari tempat wisata yang diinput
        place_index = df[df['Place_Name'].str.lower() == place_name.lower()].index[0]
        
        # Ambil embedding dari tempat wisata tersebut
        place_embedding = all_embeddings[place_index].reshape(1, -1)
        
        # Hitung cosine similarity dengan semua tempat wisata lain
        similarities = cosine_similarity(place_embedding, all_embeddings)
        
        # Urutkan tempat wisata berdasarkan similarity
        similar_indices = similarities.argsort()[0][-11:-1][::-1] # Ambil top 10 (selain dirinya sendiri)
        
        # Siapkan hasil rekomendasi
        recommendations = df.iloc[similar_indices]

        # Ubah ke format JSON dan kembalikan
        return jsonify(recommendations.to_dict('records'))

    except IndexError:
        return jsonify({'error': f'Tempat wisata "{place_name}" tidak ditemukan'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Jalankan server
if __name__ == '__main__':
    app.run(debug=True, port=5000)