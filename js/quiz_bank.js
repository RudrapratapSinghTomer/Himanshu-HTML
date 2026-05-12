const EXTRACTED_MCQS = [];

const EXTRACTED_CODE = [
  {
    "topic": "General",
    "type": "code",
    "question": "Find second highest salary. Scenario: You are working as a Data Analyst in an HR analytics team where management wants to identify employees with the second highest salary for compensation benchmarking and promotion planning. Write a SQL query to retrieve the second highest salary from the employee table efficiently.",
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
    "question": "Find duplicate records. Scenario: An e-commerce company noticed duplicate customer records in the database which are causing incorrect reporting and inaccurate dashboards. Write a query to identify duplicate rows based on business key columns.",
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
    "question": "Delete duplicates keeping one row. Scenario: Your sales transaction table contains duplicate records because the ingestion pipeline ran multiple times accidentally. Write a SQL query to remove duplicate records while keeping only one valid row.",
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
    "question": "Find nth highest salary. Scenario: The HR department wants flexible reporting where users can dynamically fetch the nth highest salary for compensation analysis. Write a query to return the nth highest salary using ranking functions.",
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
    "question": "Calculate running total. Scenario: A finance dashboard requires cumulative revenue tracking to monitor daily business growth trends over time. Write a query to calculate the running total of sales.",
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
    "question": "Find employees without managers. Scenario: An HR audit team wants to identify employees who are not assigned to any manager for organizational restructuring analysis. Write a query to fetch employees without managers.",
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
    "question": "Find top 3 salaries department-wise. Scenario: Company leadership wants to identify the top-paid employees in every department for compensation benchmarking and budgeting discussions. Write a query to fetch the top 3 salaries department-wise.",
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
    "question": "Fetch latest order per customer. Scenario: A retail company wants to identify the most recent order placed by every customer for personalized recommendations and customer engagement analysis. Write a query to fetch the latest order for each customer.",
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
    "question": "Create rolling 7-day average. Scenario: A product analytics team wants smoother trend analysis for daily active users and sales metrics by reducing daily fluctuations. Write a query to calculate a rolling 7-day average.",
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
    "question": "Read CSV file. Scenario: You receive raw transactional data every day in CSV format and need to load it into a pandas DataFrame for preprocessing and analysis. Write Python code to read the CSV file.",
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
    "question": "Remove null values. Scenario: Your dataset contains missing records that are affecting business reporting and machine learning model performance. Write code to remove rows with null values from the dataset.",
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
    "question": "Merge dataframes. Scenario: Customer profile data and transaction data are stored in separate pandas DataFrames and need to be combined for analysis. Write Python code to merge both datasets.",
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
    "question": "Standardize data. Scenario: A machine learning model is underperforming because features like salary, transaction amount, and age are on different scales. Write Python code to standardize the dataset before model training.",
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
    "topic": "PySpark & Big Data",
    "type": "code",
    "question": "Join dataframes. Scenario: Customer transaction data and customer profile data are stored in separate Spark DataFrames containing millions of records. Write PySpark code to join both datasets efficiently for downstream analytics.",
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
    "question": "Handle missing values. Scenario: Large-scale enterprise data arriving in Spark contains missing values that may affect reporting accuracy and ML model quality. Write PySpark code to handle missing values appropriately.",
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
    "topic": "SQL & Warehousing",
    "type": "code",
    "question": "Create fact table. Scenario: You are designing a retail data warehouse where sales transactions must be stored in a centralized fact table connected with customer, product, and date dimensions. Write the SQL logic to create a fact table.",
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
    "topic": "Advanced Engineering Concepts",
    "type": "code",
    "question": "Build ingestion pipeline. Scenario: Your organization receives raw data every hour from APIs, flat files, and databases. Design a scalable ingestion pipeline that extracts, validates, transforms, and loads the data into centralized storage.",
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
    "question": "Create CDC logic. Scenario: The business wants to process only newly changed records from source systems instead of reloading the entire dataset every time. Write logic to implement Change Data Capture (CDC).",
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
    "question": "Optimize slow SQL query. Scenario: A business-critical dashboard is taking too long to load because underlying SQL queries are running slowly on large tables. Explain how you would optimize the SQL query performance.",
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
    "question": "Create SCD type 2 logic. Scenario: A customer dimension table must preserve historical changes such as address updates and status changes for audit and reporting purposes. Write logic to implement Slowly Changing Dimension Type 2 (SCD Type 2).",
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
    "topic": "General",
    "type": "code",
    "question": "Find cumulative average. Scenario: A finance analytics team wants to monitor how average revenue changes over time as new transactions are added daily. Write a query to calculate the cumulative average using window functions.",
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
    "question": "Pivot rows into columns. Scenario: Sales data is stored row-wise by month, but management requires a report where months appear as separate columns for easier dashboard visualization. Write a SQL query to pivot rows into columns.",
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
    "question": "Calculate month-over-month growth. Scenario: The finance department wants to compare monthly revenue performance to identify business growth trends and seasonal changes. Write a query to calculate month-over-month growth percentages.",
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
    "question": "Find missing IDs. Scenario: During data validation, the engineering team discovered gaps in transaction IDs due to ingestion failures or deleted records. Write logic to identify missing IDs from the dataset.",
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
    "question": "Find median salary. Scenario: HR leadership wants a better representation of employee compensation because average salary is affected by highly paid executives. Write a query to calculate the median salary.",
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
    "question": "Retrieve odd rows only. Scenario: During data auditing and testing, only alternate rows are required for sampling and validation purposes. Write a query to retrieve odd-numbered rows from the table.",
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
    "question": "Find consecutive login days. Scenario: A product analytics team wants to identify highly engaged users who log in continuously for multiple days. Write a query to detect consecutive login streaks.",
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
    "question": "Find customers with no orders. Scenario: A retail company wants to identify inactive customers who registered on the platform but never placed any orders so targeted campaigns can be launched. Write a query to fetch customers without orders.",
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
    "question": "Find highest selling product monthly. Scenario: Business stakeholders want to identify the top-performing product every month to optimize inventory planning and marketing campaigns. Write a query to find the highest-selling product monthly.",
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
    "question": "Find department salary average. Scenario: HR management wants to compare average salaries across departments for budgeting and compensation benchmarking. Write a query to calculate department-wise salary averages.",
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
    "question": "Convert rows to columns dynamically. Scenario: Reporting requirements change frequently and management wants a dynamic report that automatically converts row values into columns without hardcoding. Write logic for a dynamic pivot operation.",
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
    "question": "Find gaps between dates. Scenario: The operations team wants to identify missing activity periods and irregular transaction intervals in event logs. Write a query to calculate gaps between dates.",
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
    "question": "Find duplicate emails. Scenario: Duplicate customer email IDs in the CRM system are causing communication issues and inaccurate reporting. Write a query to identify duplicate email records.",
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
    "question": "Create dynamic dashboard KPI. Scenario: Executives require interactive KPIs where metrics update dynamically based on filters such as region, product, and time period. Design a dynamic KPI dashboard solution.",
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
    "question": "Remove duplicates in Excel. Scenario: An operations team receives raw Excel reports from multiple sources containing duplicate rows which affect business reporting. Explain how to remove duplicate records in Excel.",
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
    "question": "Find top 5 values. Scenario: A business analyst wants to identify the top 5 performing products or employees from a dataset for executive reporting. Write logic to retrieve the top 5 values.",
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
    "question": "Calculate CAGR. Scenario: Leadership wants to measure long-term business growth by calculating the Compound Annual Growth Rate (CAGR) of revenue over several years. Write the formula or logic to calculate CAGR.",
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
    "question": "Highlight duplicates. Scenario: A business operations team wants duplicate records in Excel to be visually highlighted for quick manual validation and cleanup. Explain how to highlight duplicate values.",
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
    "question": "Split full name. Scenario: Customer data is stored as full names in a single column, but reporting requires first name and last name separately. Write logic to split full names into multiple columns.",
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
    "question": "Dynamic dropdown list. Scenario: An Excel-based reporting solution requires dropdown values to update automatically whenever new categories or products are added to the dataset. Explain how to create a dynamic dropdown list.",
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
    "question": "Calculate weighted average. Scenario: A finance team wants to calculate weighted performance scores where some metrics contribute more importance than others. Write logic to calculate a weighted average using Excel or SQL functions.",
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
    "question": "Merge sheets. Scenario: Business data arrives in multiple Excel sheets from different regions and must be consolidated into a single report for analysis. Explain how to merge multiple sheets efficiently.",
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
    "question": "Sales drop due holiday. Scenario: Management noticed a sudden drop in sales during holiday periods and wants to compare performance against previous years to understand seasonal business impact. Explain how you would analyze this problem.",
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
    "question": "Revenue increased but profit dropped. Scenario: The finance team observed that overall revenue increased significantly, but net profit margins decreased. Analyze the possible reasons and explain how you would investigate the issue using data.",
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
    "question": "Stakeholder wants daily updates. Scenario: Business stakeholders require daily business performance reports with minimal manual effort. Explain how you would build an automated reporting dashboard solution.",
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
    "question": "High traffic low conversions. Scenario: An e-commerce platform is receiving heavy website traffic, but only a small percentage of users complete purchases. Explain how you would analyze the customer funnel and identify drop-off points.",
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
    "question": "Customer churn rising. Scenario: A subscription-based company is losing customers at a higher rate than usual and wants to identify the root causes behind churn. Explain how you would perform churn analysis using customer data.",
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
    "question": "Website bounce rate high. Scenario: A company noticed that users are leaving the website immediately after visiting landing pages, reducing conversion opportunities. Explain how you would analyze and improve the bounce rate problem.",
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
    "question": "Create YoY growth measure. Scenario: Executives want a dashboard KPI that compares current year sales against previous year performance for strategic decision-making. Write logic to calculate Year-over-Year growth.",
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
    "question": "Dynamic KPI card. Scenario: A Power BI dashboard requires interactive KPI cards that automatically update based on filters such as region, product category, and date range. Explain how you would create a dynamic KPI card.",
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
    "question": "Create date table. Scenario: A BI reporting solution requires a centralized calendar table to support time intelligence calculations such as YTD, MTD, and YoY growth. Write logic to create a date table.",
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
    "question": "Running total in DAX. Scenario: Management wants cumulative sales metrics displayed in dashboards to track progressive business growth over time. Write DAX logic to calculate a running total.",
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
    "question": "Top N filter. Scenario: Executives only want to display the top-performing products, stores, or employees in dashboards for focused decision-making. Explain how to implement a Top N filter in Power BI or SQL.",
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
    "question": "Create KPI indicator. Scenario: A reporting dashboard requires visual indicators that automatically show whether performance targets are achieved or missed. Write logic to create KPI indicators using conditional rules.",
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
    "question": "Group sales by category. Scenario: A retail company wants to analyze total sales performance across product categories for business reporting and inventory planning. Write code to group sales by category.",
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
    "question": "Find duplicates. Scenario: Data engineers discovered repeated records in a dataset which are affecting reporting accuracy and machine learning training quality. Write logic to identify duplicate records in the dataset.",
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
    "question": "Replace missing values. Scenario: A customer analytics dataset contains missing values which are negatively impacting reports and predictive model performance. Write logic to replace missing values appropriately.",
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
    "question": "Create bar chart. Scenario: Business stakeholders want a simple visual comparison of sales performance across different categories or regions. Write Python code to create a bar chart for visualization.",
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
    "question": "Sort dataframe. Scenario: A reporting workflow requires customer or transaction data to be sorted by revenue, date, or priority before generating reports. Write logic to sort a pandas DataFrame.",
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
    "question": "Convert datatype. Scenario: Data imported from CSV files contains incorrect data types such as numeric values stored as strings, causing calculation issues. Write code to convert data types correctly.",
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
    "question": "Filter rows. Scenario: A business analyst only wants records matching specific conditions such as high-value customers, completed orders, or transactions from a specific region. Write logic to filter rows from a dataset efficiently.",
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
    "question": "Dashboard slow. Scenario: A Power BI dashboard is taking too long to load because of heavy visuals and inefficient data models. Explain how you would optimize dashboard performance for business users.",
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
    "question": "Stakeholder changes requirements frequently. Scenario: During dashboard or pipeline development, business stakeholders continuously update reporting requirements. Explain how you would handle changing requirements using agile and iterative delivery practices.",
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
    "question": "KPI mismatch across teams. Scenario: Different business teams are calculating KPIs differently, causing inconsistent reports and confusion during leadership reviews. Explain how you would standardize KPI definitions across teams.",
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
    "question": "Duplicate customer IDs. Scenario: Customer master data contains duplicate customer IDs because of poor ingestion validation and system synchronization issues. Explain how you would clean and resolve duplicate customer records.",
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
    "question": "Revenue spike suspicious. Scenario: A dashboard suddenly shows an abnormal revenue increase that leadership suspects may be caused by duplicate records or incorrect source data. Explain how you would validate and investigate the issue.",
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
    "question": "Missing sales data. Scenario: Daily sales reports contain missing transaction records due to source system failures or delayed ingestion. Explain how you would handle and treat missing sales data for reporting accuracy.",
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
    "question": "CEO wants real-time dashboard. Scenario: Leadership requires a live dashboard that updates instantly whenever new transactions arrive from operational systems. Explain how you would design a real-time reporting architecture.",
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
    "question": "Data inconsistency. Scenario: Reports from multiple systems show different values for the same KPI because of inconsistent business rules and transformations. Explain how you would identify and fix data inconsistency issues.",
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
    "question": "Huge Excel file crashing. Scenario: A large Excel file containing millions of rows crashes frequently during analysis and reporting tasks. Explain how you would redesign the solution using scalable technologies.",
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
    "question": "Regional performance low. Scenario: A company observed that sales and customer engagement are underperforming in certain regions compared to others. Explain how you would analyze regional performance issues using data segmentation.",
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
    "question": "Increase app engagement. Scenario: A mobile application has low user retention and engagement metrics. Explain how you would analyze user behavior and optimize the engagement funnel.",
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
    "question": "Marketing spend high low revenue. Scenario: The marketing department is spending heavily on campaigns but revenue growth remains low. Explain how you would perform attribution analysis to identify ineffective channels.",
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
    "question": "Low inventory turnover. Scenario: Warehouses contain products that are not selling quickly, leading to excess inventory and increased storage costs. Explain how you would analyze inventory turnover issues.",
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
    "question": "Seasonal product demand. Scenario: Sales of certain products fluctuate heavily during festive or seasonal periods, making demand forecasting difficult. Explain how you would analyze seasonal product demand patterns.",
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
    "question": "Report automation. Scenario: Analysts spend several hours every day manually preparing reports for leadership. Explain how you would automate the reporting workflow and schedule report refreshes.",
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
    "question": "Executive summary purpose. Scenario: Senior leadership wants a concise dashboard summary containing only the most important KPIs and insights for quick decision-making. Explain the purpose and design approach for an executive summary.",
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
    "question": "Reverse string. Scenario: During application development or data validation, you need to reverse text values for string manipulation tasks. Write Python logic to reverse a string efficiently.",
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
    "question": "Find factorial recursively. Scenario: A coding interview requires you to demonstrate your understanding of recursion and mathematical logic by calculating the factorial of a number recursively.",
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
    "question": "Fibonacci series. Scenario: A programming assessment requires generating the Fibonacci sequence to evaluate your understanding of loops and iterative logic. Write code to generate the Fibonacci series.",
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
    "question": "Remove duplicates from list. Scenario: A Python dataset contains repeated values that must be cleaned before performing analytics or machine learning preprocessing. Write Python logic to remove duplicate values from a list efficiently.",
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
    "question": "Find first non-repeating char. Scenario: A text-processing application needs to identify the first unique character in user input for parsing and validation purposes. Write Python logic to find the first non-repeating character in a string.",
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
    "question": "Check palindrome. Scenario: A coding assessment requires validating whether a string or word reads the same forward and backward. Write Python logic to check whether a string is a palindrome.",
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
    "question": "Count word frequency. Scenario: A text analytics pipeline needs to identify the most frequently used words in customer reviews and feedback data. Write Python logic to calculate word frequencies from text input.",
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
    "question": "Merge two dictionaries. Scenario: Data from two different APIs is stored in separate Python dictionaries and must be combined into a single structure for processing. Write Python code to merge two dictionaries.",
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
    "question": "Flatten nested list. Scenario: Data received from APIs or JSON files contains nested list structures that must be flattened before analysis. Write Python logic to flatten a nested list efficiently.",
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
    "question": "Sort list of tuples. Scenario: A dataset contains tuples representing employees and salaries, and the business wants records sorted based on a specific field such as salary or age. Write Python code to sort a list of tuples.",
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
    "question": "Find max occurring element. Scenario: An analytics system wants to identify the most frequently occurring product, category, or value from transaction data. Write Python logic to find the maximum occurring element.",
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
    "question": "Binary search implementation. Scenario: A large sorted dataset requires fast searching operations for optimized application performance. Write Python code to implement binary search efficiently.",
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
    "question": "Bubble sort logic. Scenario: A programming interview requires demonstrating your understanding of sorting algorithms and iterative comparisons. Write logic to implement bubble sort.",
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
    "question": "Detect cycle in list. Scenario: A linked list or graph-based application requires identifying loops to prevent infinite processing and system crashes. Write logic to detect cycles in a list or linked structure.",
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
    "question": "Prime number check. Scenario: A coding challenge requires validating whether a number is prime while optimizing the solution for performance. Write Python logic to check prime numbers efficiently.",
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
    "question": "Find anagram strings. Scenario: A text-processing application needs to determine whether two strings contain the same characters in different order. Write Python logic to identify anagram strings.",
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
    "question": "Find missing number. Scenario: A sequence dataset contains one missing value because of ingestion or transmission errors. Write logic to identify the missing number from the sequence.",
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
    "question": "Rotate array. Scenario: A system handling circular data structures or scheduling applications requires rotating array elements dynamically. Write Python logic to rotate an array using slicing operations.",
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
    "question": "Remove punctuation. Scenario: Customer reviews and text data contain punctuation symbols that must be removed before NLP preprocessing and sentiment analysis. Write Python logic to remove punctuation from text.",
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
    "question": "Count vowels. Scenario: A text-processing utility requires counting vowels from user-entered text for language analysis and validation tasks. Write Python logic to count vowels in a string.",
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
    "question": "Read JSON file. Scenario: An ETL pipeline receives semi-structured JSON data from APIs and applications which must be loaded for processing and analytics. Write Python code to read a JSON file.",
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
    "question": "API request. Scenario: A data pipeline needs to fetch live business data such as weather, stock prices, or customer details from external APIs. Write Python code to make an API request and retrieve data.",
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
    "question": "Create dataframe. Scenario: Raw business data is available in lists or dictionaries and needs to be structured into a tabular format for analysis. Write Python code to create a pandas DataFrame.",
    "initialCode": "# Write your solution here\n",
    "expectedKeywords": [
      "pd.DataFrame."
    ],
    "tags": [
      "Data Engineering",
      "General"
    ]
  }
];