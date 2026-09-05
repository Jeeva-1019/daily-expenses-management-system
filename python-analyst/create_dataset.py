import mysql.connector
import pandas as pd
import os

from dotenv import load_dotenv

load_dotenv(r"D:\fullstack_project\backend\.env")

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

db = mysql.connector.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME", "fullstack_db"),
    port=int(os.getenv("DB_PORT", "3306"))
)

# Get all expense records
query = """
SELECT
    user_id,
    title,
    amount,
    category,
    expense_date,
    description
FROM expenses
ORDER BY expense_date
"""

# Create dataset
df = pd.read_sql(query, db)

# Save dataset as CSV
df.to_csv("daily_expenses_dataset.csv", index=False)

print("Dataset created successfully!")
print("Total records:", len(df))
print("Users:", df["user_id"].nunique())
print("File: daily_expenses_dataset.csv")

db.close()