"""
Synthetic Historical Dataset Generator for FoodBridge AI
Generates realistic food surplus patterns for restaurants/cafeterias/hostels
and demand patterns for NGOs in Delhi NCR.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

np.random.seed(42)

RESTAURANT_TYPES = ['FINE_DINING', 'CASUAL_DINING', 'BUFFET', 'COLLEGE_HOSTEL', 'BANQUET_HALL', 'CAFETERIA']
FOOD_CATEGORIES = ['COOKED_MEALS', 'RAW_PRODUCE', 'BAKERY', 'PACKAGED_GOODS', 'DAIRY']
NGO_TYPES = ['SHELTER_HOME', 'COMMUNITY_KITCHEN', 'ORPHANAGE', 'OLD_AGE_HOME', 'MOBILE_FOOD_BANK']

def generate_surplus_data(num_samples: int = 2500) -> pd.DataFrame:
    """Generate realistic surplus dataset."""
    base_date = datetime(2025, 1, 1)
    records = []

    for i in range(num_samples):
        current_date = base_date + timedelta(days=(i % 365))
        day_of_week = current_date.weekday() # 0 = Monday, 6 = Sunday
        month = current_date.month
        rest_type = np.random.choice(RESTAURANT_TYPES, p=[0.2, 0.25, 0.15, 0.15, 0.15, 0.1])
        category = np.random.choice(FOOD_CATEGORIES, p=[0.5, 0.2, 0.15, 0.1, 0.05])
        
        # Weekend effect
        is_weekend = 1 if day_of_week in [4, 5, 6] else 0
        has_event = 1 if np.random.random() < 0.18 else 0
        is_holiday = 1 if np.random.random() < 0.08 else 0

        # Base customer volume based on type
        base_customers = {
            'FINE_DINING': 120,
            'CASUAL_DINING': 220,
            'BUFFET': 350,
            'COLLEGE_HOSTEL': 600,
            'BANQUET_HALL': 450,
            'CAFETERIA': 280
        }[rest_type]

        # Multiplier
        mult = 1.0 + (0.35 if is_weekend else 0) + (0.5 if has_event else 0) - (0.2 if is_holiday and rest_type == 'COLLEGE_HOSTEL' else 0)
        expected_customers = int(base_customers * mult + np.random.normal(0, 25))
        expected_customers = max(30, expected_customers)

        # Prepared food (kg)
        kg_per_customer = 0.55 if category == 'COOKED_MEALS' else (0.25 if category == 'RAW_PRODUCE' else 0.18)
        food_prepared_kg = expected_customers * kg_per_customer * (1.15 + np.random.uniform(-0.05, 0.12))

        # Actual sales / consumption variance
        sold_fraction = np.random.beta(a=8, b=2) # Mean ~ 0.80
        if has_event and np.random.random() < 0.3:
            sold_fraction *= 0.75 # Sudden event cancellations / no-shows
        
        food_sold_kg = food_prepared_kg * min(0.95, sold_fraction)
        surplus_kg = max(0.5, round(food_prepared_kg - food_sold_kg, 1))

        records.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'day_of_week': day_of_week,
            'month': month,
            'restaurant_type': rest_type,
            'food_category': category,
            'expected_customers': expected_customers,
            'has_event': has_event,
            'is_holiday': is_holiday,
            'food_prepared_kg': round(food_prepared_kg, 1),
            'food_sold_kg': round(food_sold_kg, 1),
            'surplus_kg': surplus_kg
        })

    return pd.DataFrame(records)

def generate_demand_data(num_samples: int = 2500) -> pd.DataFrame:
    """Generate realistic NGO demand dataset."""
    base_date = datetime(2025, 1, 1)
    records = []

    for i in range(num_samples):
        current_date = base_date + timedelta(days=(i % 365))
        day_of_week = current_date.weekday()
        ngo_type = np.random.choice(NGO_TYPES, p=[0.25, 0.3, 0.2, 0.15, 0.1])
        category = np.random.choice(FOOD_CATEGORIES, p=[0.6, 0.2, 0.1, 0.05, 0.05])
        is_weekend = 1 if day_of_week in [5, 6] else 0
        scheduled_drive = 1 if np.random.random() < 0.25 else 0

        base_people = {
            'SHELTER_HOME': 90,
            'COMMUNITY_KITCHEN': 350,
            'ORPHANAGE': 60,
            'OLD_AGE_HOME': 45,
            'MOBILE_FOOD_BANK': 400
        }[ngo_type]

        people_served = int(base_people * (1.3 if scheduled_drive else 1.0) + np.random.normal(0, 15))
        people_served = max(20, people_served)

        # Standard meal need: 0.40 kg per person per meal for cooked food
        ratio = 0.40 if category == 'COOKED_MEALS' else (0.25 if category == 'RAW_PRODUCE' else 0.15)
        demand_kg = round(people_served * ratio * np.random.uniform(0.9, 1.15), 1)
        meals = int(demand_kg * 2.5)

        records.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'day_of_week': day_of_week,
            'ngo_type': ngo_type,
            'food_category': category,
            'people_served': people_served,
            'is_weekend': is_weekend,
            'scheduled_drive': scheduled_drive,
            'demand_kg': demand_kg,
            'meals_needed': meals
        })

    return pd.DataFrame(records)

if __name__ == '__main__':
    surplus_df = generate_surplus_data(2000)
    demand_df = generate_demand_data(2000)
    surplus_df.to_csv('surplus_history.csv', index=False)
    demand_df.to_csv('demand_history.csv', index=False)
    print(f"Generated {len(surplus_df)} surplus records and {len(demand_df)} demand records.")
