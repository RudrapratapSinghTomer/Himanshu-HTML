const EXTRACTED_MCQS = [];

const EXTRACTED_CODE = [
  {
    "topic": "General",
    "type": "code",
    "question": "Find second highest salary",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Use",
      "MAX()",
      "with",
      "subquery."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find duplicate records",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "GROUP",
      "BY",
      "column",
      "HAVING",
      "COUNT(*)",
      ">",
      "1."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Delete duplicates keeping one row",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Use",
      "ROW_NUMBER()",
      "with",
      "CTE."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find nth highest salary",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "DENSE_RANK()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Calculate running total",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "SUM()",
      "OVER()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find employees without managers",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "WHERE",
      "manager_id",
      "IS",
      "NULL."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find top 3 salaries department-wise",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "ROW_NUMBER()",
      "OVER(PARTITION",
      "BY)."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find cumulative average",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "AVG()",
      "OVER()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Pivot rows into columns",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "PIVOT."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Fetch latest order per customer",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "ROW_NUMBER()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Calculate month-over-month growth",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "LAG()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find missing IDs",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Generate",
      "sequence",
      "compare."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find median salary",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "PERCENTILE_CONT()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Retrieve odd rows only",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "MOD(id,2)=1."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find consecutive login days",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "DATEDIFF",
      "with",
      "window",
      "functions."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find customers with no orders",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "LEFT",
      "JOIN",
      "WHERE",
      "order_id",
      "IS",
      "NULL."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find highest selling product monthly",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "GROUP",
      "BY",
      "month."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Create rolling 7-day average",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Window",
      "frame."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find department salary average",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "AVG",
      "GROUP",
      "BY."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Convert rows to columns dynamically",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Dynamic",
      "pivot."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find gaps between dates",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "LEAD/LAG."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find duplicate emails",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "GROUP",
      "BY",
      "email."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Create dynamic dashboard KPI",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Pivot",
      "tables",
      "+",
      "slicers."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Remove duplicates in Excel",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Data",
      ">",
      "Remove",
      "Duplicates."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find top 5 values",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "LARGE()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Calculate CAGR",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "((Ending/Beginning)^(1/n))-1."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Highlight duplicates",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Conditional",
      "formatting."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Split full name",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "TEXTSPLIT."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Dynamic dropdown list",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Named",
      "ranges."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Calculate weighted average",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "SUMPRODUCT."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Merge sheets",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Power",
      "Query",
      "append."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Sales drop due holiday",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Compare",
      "YoY."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Revenue increased but profit dropped",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Costs",
      "increased."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Stakeholder wants daily updates",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Build",
      "automated",
      "dashboard."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "High traffic low conversions",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Funnel",
      "analysis."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Customer churn rising",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Cohort",
      "analysis."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Website bounce rate high",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Improve",
      "landing",
      "page."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Create YoY growth measure",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "SAMEPERIODLASTYEAR."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Dynamic KPI card",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "DAX",
      "measure."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Create date table",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "CALENDAR()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Running total in DAX",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "CALCULATE",
      "with",
      "FILTER."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Top N filter",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "RANKX."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Create KPI indicator",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "IF",
      "condition."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Read CSV file",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "pd.read_csv()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Remove null values",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "dropna()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Group sales by category",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "groupby()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Merge dataframes",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "merge()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find duplicates",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "duplicated()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Replace missing values",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "fillna()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Create bar chart",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "plt.bar()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Sort dataframe",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "sort_values()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Convert datatype",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "astype()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Filter rows",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Boolean",
      "indexing."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Dashboard slow",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Optimize",
      "model",
      "and",
      "reduce",
      "visuals."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Stakeholder changes requirements frequently",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Agile",
      "iteration."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "KPI mismatch across teams",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Standardize",
      "definitions."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Duplicate customer IDs",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Data",
      "cleaning."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Revenue spike suspicious",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Validate",
      "source",
      "data."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Missing sales data",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Imputation",
      "or",
      "exclusion."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "CEO wants real-time dashboard",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Streaming",
      "dataset."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Data inconsistency",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Validation",
      "rules."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Huge Excel file crashing",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Use",
      "database."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Regional performance low",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Segmentation",
      "analysis."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Increase app engagement",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Funnel",
      "optimization."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Marketing spend high low revenue",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Attribution",
      "analysis."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Low inventory turnover",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Overstocking."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Seasonal product demand",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Time-series",
      "analysis."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Report automation",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Scheduled",
      "refresh."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Executive summary purpose",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Quick",
      "insights."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Reverse string",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "s[::-1]."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find factorial recursively",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "recursion."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Fibonacci series",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "iterative",
      "loop."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Remove duplicates from list",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "set()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find first non-repeating char",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "dictionary",
      "count."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Check palindrome",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "compare",
      "reverse."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Count word frequency",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Counter()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Merge two dictionaries",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "{a,b}."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Flatten nested list",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "list",
      "comprehension."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Sort list of tuples",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "key",
      "lambda."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find max occurring element",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Counter.most_common."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Binary search implementation",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "divide",
      "search."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Bubble sort logic",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "swap",
      "adjacent."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Detect cycle in list",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "visited",
      "set."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Prime number check",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "sqrt",
      "optimization."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find anagram strings",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "sorted",
      "compare."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find missing number",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "sum",
      "formula."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Rotate array",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "slicing."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Remove punctuation",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "regex."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Count vowels",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "iteration."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Read JSON file",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "json.load."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "API request",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "requests.get."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Create dataframe",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "pd.DataFrame."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Handle exceptions",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "try",
      "except."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Find duplicates in dataframe",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "duplicated()."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Normalize data",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "MinMaxScaler."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Standardize data",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "StandardScaler."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Train ML model",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "fit()."
    ],
    "tags": [
      "Data Science",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Save model",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "joblib.dump."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "General",
    "type": "code",
    "question": "Load model",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "joblib.load."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Read CSV in Spark",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "spark.read.csv."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Filter dataframe",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "filter()."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Handle missing values",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "na.fill()."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "GroupBy operation",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "groupBy().agg()."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Join dataframes",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "join()."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Cache dataframe",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "cache()."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Imbalanced dataset",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "SMOTE",
      "or",
      "class",
      "weights."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Too many features",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "PCA",
      "or",
      "selection."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Model overfitting",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Regularization."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Missing values",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Imputation."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Outliers affecting model",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Remove",
      "or",
      "cap."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "High dimensional sparse data",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "TF-IDF."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Prediction latency high",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Model",
      "optimization."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Data drift detected",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Retraining."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Low recall medical model",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Increase",
      "sensitivity."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Fraud detection",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Anomaly",
      "detection."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Recommendation engine",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Collaborative",
      "filtering."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Sentiment analysis",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "NLP",
      "classification."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Churn prediction",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Classification",
      "model."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Forecasting sales",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Time-series",
      "models."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Real-time prediction",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Streaming",
      "pipeline."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Large dataset",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Distributed",
      "computing."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Explainability required",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "SHAP",
      "values."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Limited labeled data",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Semi-supervised",
      "learning."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Multiple target classes",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Multiclass",
      "classification."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Continuous output",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Regression."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "SQL & Warehousing",
    "type": "code",
    "question": "Create fact table",
    "initialCode": "-- Write your solution here\n",
    "expectedKeywords": [
      "Measures",
      "with",
      "foreign",
      "keys."
    ],
    "tags": [
      "Data Engineering",
      "SQL"
    ]
  },
  {
    "topic": "SQL & Warehousing",
    "type": "code",
    "question": "Create dimension table",
    "initialCode": "-- Write your solution here\n",
    "expectedKeywords": [
      "Descriptive",
      "attributes."
    ],
    "tags": [
      "Data Engineering",
      "SQL"
    ]
  },
  {
    "topic": "SQL & Warehousing",
    "type": "code",
    "question": "Deduplicate records",
    "initialCode": "-- Write your solution here\n",
    "expectedKeywords": [
      "ROW_NUMBER()."
    ],
    "tags": [
      "Data Engineering",
      "SQL"
    ]
  },
  {
    "topic": "SQL & Warehousing",
    "type": "code",
    "question": "Incremental pipeline logic",
    "initialCode": "-- Write your solution here\n",
    "expectedKeywords": [
      "Timestamp",
      "filter."
    ],
    "tags": [
      "Data Engineering",
      "SQL"
    ]
  },
  {
    "topic": "SQL & Warehousing",
    "type": "code",
    "question": "Create audit columns",
    "initialCode": "-- Write your solution here\n",
    "expectedKeywords": [
      "created_at",
      "updated_at."
    ],
    "tags": [
      "Data Engineering",
      "SQL"
    ]
  },
  {
    "topic": "SQL & Warehousing",
    "type": "code",
    "question": "Create partitioned table",
    "initialCode": "-- Write your solution here\n",
    "expectedKeywords": [
      "PARTITION",
      "BY."
    ],
    "tags": [
      "Data Engineering",
      "SQL"
    ]
  },
  {
    "topic": "PySpark & Big Data Engineering",
    "type": "code",
    "question": "Read parquet file",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "spark.read.parquet."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data Engineering",
    "type": "code",
    "question": "Write parquet file",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "write.parquet."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data Engineering",
    "type": "code",
    "question": "Repartition dataframe",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "repartition()."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data Engineering",
    "type": "code",
    "question": "Broadcast join usage",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Small",
      "lookup",
      "table."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data Engineering",
    "type": "code",
    "question": "Window function in Spark",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Window.partitionBy."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data Engineering",
    "type": "code",
    "question": "Union dataframes",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "union()."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data Engineering",
    "type": "code",
    "question": "Drop duplicates Spark",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "dropDuplicates()."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "PySpark & Big Data Engineering",
    "type": "code",
    "question": "Convert RDD to DataFrame",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "toDF()."
    ],
    "tags": [
      "Data Engineering",
      "PySpark"
    ]
  },
  {
    "topic": "MCQ: Operator in Airflow means? Answer: Task definition.",
    "type": "code",
    "question": "Retry failed task",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "retries",
      "parameter."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Operator in Airflow means? Answer: Task definition."
    ]
  },
  {
    "topic": "MCQ: Sensor in Airflow means? Answer: Wait condition.",
    "type": "code",
    "question": "Trigger downstream pipeline",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "TriggerDagRunOperator."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Sensor in Airflow means? Answer: Wait condition."
    ]
  },
  {
    "topic": "MCQ: Sensor in Airflow means? Answer: Wait condition.",
    "type": "code",
    "question": "Pipeline failed midway",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Restart",
      "checkpoint."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Sensor in Airflow means? Answer: Wait condition."
    ]
  },
  {
    "topic": "MCQ: Sensor in Airflow means? Answer: Wait condition.",
    "type": "code",
    "question": "Duplicate ingestion",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Deduplication",
      "logic."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Sensor in Airflow means? Answer: Wait condition."
    ]
  },
  {
    "topic": "MCQ: Sensor in Airflow means? Answer: Wait condition.",
    "type": "code",
    "question": "Schema changes unexpectedly",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Schema",
      "evolution."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Sensor in Airflow means? Answer: Wait condition."
    ]
  },
  {
    "topic": "MCQ: Sensor in Airflow means? Answer: Wait condition.",
    "type": "code",
    "question": "Delayed source data",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Retry",
      "mechanism."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Sensor in Airflow means? Answer: Wait condition."
    ]
  },
  {
    "topic": "MCQ: Sensor in Airflow means? Answer: Wait condition.",
    "type": "code",
    "question": "Huge backlog processing",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Parallel",
      "execution."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Sensor in Airflow means? Answer: Wait condition."
    ]
  },
  {
    "topic": "MCQ: Sensor in Airflow means? Answer: Wait condition.",
    "type": "code",
    "question": "Real-time analytics needed",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Kafka",
      "+",
      "Spark",
      "Streaming."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Sensor in Airflow means? Answer: Wait condition."
    ]
  },
  {
    "topic": "MCQ: Sensor in Airflow means? Answer: Wait condition.",
    "type": "code",
    "question": "High cloud cost",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Optimize",
      "compute."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Sensor in Airflow means? Answer: Wait condition."
    ]
  },
  {
    "topic": "MCQ: Sensor in Airflow means? Answer: Wait condition.",
    "type": "code",
    "question": "Data quality issue",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Validation",
      "rules."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Sensor in Airflow means? Answer: Wait condition."
    ]
  },
  {
    "topic": "MCQ: Sensor in Airflow means? Answer: Wait condition.",
    "type": "code",
    "question": "Pipeline latency high",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Tune",
      "partitions."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Sensor in Airflow means? Answer: Wait condition."
    ]
  },
  {
    "topic": "MCQ: Sensor in Airflow means? Answer: Wait condition.",
    "type": "code",
    "question": "Frequent pipeline failures",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Monitoring",
      "and",
      "alerts."
    ],
    "tags": [
      "Data Engineering",
      "MCQ: Sensor in Airflow means? Answer: Wait condition."
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Build ingestion pipeline",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Extract",
      "validate",
      "load."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Create CDC logic",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Timestamp",
      "comparison."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Automate daily ETL",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Scheduler",
      "workflow."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Optimize slow SQL query",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Indexing."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Handle null values pipeline",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Imputation",
      "rules."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Parse JSON logs",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "explode/select."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Build star schema",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Fact",
      "and",
      "dimensions."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Create streaming consumer",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Kafka",
      "consumer."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Write partition strategy",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Date-based",
      "partitions."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Create SCD type 2 logic",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Expiry",
      "columns."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Source DB overloaded",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Incremental",
      "loads."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Millions of records daily",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Distributed",
      "processing."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Pipeline must run hourly",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Orchestration",
      "scheduling."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Data inconsistency across systems",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Master",
      "data",
      "management."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Dashboard stale data",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Refresh",
      "optimization."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Duplicate Kafka events",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Idempotent",
      "consumers."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Need low-cost storage",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Data",
      "lake",
      "archival."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Need sub-second analytics",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "In-memory",
      "processing."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Multi-region deployment",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Replication."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  },
  {
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Regulatory compliance needed",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "Governance",
      "controls."
    ],
    "tags": [
      "Data Engineering",
      "Advanced Engineering Concepts"
    ]
  }
];