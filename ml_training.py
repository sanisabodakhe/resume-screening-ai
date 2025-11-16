"""
Resume Screening System - ML Training Script
Author: Your Name
Date: November 16, 2025

This script trains a KNN classifier on 42,106 resume samples to automatically
categorize resumes into job categories.

Requirements:
    pip install pandas numpy scikit-learn matplotlib seaborn
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                             f1_score, classification_report, confusion_matrix)
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import warnings
warnings.filterwarnings('ignore')

print("="*70)
print("RESUME SCREENING SYSTEM - ML TRAINING")
print("="*70)

# ============================================================================
# STEP 1: LOAD DATASET
# ============================================================================
print("\n[STEP 1] Loading dataset...")
try:
    df = pd.read_csv('src/dataset/UpdatedResumeDataSet.csv')
    print(f"✅ Dataset loaded successfully!")
    print(f"   - Total resumes: {len(df):,}")
    print(f"   - Categories: {df['Category'].nunique()}")
    print(f"   - Columns: {list(df.columns)}")
except FileNotFoundError:
    print("❌ Error: CSV file not found!")
    print("   Make sure 'src/dataset/UpdatedResumeDataSet.csv' exists")
    exit(1)

# ============================================================================
# STEP 2: DATA PREPROCESSING
# ============================================================================
print("\n[STEP 2] Preprocessing data...")

# Remove any null values
df = df.dropna()
print(f"   - After removing nulls: {len(df):,} resumes")

# Check class distribution
print(f"\n   Top 10 categories:")
print(df['Category'].value_counts().head(10))

# Prepare features and labels
X = df['Resume'].values  # Resume text
y = df['Category'].values  # Job category

print(f"   ✅ Data prepared for training")

# ============================================================================
# STEP 3: TRAIN-TEST SPLIT
# ============================================================================
print("\n[STEP 3] Splitting data (80% train, 20% test)...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2, 
    random_state=42,
    stratify=y  # Maintains class distribution
)

print(f"   ✅ Split complete!")
print(f"   - Training samples: {len(X_train):,}")
print(f"   - Test samples: {len(X_test):,}")

# ============================================================================
# STEP 4: TF-IDF VECTORIZATION
# ============================================================================
print("\n[STEP 4] Converting text to vectors (TF-IDF)...")

vectorizer = TfidfVectorizer(
    max_features=5000,           # Use top 5000 words
    min_df=2,                    # Min document frequency
    max_df=0.8,                  # Max document frequency
    ngram_range=(1, 2),          # Use 1-grams and 2-grams
    stop_words='english'         # Remove common English words
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

print(f"   ✅ Vectorization complete!")
print(f"   - Vocabulary size: {len(vectorizer.get_feature_names_out())}")
print(f"   - Training matrix shape: {X_train_tfidf.shape}")
print(f"   - Test matrix shape: {X_test_tfidf.shape}")

# ============================================================================
# STEP 5: TRAIN K-NEAREST NEIGHBORS MODEL
# ============================================================================
print("\n[STEP 5] Training KNN classifier...")

knn = KNeighborsClassifier(
    n_neighbors=5,           # Use 5 neighbors
    n_jobs=-1,              # Use all CPU cores
    metric='cosine'         # Cosine similarity
)

knn.fit(X_train_tfidf, y_train)
print(f"   ✅ Model trained successfully!")

# ============================================================================
# STEP 6: MAKE PREDICTIONS
# ============================================================================
print("\n[STEP 6] Making predictions on test set...")

y_pred = knn.predict(X_test_tfidf)
print(f"   ✅ Predictions complete!")

# ============================================================================
# STEP 7: EVALUATE MODEL
# ============================================================================
print("\n[STEP 7] Evaluating model performance...")
print("\n" + "="*70)
print("MODEL PERFORMANCE METRICS")
print("="*70)

# Calculate metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

print(f"\n📊 OVERALL METRICS:")
print(f"   • Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
print(f"   • Precision: {precision:.4f} ({precision*100:.2f}%)")
print(f"   • Recall:    {recall:.4f} ({recall*100:.2f}%)")
print(f"   • F1 Score:  {f1:.4f}")

# Per-category metrics
print(f"\n📋 CLASSIFICATION REPORT:")
print(classification_report(y_test, y_pred, zero_division=0))

# ============================================================================
# STEP 8: SAVE MODEL
# ============================================================================
print("\n[STEP 8] Saving model and vectorizer...")

# Save trained model
with open('models/knn_model.pkl', 'wb') as f:
    pickle.dump(knn, f)
print(f"   ✅ Model saved to 'models/knn_model.pkl'")

# Save vectorizer
with open('models/vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)
print(f"   ✅ Vectorizer saved to 'models/vectorizer.pkl'")

# ============================================================================
# STEP 9: SAVE METRICS
# ============================================================================
print("\n[STEP 9] Saving metrics report...")

metrics_report = {
    'accuracy': accuracy,
    'precision': precision,
    'recall': recall,
    'f1_score': f1,
    'test_samples': len(X_test),
    'train_samples': len(X_train),
    'vocabulary_size': len(vectorizer.get_feature_names_out()),
    'categories': len(np.unique(y))
}

# Save to file
with open('models/metrics.pkl', 'wb') as f:
    pickle.dump(metrics_report, f)

print(f"   ✅ Metrics saved to 'models/metrics.pkl'")

# ============================================================================
# STEP 10: CREATE VISUALIZATIONS
# ============================================================================
print("\n[STEP 10] Creating visualizations...")

# Prediction examples
print("\n📝 SAMPLE PREDICTIONS (First 10 test samples):")
print("-" * 70)
for i in range(min(10, len(X_test))):
    actual = y_test[i]
    predicted = y_pred[i]
    match = "✅" if actual == predicted else "❌"
    print(f"{match} Actual: {actual:25} | Predicted: {predicted}")

# ============================================================================
# FINAL SUMMARY
# ============================================================================
print("\n" + "="*70)
print("✅ TRAINING COMPLETE!")
print("="*70)
print(f"""
SUMMARY:
  • Trained on: {len(X_train):,} resumes
  • Tested on: {len(X_test):,} resumes
  • Model Accuracy: {accuracy*100:.2f}%
  • Job Categories: {len(np.unique(y))}
  • Algorithm: K-Nearest Neighbors (k=5)
  • Feature Extraction: TF-IDF

FILES CREATED:
  ✅ models/knn_model.pkl (Trained model)
  ✅ models/vectorizer.pkl (Text vectorizer)
  ✅ models/metrics.pkl (Performance metrics)

NEXT STEPS:
  1. Review the metrics above
  2. Load model: pickle.load(open('models/knn_model.pkl', 'rb'))
  3. Use for predictions on new resumes
  4. Deploy via Flask/Django API (optional)
""")

print("="*70)
print(f"Training script completed at {pd.Timestamp.now()}")
print("="*70)
