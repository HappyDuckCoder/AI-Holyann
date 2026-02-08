#!/usr/bin/env python3
"""
Create a mock MBTI model file for Django AI server
This creates a simple Keras model that can be loaded without errors
"""

try:
    import tensorflow as tf
    from tensorflow import keras
    import numpy as np
    import os

    # Create a simple sequential model for MBTI prediction
    model = keras.Sequential([
        keras.layers.Dense(64, activation='relu', input_shape=(40,)),  # 40 MBTI questions
        keras.layers.Dropout(0.2),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(16, activation='relu'),
        keras.layers.Dense(8, activation='softmax')  # 8 outputs for MBTI dimensions
    ])

    # Compile the model
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    # Create some dummy training data to initialize weights
    dummy_X = np.random.rand(100, 40)  # 100 samples, 40 features
    dummy_y = np.random.rand(100, 8)   # 100 samples, 8 outputs

    # Train for 1 epoch just to initialize weights properly
    model.fit(dummy_X, dummy_y, epochs=1, verbose=0)

    # Save the model
    model_path = "D:/server-ai/holyann/hoexapp/module/feature2/config/Personality_Model.h5"
    model.save(model_path)

    print(f"✅ Mock MBTI model created successfully at: {model_path}")
    print(f"📊 Model summary:")
    model.summary()

    # Test loading the model
    loaded_model = keras.models.load_model(model_path)
    print("✅ Model can be loaded successfully")

    # Test prediction with sample data
    sample_input = np.random.rand(1, 40)
    prediction = loaded_model.predict(sample_input, verbose=0)
    print(f"✅ Sample prediction works: {prediction.shape}")

except ImportError as e:
    print("❌ TensorFlow not installed. Installing...")
    import subprocess
    import sys

    # Try to install tensorflow
    subprocess.check_call([sys.executable, "-m", "pip", "install", "tensorflow"])
    print("✅ TensorFlow installed. Please run this script again.")

except Exception as e:
    print(f"❌ Error creating model: {e}")
    print("💡 Alternative: Create a simple placeholder file")

    # Create a minimal placeholder file
    placeholder_path = "D:/server-ai/holyann/hoexapp/module/feature2/config/Personality_Model.h5"
    with open(placeholder_path, 'wb') as f:
        f.write(b'PLACEHOLDER_MODEL_FILE')

    print(f"⚠️  Created placeholder file at: {placeholder_path}")
    print("⚠️  Django will need to handle this gracefully")
