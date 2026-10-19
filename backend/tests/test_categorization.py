"""
Unit tests for SpendSense Rule-Based Categorization Engine
"""

import pytest
import pandas as pd
from services.categorization import (
    categorize_description,
    categorize_dataframe,
    CATEGORY_KEYWORDS,
)


def test_categorize_description_income():
    assert categorize_description("Direct Dep - Tech Solutions Payroll") == "Income"
    assert categorize_description("Freelance UI Design Payment") == "Income"
    assert categorize_description("Dividend Reinvestment Corp") == "Income"


def test_categorize_description_housing():
    assert categorize_description("Monthly Apartment Rent Payment") == "Housing"
    assert categorize_description("Society Maintenance Charges") == "Housing"


def test_categorize_description_food_and_dining():
    assert categorize_description("Starbucks Coffee #4921") == "Food and Dining"
    assert categorize_description("Whole Foods Market Fresh Deli") == "Food and Dining"
    assert categorize_description("Swiggy Order Delivery") == "Food and Dining"
    assert categorize_description("Bistro & Grill Downtown") == "Food and Dining"


def test_categorize_description_subscriptions():
    assert categorize_description("Netflix Monthly Subscription") == "Subscriptions"
    assert categorize_description("Spotify Premium Family Plan") == "Subscriptions"
    assert categorize_description("OpenAI ChatGPT Plus Subscription") == "Subscriptions"
    assert categorize_description("GitHub Pro Subscription") == "Subscriptions"


def test_categorize_description_transport():
    assert categorize_description("Uber Trip San Francisco") == "Transportation"
    assert categorize_description("Shell Gas Station Fuel") == "Transportation"
    assert categorize_description("Metro Rail Card Recharge") == "Transportation"


def test_categorize_description_fallback():
    assert categorize_description("Unrecognized Corp XYZ789") == "Other"
    assert categorize_description("", fallback="Unassigned") == "Unassigned"


def test_categorize_dataframe():
    df = pd.DataFrame([
        {"description": "Whole Foods Grocery", "category": ""},
        {"description": "Airtel Fiber Broadband", "category": None},
        {"description": "Custom Vendor", "category": "Shopping"},  # Preserves valid existing
    ])
    result_df = categorize_dataframe(df)
    categories = result_df["category"].tolist()
    assert categories[0] == "Food and Dining"
    assert categories[1] == "Utilities"
    assert categories[2] == "Shopping"
