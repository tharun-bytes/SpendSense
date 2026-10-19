"""
SpendSense Rule-Based Categorization Engine
Maps transaction descriptions to personal finance categories deterministically.
"""

import re
from typing import Dict, List, Optional

CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "Income": [
        "salary", "payroll", "direct dep", "dividend", "interest earned",
        "freelance", "stipend", "bonus", "honorarium", "cashback", "consulting fee"
    ],
    "Housing": [
        "rent", "mortgage", "apartment", "society maintenance", "hoa fee",
        "landlord", "lease payment", "property tax", "housing"
    ],
    "Utilities": [
        "electricity", "power bill", "water bill", "utility", "broadband",
        "fiber", "wifi", "internet", "gas bill", "cylinder", "airtel",
        "jio", "verizon", "at&t", "t-mobile", "vodafone"
    ],
    "Food and Dining": [
        "restaurant", "cafe", "coffee", "starbucks", "swiggy", "zomato",
        "uber eats", "doordash", "grocery", "supermarket", "bakery",
        "bistro", "diner", "pizza", "burger", "mcdonald", "subway",
        "nature basket", "whole foods", "trader joe", "dmart", "blinkit",
        "instamart", "zepto", "food", "kitchen", "bar & grill"
    ],
    "Transportation": [
        "uber", "lyft", "ola", "grab", "taxi", "cab", "metro", "subway",
        "transit", "bus fare", "train", "railway", "fuel", "gas station",
        "petrol", "diesel", "shell", "chevron", "bp", "parking", "toll",
        "fastag"
    ],
    "Shopping": [
        "amazon", "flipkart", "walmart", "target", "zara", "h&m", "nike",
        "adidas", "uniqlo", "myntra", "apple store", "best buy", "ebay",
        "clothing", "apparel", "furniture", "ikea", "electronics", "mall"
    ],
    "Subscriptions": [
        "netflix", "spotify", "youtube premium", "prime video", "apple music",
        "disney", "hulu", "hbo", "hotstar", "audible", "chatgpt", "openai",
        "github", "figma", "notion", "medium", "substack", "cloud storage",
        "icloud", "google one", "playstation plus", "xbox game pass"
    ],
    "Entertainment": [
        "cinema", "movie", "theater", "theatre", "imax", "pvr", "inox",
        "concert", "ticketmaster", "bookmyshow", "bowling", "arcade",
        "gaming", "steam", "nintendo", "theme park"
    ],
    "Healthcare": [
        "pharmacy", "medical", "clinic", "hospital", "doctor", "dental",
        "dentist", "optometry", "eyecare", "apollo", "cvs", "walgreens",
        "gym", "fitness", "yoga", "lab test", "diagnostics"
    ],
    "Education": [
        "tuition", "school", "college", "university", "coursera", "udemy",
        "edx", "udacity", "books", "course fee", "textbook", "training",
        "exam fee", "certification"
    ],
    "Travel": [
        "airline", "airways", "flight", "indigo", "air india", "delta",
        "united airlines", "emirates", "hotel", "resort", "airbnb",
        "booking.com", "expedia", "makemytrip", "hostel", "tour"
    ]
}

def categorize_description(description: str, fallback: str = "Other") -> str:
    """
    Categorize a transaction based on normalized keywords.
    """
    if not description or not isinstance(description, str):
        return fallback

    norm_desc = re.sub(r"[^a-zA-Z0-9\s]", " ", description.lower())

    # Check for direct income indicators first
    for kw in CATEGORY_KEYWORDS["Income"]:
        if re.search(r"\b" + re.escape(kw) + r"\b", norm_desc):
            return "Income"

    # Check all other categories
    for category, keywords in CATEGORY_KEYWORDS.items():
        if category == "Income":
            continue
        for kw in keywords:
            if re.search(r"\b" + re.escape(kw) + r"\b", norm_desc):
                return category

    return fallback


def categorize_dataframe(df, description_col: str = "description", category_col: str = "category"):
    """
    Apply rule-based categorization to a DataFrame.
    Preserves existing non-empty categories if already valid.
    """
    valid_categories = set(CATEGORY_KEYWORDS.keys()).union({"Other"})

    def resolve_cat(row):
        existing = str(row.get(category_col, "")).strip() if category_col in row else ""
        if existing and existing.lower() not in ["", "none", "nan", "null", "unknown", "other"]:
            # Title case check
            matched = next((c for c in valid_categories if c.lower() == existing.lower()), None)
            if matched:
                return matched
        # Otherwise auto-categorize
        desc = str(row.get(description_col, ""))
        return categorize_description(desc)

    df[category_col] = df.apply(resolve_cat, axis=1)
    return df
