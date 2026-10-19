"""
Generate 5 high-fidelity financial analytics assets for the SpendSense Motion Parallax Gallery.
Dimensions: 600x800 px (scaled cleanly to 300x400 cards).
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "photos", "spendsense")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Helper to draw rounded rectangle with gradient border
def create_card_base(title: str, subtitle: str, stage_tag: str):
    img = Image.new("RGBA", (600, 800), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    # Dark background gradient
    for y in range(800):
        shade = int(5 + (y / 800) * 15)
        draw.line([(0, y), (600, y)], fill=(shade, shade, shade, 255))

    # Glass container border
    draw.rounded_rectangle([(20, 20), (580, 780)], radius=24, outline=(255, 255, 255, 45), width=2)
    draw.rounded_rectangle([(22, 22), (578, 778)], radius=22, fill=(12, 12, 14, 230))

    # Inner subtle glow
    draw.line([(30, 24), (570, 24)], fill=(255, 255, 255, 120), width=1)

    # Header section
    draw.rounded_rectangle([(40, 45), (180, 75)], radius=12, fill=(255, 255, 255, 20), outline=(255, 255, 255, 50))
    draw.text((55, 52), stage_tag, fill=(255, 255, 255, 240))

    draw.text((40, 95), title, fill=(255, 255, 255, 255))
    draw.text((40, 130), subtitle, fill=(160, 160, 170, 220))
    draw.line([(40, 165), (560, 165)], fill=(255, 255, 255, 25), width=1)

    return img, draw


def generate_image_1():
    # Stage #001: Understand Your Spending
    img, draw = create_card_base(
        title="EXECUTIVE FINANCIAL METRICS",
        subtitle="Gross inflows, disbursements & capital retention rate",
        stage_tag="STAGE 01 // CASHFLOW"
    )

    # Inflow Card
    draw.rounded_rectangle([(40, 190), (560, 290)], radius=16, fill=(18, 26, 20, 240), outline=(52, 211, 153, 90), width=1)
    draw.text((60, 205), "TOTAL INFLOW (6 MONTHS)", fill=(110, 231, 183, 220))
    draw.text((60, 235), "₹5,80,000.00", fill=(255, 255, 255, 255))

    # Outflow Card
    draw.rounded_rectangle([(40, 310), (560, 410)], radius=16, fill=(30, 18, 22, 240), outline=(251, 113, 133, 90), width=1)
    draw.text((60, 325), "TOTAL EXPENDITURES", fill=(253, 164, 175, 220))
    draw.text((60, 355), "₹3,28,683.50", fill=(255, 255, 255, 255))

    # Net Cash Flow & Savings Rate
    draw.rounded_rectangle([(40, 430), (290, 560)], radius=16, fill=(20, 20, 26, 240), outline=(255, 255, 255, 40), width=1)
    draw.text((60, 445), "NET SURPLUS", fill=(180, 180, 190, 200))
    draw.text((60, 480), "₹2,51,316.50", fill=(52, 211, 153, 255))
    draw.text((60, 520), "+43.3% Capital Kept", fill=(110, 231, 183, 200))

    draw.rounded_rectangle([(310, 430), (560, 560)], radius=16, fill=(20, 20, 26, 240), outline=(255, 255, 255, 40), width=1)
    draw.text((330, 445), "SAVINGS RATE", fill=(180, 180, 190, 200))
    draw.text((330, 480), "43.33%", fill=(255, 255, 255, 255))
    draw.text((330, 520), "Benchmark: >20.0%", fill=(150, 150, 160, 200))

    # Velocity Waveform
    draw.text((40, 595), "30-DAY DISBURSEMENT VELOCITY", fill=(160, 160, 175, 200))
    draw.rounded_rectangle([(40, 625), (560, 745)], radius=16, fill=(15, 15, 18, 240), outline=(255, 255, 255, 30))

    # Simulated sparkline points
    points = [
        (60, 710), (90, 680), (120, 695), (150, 650), (180, 660),
        (210, 720), (240, 670), (270, 640), (300, 660), (330, 630),
        (360, 700), (390, 660), (420, 680), (450, 650), (480, 640),
        (510, 680), (540, 660)
    ]
    for i in range(len(points) - 1):
        draw.line([points[i], points[i+1]], fill=(52, 211, 153, 240), width=3)
        draw.ellipse([(points[i][0]-3, points[i][1]-3), (points[i][0]+3, points[i][1]+3)], fill=(255, 255, 255, 255))

    img.save(os.path.join(OUTPUT_DIR, "1.png"))


def generate_image_2():
    # Stage #002: Explore Expense Categories
    img, draw = create_card_base(
        title="CATEGORY ALLOCATION SPECTRUM",
        subtitle="11 deterministic sectors & portfolio weight",
        stage_tag="STAGE 02 // SECTORS"
    )

    categories = [
        ("Housing (Rent & Society)", "₹1,32,000", "40.2%", (255, 255, 255)),
        ("Travel & Transportation", "₹54,200", "16.5%", (200, 200, 210)),
        ("Food & Dining (Swiggy, Groceries)", "₹48,960", "14.9%", (170, 170, 180)),
        ("Shopping & Furniture Setup", "₹38,500", "11.7%", (140, 140, 150)),
        ("Healthcare & Diagnostics", "₹22,500", "6.8%", (110, 110, 120)),
        ("Utilities (Broadband, Power)", "₹18,000", "5.5%", (90, 90, 100)),
        ("Subscriptions & SaaS", "₹14,523", "4.4%", (75, 75, 85)),
    ]

    y_offset = 190
    for name, amt, pct, col in categories:
        # Category row
        draw.rounded_rectangle([(40, y_offset), (560, y_offset + 65)], radius=12, fill=(16, 16, 20, 220), outline=(255, 255, 255, 25), width=1)
        draw.text((60, y_offset + 12), name, fill=(240, 240, 245, 255))
        draw.text((60, y_offset + 38), f"Total: {amt}", fill=(160, 160, 170, 200))

        draw.text((480, y_offset + 22), pct, fill=col)

        # Progress bar
        pct_float = float(pct.replace("%", ""))
        bar_w = int((pct_float / 50.0) * 120)
        draw.rounded_rectangle([(340, y_offset + 28), (460, y_offset + 34)], radius=3, fill=(30, 30, 36, 255))
        draw.rounded_rectangle([(340, y_offset + 28), (340 + bar_w, y_offset + 34)], radius=3, fill=(255, 255, 255, 200))

        y_offset += 78

    img.save(os.path.join(OUTPUT_DIR, "2.png"))


def generate_image_3():
    # Stage #003: Track Monthly Budgets
    img, draw = create_card_base(
        title="BUDGET LIMITS & THRESHOLDS",
        subtitle="Active period caps vs actual expenditure burn",
        stage_tag="STAGE 03 // BUDGETS"
    )

    # Summary meter card
    draw.rounded_rectangle([(40, 190), (560, 310)], radius=16, fill=(18, 18, 22, 240), outline=(255, 255, 255, 40), width=1)
    draw.text((60, 210), "ACTIVE MONTH CAPITAL BURN", fill=(160, 160, 175, 220))
    draw.text((60, 240), "54.5% UTILIZED", fill=(255, 255, 255, 255))
    draw.text((360, 240), "₹45,208 / ₹83,000", fill=(52, 211, 153, 240))

    # Overall progress track
    draw.rounded_rectangle([(60, 280), (540, 292)], radius=6, fill=(35, 35, 42, 255))
    draw.rounded_rectangle([(60, 280), (320, 292)], radius=6, fill=(52, 211, 153, 255))

    # Category budget cards
    items = [
        ("Healthcare Allowance", "₹7,500 / ₹3,000", "250% EXCEEDED", (251, 113, 133), 100),
        ("Housing Allocation", "₹22,000 / ₹25,000", "88.0% WARNING", (251, 191, 36), 88),
        ("Shopping & Supplies", "₹5,400 / ₹8,000", "67.5% HEALTHY", (52, 211, 153), 67),
        ("Transportation & Fuel", "₹3,200 / ₹6,000", "53.3% HEALTHY", (52, 211, 153), 53),
        ("Food & Dining", "₹4,960 / ₹15,000", "33.1% HEALTHY", (52, 211, 153), 33),
    ]

    y_pos = 330
    for title_text, spend_text, status, color, bar_pct in items:
        draw.rounded_rectangle([(40, y_pos), (560, y_pos + 75)], radius=14, fill=(16, 16, 20, 220), outline=(color[0], color[1], color[2], 70), width=1)
        draw.text((60, y_pos + 12), title_text, fill=(255, 255, 255, 255))
        draw.text((60, y_pos + 42), spend_text, fill=(180, 180, 190, 220))
        draw.text((400, y_pos + 12), status, fill=color)

        draw.rounded_rectangle([(320, y_pos + 45), (540, y_pos + 52)], radius=3, fill=(30, 30, 36, 255))
        draw.rounded_rectangle([(320, y_pos + 45), (320 + int(220 * bar_pct / 100), y_pos + 52)], radius=3, fill=color)

        y_pos += 88

    img.save(os.path.join(OUTPUT_DIR, "3.png"))


def generate_image_4():
    # Stage #004: Discover Spending Patterns
    img, draw = create_card_base(
        title="STATISTICAL ANOMALY RADAR",
        subtitle="IQR dispersion (Q3 + 1.5*IQR) & subscription frequency",
        stage_tag="STAGE 04 // PATTERNS"
    )

    # Formula Callout
    draw.rounded_rectangle([(40, 190), (560, 280)], radius=16, fill=(24, 20, 30, 240), outline=(167, 139, 250, 80), width=1)
    draw.text((60, 205), "MATHEMATICAL ANOMALY DISPERSION", fill=(196, 181, 253, 240))
    draw.text((60, 235), "IQR = Q3 - Q1 = ₹4,368.50  |  Threshold = ₹11,570.25", fill=(255, 255, 255, 255))

    # Outliers
    draw.text((40, 300), "DETECTED ATYPICAL OUTLIERS", fill=(180, 180, 190, 220))

    outliers = [
        ("Airbnb Mountain Villa", "₹18,200.00", "Dev: +₹13,182.50", "2026-06-28"),
        ("IKEA Furniture Desk Setup", "₹16,500.00", "Dev: +₹11,482.50", "2026-09-24"),
        ("IndiGo Airlines Flight Tickets", "₹14,500.00", "Dev: +₹9,482.50", "2026-06-25"),
    ]

    y_pos = 330
    for desc, amt, dev, dt in outliers:
        draw.rounded_rectangle([(40, y_pos), (560, y_pos + 65)], radius=12, fill=(28, 16, 20, 220), outline=(251, 113, 133, 70), width=1)
        draw.text((60, y_pos + 12), desc, fill=(255, 255, 255, 255))
        draw.text((60, y_pos + 38), f"{dt} • {dev}", fill=(253, 164, 175, 200))
        draw.text((440, y_pos + 20), amt, fill=(251, 113, 133, 255))
        y_pos += 76

    # Recurring Subscriptions
    draw.text((40, y_pos + 15), "DETECTED RECURRING FIXED LIABILITIES", fill=(180, 180, 190, 220))
    y_pos += 45

    subs = [
        ("City Heights Apartment Rent", "₹22,000 / mo", "₹2,64,000 / yr"),
        ("Nature Basket Groceries", "₹3,878 / mo", "₹46,541 / yr"),
        ("Netflix 4K Ultra Subscription", "₹649 / mo", "₹7,788 / yr"),
    ]

    for m, mo, yr in subs:
        draw.rounded_rectangle([(40, y_pos), (560, y_pos + 55)], radius=12, fill=(16, 18, 24, 220), outline=(255, 255, 255, 25), width=1)
        draw.text((60, y_pos + 12), m, fill=(255, 255, 255, 255))
        draw.text((60, y_pos + 32), mo, fill=(160, 160, 175, 200))
        draw.text((440, y_pos + 18), yr, fill=(52, 211, 153, 240))
        y_pos += 65

    img.save(os.path.join(OUTPUT_DIR, "4.png"))


def generate_image_5():
    # Stage #005: Make Data-Driven Decisions
    img, draw = create_card_base(
        title="EXECUTIVE FINANCIAL STATEMENT",
        subtitle="Automated audit compliance, export & governance",
        stage_tag="STAGE 05 // DECISIONS"
    )

    # Audit Certification Card
    draw.rounded_rectangle([(40, 190), (560, 310)], radius=16, fill=(16, 24, 20, 240), outline=(52, 211, 153, 90), width=1)
    draw.text((60, 208), "PORTFOLIO DATA AUDIT PASSED", fill=(110, 231, 183, 240))
    draw.text((60, 238), "100% Sanitized & Deduplicated", fill=(255, 255, 255, 255))
    draw.text((60, 272), "68 Valid Entries  •  1 Duplicate Suppressed  •  0 Corrupt Rows", fill=(160, 200, 180, 200))

    # Decision Matrix Rows
    decisions = [
        ("Discretionary Capital Shift", "+₹24,500 Available", "Reallocate surplus to high-yield reserve buffer"),
        ("Recurring Subscription Audit", "₹7,788 Optimization", "Evaluate dormant entertainment streaming tiers"),
        ("Healthcare Expense Cap", "+₹4,500 Adjustment", "Calibrate seasonal emergency contingency buffer"),
        ("MoM Inflow Acceleration", "+8.5% Growth", "Income deposits outpacing inflation benchmark"),
    ]

    y_pos = 330
    for headline, stat, detail in decisions:
        draw.rounded_rectangle([(40, y_pos), (560, y_pos + 80)], radius=14, fill=(16, 16, 20, 220), outline=(255, 255, 255, 30), width=1)
        draw.text((60, y_pos + 14), headline, fill=(255, 255, 255, 255))
        draw.text((370, y_pos + 14), stat, fill=(52, 211, 153, 240))
        draw.text((60, y_pos + 46), detail, fill=(160, 160, 175, 200))
        y_pos += 95

    # Download Bar
    draw.rounded_rectangle([(40, 720), (560, 760)], radius=12, fill=(255, 255, 255, 20), outline=(255, 255, 255, 60))
    draw.text((180, 732), "DOWNLOAD AUDITED CSV STATEMENT", fill=(255, 255, 255, 255))

    img.save(os.path.join(OUTPUT_DIR, "5.png"))


if __name__ == "__main__":
    generate_image_1()
    generate_image_2()
    generate_image_3()
    generate_image_4()
    generate_image_5()
    print("Successfully generated all 5 SpendSense financial gallery assets in", OUTPUT_DIR)
