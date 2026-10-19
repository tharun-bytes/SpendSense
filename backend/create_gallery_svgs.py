"""
Generate 5 high-fidelity financial analytics SVG assets for the SpendSense Motion Parallax Gallery.
Pure Python - zero external DLL dependencies.
"""

import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "photos", "spendsense")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_svg_1():
    # Stage #001: Understand Your Spending
    svg = '''<svg width="600" height="800" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg1" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#18181b" />
    </linearGradient>
    <linearGradient id="cardBorder" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.3" />
    </linearGradient>
    <linearGradient id="glowGreen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <!-- Background Card -->
  <rect x="2" y="2" width="596" height="796" rx="24" fill="url(#bg1)" stroke="url(#cardBorder)" stroke-width="2"/>

  <!-- Stage Pill -->
  <rect x="40" y="45" width="180" height="30" rx="15" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.2"/>
  <text x="55" y="65" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="600" letter-spacing="1">STAGE 01 // CASHFLOW</text>

  <!-- Header -->
  <text x="40" y="115" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="700" letter-spacing="-0.5">EXECUTIVE FINANCIAL METRICS</text>
  <text x="40" y="140" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="13">Gross inflows, disbursements &amp; capital retention rate</text>
  <line x1="40" y1="165" x2="560" y2="165" stroke="#ffffff" stroke-opacity="0.1"/>

  <!-- Inflow Card -->
  <rect x="40" y="190" width="520" height="95" rx="16" fill="#064e3b" fill-opacity="0.2" stroke="#10b981" stroke-opacity="0.4"/>
  <text x="65" y="222" fill="#34d399" font-family="'Geist Mono', monospace" font-size="11" letter-spacing="0.5">TOTAL INFLOW (6 MONTHS)</text>
  <text x="65" y="260" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="28" font-weight="700">₹5,80,000.00</text>

  <!-- Outflow Card -->
  <rect x="40" y="305" width="520" height="95" rx="16" fill="#881337" fill-opacity="0.2" stroke="#f43f5e" stroke-opacity="0.4"/>
  <text x="65" y="337" fill="#fb7185" font-family="'Geist Mono', monospace" font-size="11" letter-spacing="0.5">TOTAL EXPENDITURES</text>
  <text x="65" y="375" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="28" font-weight="700">₹3,28,683.50</text>

  <!-- Net Surplus & Savings Rate Split -->
  <rect x="40" y="420" width="250" height="135" rx="16" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.1"/>
  <text x="60" y="448" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="11">NET SURPLUS</text>
  <text x="60" y="488" fill="#34d399" font-family="'Geist Mono', monospace" font-size="22" font-weight="700">+₹2,51,316</text>
  <text x="60" y="525" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="12">Positive Cash Balance</text>

  <rect x="310" y="420" width="250" height="135" rx="16" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.1"/>
  <text x="330" y="448" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="11">SAVINGS EFFICIENCY</text>
  <text x="330" y="488" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="26" font-weight="700">43.33%</text>
  <text x="330" y="525" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="12">Benchmark: &gt;20.0% Target</text>

  <!-- Velocity Trendline -->
  <rect x="40" y="575" width="520" height="175" rx="16" fill="#000000" fill-opacity="0.4" stroke="#ffffff" stroke-opacity="0.1"/>
  <text x="60" y="605" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="11">30-DAY DISBURSEMENT VELOCITY</text>
  
  <path d="M 60 710 Q 110 650, 160 680 T 260 640 T 360 670 T 460 630 T 540 660" fill="none" stroke="#34d399" stroke-width="3"/>
  <circle cx="540" cy="660" r="5" fill="#ffffff" stroke="#34d399" stroke-width="2"/>
  <text x="440" y="735" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="10">Active Days: 171</text>
</svg>'''
    with open(os.path.join(OUTPUT_DIR, "1.svg"), "w", encoding="utf-8") as f:
        f.write(svg)

def generate_svg_2():
    # Stage #002: Explore Expense Categories
    svg = '''<svg width="600" height="800" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#18181b" />
    </linearGradient>
    <linearGradient id="cardBorder2" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="596" height="796" rx="24" fill="url(#bg2)" stroke="url(#cardBorder2)" stroke-width="2"/>

  <!-- Stage Pill -->
  <rect x="40" y="45" width="180" height="30" rx="15" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.2"/>
  <text x="55" y="65" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="600" letter-spacing="1">STAGE 02 // SECTORS</text>

  <!-- Header -->
  <text x="40" y="115" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="700" letter-spacing="-0.5">CATEGORY CAPITAL DISTRIBUTION</text>
  <text x="40" y="140" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="13">Automatic classification across 11 financial sectors</text>
  <line x1="40" y1="165" x2="560" y2="165" stroke="#ffffff" stroke-opacity="0.1"/>

  <!-- Row 1: Housing -->
  <g transform="translate(40, 190)">
    <rect width="520" height="70" rx="14" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.15"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Housing (Rent &amp; Apartment)</text>
    <text x="20" y="52" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="12">₹1,32,000.00 • 6 entries</text>
    <text x="450" y="40" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="16" font-weight="700">40.2%</text>
  </g>

  <!-- Row 2: Travel -->
  <g transform="translate(40, 275)">
    <rect width="520" height="70" rx="14" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.15"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Travel &amp; Airlines</text>
    <text x="20" y="52" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="12">₹54,200.00 • 4 entries</text>
    <text x="450" y="40" fill="#e4e4e7" font-family="'Geist Mono', monospace" font-size="16" font-weight="700">16.5%</text>
  </g>

  <!-- Row 3: Food & Dining -->
  <g transform="translate(40, 360)">
    <rect width="520" height="70" rx="14" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.15"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Food, Groceries &amp; Dining</text>
    <text x="20" y="52" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="12">₹48,960.00 • 18 entries</text>
    <text x="450" y="40" fill="#d4d4d8" font-family="'Geist Mono', monospace" font-size="16" font-weight="700">14.9%</text>
  </g>

  <!-- Row 4: Shopping -->
  <g transform="translate(40, 445)">
    <rect width="520" height="70" rx="14" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.15"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Shopping &amp; Home Setup</text>
    <text x="20" y="52" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="12">₹38,500.00 • 5 entries</text>
    <text x="450" y="40" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="16" font-weight="700">11.7%</text>
  </g>

  <!-- Row 5: Utilities & Subscriptions -->
  <g transform="translate(40, 530)">
    <rect width="520" height="70" rx="14" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.15"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Recurring Subscriptions &amp; Utilities</text>
    <text x="20" y="52" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="12">₹32,523.00 • 16 entries</text>
    <text x="450" y="40" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="16" font-weight="700">9.9%</text>
  </g>

  <!-- Interactive Donut Summary Bar -->
  <g transform="translate(40, 630)">
    <rect width="520" height="120" rx="16" fill="#000000" fill-opacity="0.4" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="600">TOTAL ANALYZED OUTFLOW</text>
    <text x="20" y="65" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="24" font-weight="700">₹3,28,683.50</text>
    <text x="20" y="95" fill="#10b981" font-family="system-ui, sans-serif" font-size="12">100% Deterministic Keyword Grounding</text>
  </g>
</svg>'''
    with open(os.path.join(OUTPUT_DIR, "2.svg"), "w", encoding="utf-8") as f:
        f.write(svg)

def generate_svg_3():
    # Stage #003: Track Monthly Budgets
    svg = '''<svg width="600" height="800" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg3" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#18181b" />
    </linearGradient>
    <linearGradient id="cardBorder3" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="596" height="796" rx="24" fill="url(#bg3)" stroke="url(#cardBorder3)" stroke-width="2"/>

  <!-- Stage Pill -->
  <rect x="40" y="45" width="180" height="30" rx="15" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.2"/>
  <text x="55" y="65" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="600" letter-spacing="1">STAGE 03 // BUDGETS</text>

  <!-- Header -->
  <text x="40" y="115" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="700" letter-spacing="-0.5">BUDGET CAPS &amp; THRESHOLDS</text>
  <text x="40" y="140" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="13">Active period allowances vs actual outflows</text>
  <line x1="40" y1="165" x2="560" y2="165" stroke="#ffffff" stroke-opacity="0.1"/>

  <!-- Top Burn Card -->
  <rect x="40" y="190" width="520" height="110" rx="16" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.15"/>
  <text x="65" y="220" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="11">ACTIVE MONTH TOTAL ALLOCATION</text>
  <text x="65" y="255" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="24" font-weight="700">₹45,208 / ₹83,000</text>
  <text x="420" y="255" fill="#10b981" font-family="'Geist Mono', monospace" font-size="18" font-weight="600">54.5% BURN</text>

  <!-- Master Bar -->
  <rect x="65" y="275" width="470" height="8" rx="4" fill="#27272a"/>
  <rect x="65" y="275" width="256" height="8" rx="4" fill="#10b981"/>

  <!-- Exceeded Budget Item (Healthcare) -->
  <g transform="translate(40, 325)">
    <rect width="520" height="85" rx="14" fill="#881337" fill-opacity="0.15" stroke="#f43f5e" stroke-opacity="0.4"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Healthcare Diagnostics</text>
    <text x="20" y="55" fill="#fb7185" font-family="'Geist Mono', monospace" font-size="12">Spent: ₹7,500 / Cap: ₹3,000</text>
    <text x="380" y="35" fill="#f43f5e" font-family="'Geist Mono', monospace" font-size="12" font-weight="700">250% EXCEEDED</text>
    <rect x="20" y="68" width="480" height="5" rx="2" fill="#27272a"/>
    <rect x="20" y="68" width="480" height="5" rx="2" fill="#f43f5e"/>
  </g>

  <!-- Warning Item (Housing) -->
  <g transform="translate(40, 430)">
    <rect width="520" height="85" rx="14" fill="#78350f" fill-opacity="0.15" stroke="#f59e0b" stroke-opacity="0.4"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Housing Allocation</text>
    <text x="20" y="55" fill="#fcd34d" font-family="'Geist Mono', monospace" font-size="12">Spent: ₹22,000 / Cap: ₹25,000</text>
    <text x="390" y="35" fill="#f59e0b" font-family="'Geist Mono', monospace" font-size="12" font-weight="700">88.0% WARNING</text>
    <rect x="20" y="68" width="480" height="5" rx="2" fill="#27272a"/>
    <rect x="20" y="68" width="422" height="5" rx="2" fill="#f59e0b"/>
  </g>

  <!-- Healthy Item (Shopping) -->
  <g transform="translate(40, 535)">
    <rect width="520" height="85" rx="14" fill="#064e3b" fill-opacity="0.15" stroke="#10b981" stroke-opacity="0.3"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Shopping &amp; Essentials</text>
    <text x="20" y="55" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="12">Spent: ₹5,400 / Cap: ₹8,000</text>
    <text x="400" y="35" fill="#10b981" font-family="'Geist Mono', monospace" font-size="12" font-weight="700">67.5% HEALTHY</text>
    <rect x="20" y="68" width="480" height="5" rx="2" fill="#27272a"/>
    <rect x="20" y="68" width="324" height="5" rx="2" fill="#10b981"/>
  </g>

  <!-- Healthy Item (Food & Dining) -->
  <g transform="translate(40, 640)">
    <rect width="520" height="85" rx="14" fill="#064e3b" fill-opacity="0.15" stroke="#10b981" stroke-opacity="0.3"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Food &amp; Dining Allowance</text>
    <text x="20" y="55" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="12">Spent: ₹4,960 / Cap: ₹15,000</text>
    <text x="400" y="35" fill="#10b981" font-family="'Geist Mono', monospace" font-size="12" font-weight="700">33.1% HEALTHY</text>
    <rect x="20" y="68" width="480" height="5" rx="2" fill="#27272a"/>
    <rect x="20" y="68" width="158" height="5" rx="2" fill="#10b981"/>
  </g>
</svg>'''
    with open(os.path.join(OUTPUT_DIR, "3.svg"), "w", encoding="utf-8") as f:
        f.write(svg)

def generate_svg_4():
    # Stage #004: Discover Spending Patterns
    svg = '''<svg width="600" height="800" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg4" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#18181b" />
    </linearGradient>
    <linearGradient id="cardBorder4" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="596" height="796" rx="24" fill="url(#bg4)" stroke="url(#cardBorder4)" stroke-width="2"/>

  <!-- Stage Pill -->
  <rect x="40" y="45" width="180" height="30" rx="15" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.2"/>
  <text x="55" y="65" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="600" letter-spacing="1">STAGE 04 // PATTERNS</text>

  <!-- Header -->
  <text x="40" y="115" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="700" letter-spacing="-0.5">STATISTICAL ANOMALY RADAR</text>
  <text x="40" y="140" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="13">Nonparametric IQR Outlier Detection (Q3 + 1.5×IQR)</text>
  <line x1="40" y1="165" x2="560" y2="165" stroke="#ffffff" stroke-opacity="0.1"/>

  <!-- Formula Callout -->
  <rect x="40" y="190" width="520" height="80" rx="14" fill="#3b0764" fill-opacity="0.2" stroke="#a855f7" stroke-opacity="0.4"/>
  <text x="60" y="218" fill="#d8b4fe" font-family="'Geist Mono', monospace" font-size="11">MATHEMATICAL DISPERSION BOUNDS</text>
  <text x="60" y="248" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="14" font-weight="600">IQR = ₹4,368.50  |  Outlier Threshold = ₹11,570.25</text>

  <!-- Outliers List -->
  <text x="40" y="305" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="11">STATISTICALLY ATYPICAL TRANSACTIONS</text>

  <!-- Outlier 1 -->
  <g transform="translate(40, 325)">
    <rect width="520" height="70" rx="14" fill="#881337" fill-opacity="0.2" stroke="#f43f5e" stroke-opacity="0.3"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Airbnb Mountain Villa</text>
    <text x="20" y="52" fill="#fb7185" font-family="'Geist Mono', monospace" font-size="11">2026-06-28 • +₹13,182.50 above Q3</text>
    <text x="410" y="42" fill="#f43f5e" font-family="'Geist Mono', monospace" font-size="18" font-weight="700">₹18,200.00</text>
  </g>

  <!-- Outlier 2 -->
  <g transform="translate(40, 408)">
    <rect width="520" height="70" rx="14" fill="#881337" fill-opacity="0.2" stroke="#f43f5e" stroke-opacity="0.3"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">IKEA Furniture Desk Setup</text>
    <text x="20" y="52" fill="#fb7185" font-family="'Geist Mono', monospace" font-size="11">2026-09-24 • +₹11,482.50 above Q3</text>
    <text x="410" y="42" fill="#f43f5e" font-family="'Geist Mono', monospace" font-size="18" font-weight="700">₹16,500.00</text>
  </g>

  <!-- Outlier 3 -->
  <g transform="translate(40, 491)">
    <rect width="520" height="70" rx="14" fill="#881337" fill-opacity="0.2" stroke="#f43f5e" stroke-opacity="0.3"/>
    <text x="20" y="30" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">IndiGo Flight Tickets</text>
    <text x="20" y="52" fill="#fb7185" font-family="'Geist Mono', monospace" font-size="11">2026-06-25 • +₹9,482.50 above Q3</text>
    <text x="410" y="42" fill="#f43f5e" font-family="'Geist Mono', monospace" font-size="18" font-weight="700">₹14,500.00</text>
  </g>

  <!-- Recurring Subscriptions -->
  <text x="40" y="590" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="11">RECURRING MULTI-MONTH LIABILITIES</text>

  <g transform="translate(40, 610)">
    <rect width="520" height="60" rx="12" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="20" y="27" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="600">City Heights Apartment Rent</text>
    <text x="20" y="47" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="11">6 months active</text>
    <text x="380" y="38" fill="#10b981" font-family="'Geist Mono', monospace" font-size="14" font-weight="700">₹2,64,000 / yr</text>
  </g>

  <g transform="translate(40, 680)">
    <rect width="520" height="60" rx="12" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="20" y="27" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="600">Netflix 4K Ultra Subscription</text>
    <text x="20" y="47" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="11">₹649 / month</text>
    <text x="400" y="38" fill="#10b981" font-family="'Geist Mono', monospace" font-size="14" font-weight="700">₹7,788 / yr</text>
  </g>
</svg>'''
    with open(os.path.join(OUTPUT_DIR, "4.svg"), "w", encoding="utf-8") as f:
        f.write(svg)

def generate_svg_5():
    # Stage #005: Make Data-Driven Decisions
    svg = '''<svg width="600" height="800" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg5" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#18181b" />
    </linearGradient>
    <linearGradient id="cardBorder5" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="596" height="796" rx="24" fill="url(#bg5)" stroke="url(#cardBorder5)" stroke-width="2"/>

  <!-- Stage Pill -->
  <rect x="40" y="45" width="180" height="30" rx="15" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.2"/>
  <text x="55" y="65" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="11" font-weight="600" letter-spacing="1">STAGE 05 // DECISIONS</text>

  <!-- Header -->
  <text x="40" y="115" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="700" letter-spacing="-0.5">EXECUTIVE DECISION MATRIX</text>
  <text x="40" y="140" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="13">Grounded optimization &amp; audited portfolio compliance</text>
  <line x1="40" y1="165" x2="560" y2="165" stroke="#ffffff" stroke-opacity="0.1"/>

  <!-- Audit Badge Card -->
  <rect x="40" y="190" width="520" height="110" rx="16" fill="#064e3b" fill-opacity="0.2" stroke="#10b981" stroke-opacity="0.4"/>
  <text x="65" y="222" fill="#34d399" font-family="'Geist Mono', monospace" font-size="11">PORTFOLIO DATA AUDIT PASSED</text>
  <text x="65" y="255" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="700">100% Sanitized &amp; Verified Ingestion</text>
  <text x="65" y="282" fill="#a1a1aa" font-family="'Geist Mono', monospace" font-size="11">68 Valid Records • 1 Duplicate Eliminated • Zero Data Leaks</text>

  <!-- Optimization 1 -->
  <g transform="translate(40, 325)">
    <rect width="520" height="85" rx="14" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.15"/>
    <text x="20" y="32" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Discretionary Capital Reallocation</text>
    <text x="20" y="58" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="12">Reallocate ₹24,500 monthly surplus into emergency buffer</text>
    <text x="390" y="45" fill="#10b981" font-family="'Geist Mono', monospace" font-size="15" font-weight="700">+₹24,500/mo</text>
  </g>

  <!-- Optimization 2 -->
  <g transform="translate(40, 425)">
    <rect width="520" height="85" rx="14" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.15"/>
    <text x="20" y="32" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Recurring Subscription Rationalization</text>
    <text x="20" y="58" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="12">Trim unutilized SaaS tiers for an annualized ₹7,788 saving</text>
    <text x="390" y="45" fill="#10b981" font-family="'Geist Mono', monospace" font-size="15" font-weight="700">₹7,788/yr Saved</text>
  </g>

  <!-- Optimization 3 -->
  <g transform="translate(40, 525)">
    <rect width="520" height="85" rx="14" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.15"/>
    <text x="20" y="32" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Healthcare Variance Calibration</text>
    <text x="20" y="58" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="12">Increase seasonal medical contingency allowance by ₹4,500</text>
    <text x="390" y="45" fill="#e4e4e7" font-family="'Geist Mono', monospace" font-size="15" font-weight="700">Cap Calibrated</text>
  </g>

  <!-- Download Statement Card -->
  <g transform="translate(40, 630)">
    <rect width="520" height="110" rx="16" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.3"/>
    <text x="20" y="38" fill="#ffffff" font-family="system-ui, sans-serif" font-size="15" font-weight="600">Export Audited Financial Statements</text>
    <text x="20" y="65" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="12">Download clean CSV ledger and executive PDF summary</text>
    <rect x="20" y="78" width="480" height="2" fill="#ffffff" fill-opacity="0.1"/>
    <text x="360" y="50" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="12">Ready for Export &rarr;</text>
  </g>
</svg>'''
    with open(os.path.join(OUTPUT_DIR, "5.svg"), "w", encoding="utf-8") as f:
        f.write(svg)

if __name__ == "__main__":
    generate_svg_1()
    generate_svg_2()
    generate_svg_3()
    generate_svg_4()
    generate_svg_5()
    print("Successfully generated 5 authentic SpendSense SVG graphics in", OUTPUT_DIR)
