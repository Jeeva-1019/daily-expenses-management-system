import mysql.connector
import pandas as pd
import sys
import json
import os
from dotenv import load_dotenv

# Connect to MySQL
'''
 db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Dev@MySql2729",
    database="fullstack_db",
    port=3306
)
'''
load_dotenv(r"D:\fullstack_project\backend\.env")
db = mysql.connector.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME", "fullstack_db"),
    port=int(os.getenv("DB_PORT", "3306"))
)

# User we want to analyze
user_id = int(sys.argv[1])

# Get only this user's expenses
query = """
SELECT
    id,
    title,
    amount,
    category,
    expense_date,
    description
FROM expenses
WHERE user_id = %s
ORDER BY expense_date DESC
"""

df = pd.read_sql(query, db, params=(user_id,))


# Prepare analysis result
if df.empty:

    result = {
        "user_id": user_id,
        "total_spending": 0,
        "average_expense": 0,
        "top_category": None,
        "category_summary": {},
        "insight": "No expenses found.",
        "insights": []
    }

else:

    total_spending = float(df["amount"].sum())
    average_expense = float(df["amount"].mean())

    category_summary = (
        df.groupby("category")["amount"]
        .sum()
        .sort_values(ascending=False)
    )

    category_summary = {
        str(category): float(amount)
        for category, amount in category_summary.items()
    }

    top_category = next(iter(category_summary))

    # Main insight
    insight = (
        f"Your highest spending category is {top_category} "
        f"with {category_summary[top_category]:.2f} spent."
    )

    # Multiple insights
    insights = []

    insights.append(insight)

    insights.append(
        f"Your total spending is {total_spending:.2f}."
    )

    insights.append(
        f"Your average expense is {average_expense:.2f}."
    )

    # Final result
    result = {
        "user_id": user_id,
        "total_spending": round(total_spending, 2),
        "average_expense": round(average_expense, 2),
        "top_category": top_category,
        "category_summary": category_summary,
        "insight": insight,
        "insights": insights
    }


print(json.dumps(result))

db.close()
