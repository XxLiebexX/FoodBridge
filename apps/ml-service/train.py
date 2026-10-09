"""
Model Training Pipeline for FoodBridge AI
Trains GradientBoosting / RandomForest regressors with scikit-learn pipelines.
Saves serialized models and evaluation metrics (MAE, RMSE, R^2).
"""

import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from dataset import generate_surplus_data, generate_demand_data

def train_surplus_model():
    print("Generating surplus training dataset...")
    df = generate_surplus_data(3000)

    features = ['restaurant_type', 'food_category', 'day_of_week', 'month', 'expected_customers', 'has_event', 'is_holiday']
    target = 'surplus_kg'

    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    categorical_features = ['restaurant_type', 'food_category']
    numerical_features = ['day_of_week', 'month', 'expected_customers', 'has_event', 'is_holiday']

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', StandardScaler(), numerical_features)
        ]
    )

    model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=5, learning_rate=0.08, random_state=42))
    ])

    print("Fitting surplus model...")
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)

    metrics = {
        'model_name': 'GradientBoosting Surplus Regressor',
        'mae': round(float(mae), 3),
        'rmse': round(float(rmse), 3),
        'r2_score': round(float(r2), 3),
        'trained_at': pd.Timestamp.now().isoformat()
    }

    joblib.dump(model, 'surplus_model.joblib')
    print(f"Surplus Model Saved. Metrics: MAE={mae:.2f} kg, RMSE={rmse:.2f} kg, R^2={r2:.3f}")
    return metrics

def train_demand_model():
    print("Generating NGO demand training dataset...")
    df = generate_demand_data(3000)

    features = ['ngo_type', 'food_category', 'day_of_week', 'people_served', 'is_weekend', 'scheduled_drive']
    target = 'demand_kg'

    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    categorical_features = ['ngo_type', 'food_category']
    numerical_features = ['day_of_week', 'people_served', 'is_weekend', 'scheduled_drive']

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', StandardScaler(), numerical_features)
        ]
    )

    model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42))
    ])

    print("Fitting NGO demand model...")
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)

    metrics = {
        'model_name': 'RandomForest NGO Demand Regressor',
        'mae': round(float(mae), 3),
        'rmse': round(float(rmse), 3),
        'r2_score': round(float(r2), 3),
        'trained_at': pd.Timestamp.now().isoformat()
    }

    joblib.dump(model, 'demand_model.joblib')
    print(f"Demand Model Saved. Metrics: MAE={mae:.2f} kg, RMSE={rmse:.2f} kg, R^2={r2:.3f}")
    return metrics

if __name__ == '__main__':
    surplus_metrics = train_surplus_model()
    demand_metrics = train_demand_model()
    with open('metrics.json', 'w') as f:
        json.dump({'surplus': surplus_metrics, 'demand': demand_metrics}, f, indent=2)
    print("All models trained and metrics recorded.")
