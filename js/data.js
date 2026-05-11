// Static data for the Bestpeers Learning Dashboard
const MOCK_USERS = [];

const defaultState = {
  firstName: '',
  lastName: '',
  role: 'user',
  assignedRoadmap: 'Data Analyst',
  weekStatus: {},
  projectTasks: {},
  projectStatus: {},
  skillNow: {},
  logEntries: [],
  weekReviews: {},
  selectedMood: 3,
  selectedReviewWeek: 1,
  activeSkillTab: 'all',
  activeResourceFilter: 'All',
  streak: 0,
  rating: 0
};

const ROADMAPS = {
  'Data Analyst': [
    { id: 'da1', name: 'Month 1: The Core Analyst', color: '#3B82F6', weeks: [1, 2, 3, 4] },
    { id: 'da2', name: 'Month 2: Advanced Analyst', color: '#14B8A6', weeks: [5, 6, 7, 8] },
  ],
  'Data Engineering': [
    { id: 'de1', name: 'Month 1: The Foundation Engineer', color: '#6366F1', weeks: [1, 2, 3, 4] },
    { id: 'de2', name: 'Month 2: Advanced Data Engineer', color: '#4361ee', weeks: [5, 6, 7, 8] },
  ],
  'Data Science': [
    { id: 'ds1', name: 'Month 1: The Machine Learning Starter', color: '#8B5CF6', weeks: [1, 2, 3, 4] },
    { id: 'ds2', name: 'Month 2: Advanced Data Scientist', color: '#9d4edd', weeks: [5, 6, 7, 8] },
  ]
};

const WEEKS = [
  // --- DATA ANALYST ---
  { w: 1, phase: 'da1', title: 'SQL Foundations', tools: ['SQL'], goals: 'Day-1: SELECT & Filtering, Day-2: Joins & Unions, Day-3: Aggregations (Sums/Avg), Day-4: Subqueries & CTEs, Day-5: Window Functions, Day-6: Data Cleaning, Day-7: SQL Case Study' },
  { w: 2, phase: 'da1', title: 'Power BI & Data Modeling', tools: ['Power BI'], goals: 'Day-1: Ingestion & Power Query, Day-2: Star Schema Modeling, Day-3: DAX Basics, Day-4: Time Intelligence, Day-5: Visual Selection & UX, Day-6: Interactivity, Day-7: Dashboard Project' },
  { w: 3, phase: 'da1', title: 'Python for Analysis', tools: ['Python', 'Pandas'], goals: 'Day-1: Data Structures, Day-2: Pandas DataFrames, Day-3: Data Cleaning, Day-4: Merging & Pivoting, Day-5: Seaborn Plots, Day-6: EDA Patterns, Day-7: Python Analysis Project' },
  { w: 4, phase: 'da1', title: 'Business Intelligence & Logic', tools: ['Stats', 'BI'], goals: 'Day-1: KPI Definition, Day-2: Statistical Distributions, Day-3: Correlation & Outliers, Day-4: Storytelling with Data, Day-5: Portfolio, Day-6: Resume, Day-7: Final Capstone' },
  { w: 5, phase: 'da2', title: 'Fabric & Advanced Power BI', tools: ['MS Fabric', 'Power BI'], goals: 'Day-1: Intro to Fabric OneLake, Day-2: Direct Lake Mode, Day-3: DAX Optimization, Day-4: Power BI Service Admin, Day-5: Row Level Security, Day-6: Fabric Data Factory' },
  { w: 6, phase: 'da2', title: 'Big Data Analytics (PySpark)', tools: ['PySpark', 'Databricks'], goals: 'Day-1: Spark for Analysts, Day-2: Handling Huge Datasets (Parquet), Day-3: Databricks Dashboards' },
  { w: 7, phase: 'da2', title: 'Stats & Enterprise Portfolio I', tools: ['Stats'], goals: 'A/B Testing logic, Time Series Forecasting' },
  { w: 8, phase: 'da2', title: 'Stats & Enterprise Portfolio II', tools: ['MS Fabric'], goals: 'Final Capstone built entirely on Microsoft Fabric' },

  // --- DATA ENGINEERING ---
  { w: 1, phase: 'de1', title: 'SQL for Engineering', tools: ['SQL'], goals: 'Day-1: DDL/DML Operations, Day-2: Views & Stored Procedures, Day-3: Indexing & Partitioning, Day-4: Query Optimization, Day-5: ACID Properties, Day-6: NoSQL vs SQL, Day-7: Database Design Project' },
  { w: 2, phase: 'de1', title: 'Python & Automation', tools: ['Python'], goals: 'Day-1: Scripting & Modules, Day-2: Error Handling & Logging, Day-3: API Extraction, Day-4: JSON & Parquet, Day-5: SQLAlchemy, Day-6: Cron Jobs, Day-7: Automation Project' },
  { w: 3, phase: 'de1', title: 'Cloud Ingestion (ADF/GCP)', tools: ['ADF', 'GCP'], goals: 'Day-1: Cloud Storage Basics, Day-2: ADF Linked Services, Day-3: Copy Activity, Day-4: Control Flow, Day-5: GCP Dataflow, Day-6: Ingestion Patterns, Day-7: Pipeline Project' },
  { w: 4, phase: 'de1', title: 'PySpark Basics', tools: ['PySpark'], goals: 'Day-1: Distributed Computing, Day-2: SparkSession & DataFrames, Day-3: Transformations vs Actions, Day-4: PySpark Data Cleaning, Day-5: Working with Schemas, Day-6: Writing to DBs, Day-7: ETL Project' },
  { w: 5, phase: 'de2', title: 'Databricks & Delta Lake', tools: ['Databricks'], goals: 'Day-1: Delta Lake ACID, Day-2: Time Travel, Day-3: Medallion Architecture (Bronze/Silver/Gold)' },
  { w: 6, phase: 'de2', title: 'Fabric & Unified Data', tools: ['MS Fabric'], goals: 'Day-1: Lakehouse vs Warehouse, Day-2: Shortcuts' },
  { w: 7, phase: 'de2', title: 'Governance & DevOps I', tools: ['Unity Catalog'], goals: 'Unity Catalog for security and governance' },
  { w: 8, phase: 'de2', title: 'Governance & DevOps II', tools: ['CI/CD'], goals: 'Git Integration for pipelines, CI/CD to automate deployments' },

  // --- DATA SCIENCE ---
  { w: 1, phase: 'ds1', title: 'Stats & Python Foundations', tools: ['Python', 'NumPy'], goals: 'Day-1: DS Libraries, Day-2: Descriptive Stats, Day-3: Probability Theory, Day-4: NumPy Math, Day-5: Data Distribution, Day-6: Handling Outliers, Day-7: Stats Project' },
  { w: 2, phase: 'ds1', title: 'Machine Learning - Supervised', tools: ['Scikit-Learn'], goals: 'Day-1: Linear Regression, Day-2: Logistic Regression, Day-3: Decision Trees, Day-4: Random Forest, Day-5: Model Evaluation (RMSE), Day-6: Bias-Variance, Day-7: Prediction Project' },
  { w: 3, phase: 'ds1', title: 'Advanced ML & SQL', tools: ['SQL', 'ML'], goals: 'Day-1: SVM & KNN, Day-2: K-Means Clustering, Day-3: Feature Extraction with SQL, Day-4: Scaling & Normalization, Day-5: Feature Encoding, Day-6: Hyperparameter Tuning, Day-7: Classification Project' },
  { w: 4, phase: 'ds1', title: 'Visualization & Deployment', tools: ['Plotly', 'Streamlit'], goals: 'Day-1: Matplotlib/Plotly, Day-2: PBI for Model Monitoring, Day-3: Streamlit, Day-4: Model Pickling, Day-5: SHAP Values (Explainability), Day-6: Portfolio Setup, Day-7: End-to-end ML Project' },
  { w: 5, phase: 'ds2', title: 'Big Data ML (PySpark)', tools: ['PySpark'], goals: 'Day-1: Spark MLlib, Day-2: Distributed Training' },
  { w: 6, phase: 'ds2', title: 'Cloud ML (Databricks/Fabric)', tools: ['Databricks'], goals: 'Day-1: MLflow Tracking, Day-2: Databricks AutoML' },
  { w: 7, phase: 'ds2', title: 'Deep Learning & MLOps I', tools: ['PyTorch', 'TensorFlow'], goals: 'Neural Networks, GenAI/LLM APIs' },
  { w: 8, phase: 'ds2', title: 'Deep Learning & MLOps II', tools: ['MLOps'], goals: 'Model Drift detection and retraining patterns' },
];


const SKILLS = [
  { domain: 'SQL', color: '#3B82F6', key: 'sql1', name: 'SQL Joins & Subqueries', before: 4, now: 4, target: 5 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql2', name: 'Window Functions', before: 3, now: 3, target: 5 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql3', name: 'CTEs & Recursive Queries', before: 2, now: 2, target: 5 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql4', name: 'Query Optimization & EXPLAIN', before: 2, now: 2, target: 4 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql5', name: 'Analytics Patterns (cohort/funnel)', before: 0, now: 0, target: 4 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql6', name: 'dbt (Data Build Tool)', before: 0, now: 0, target: 3 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql7', name: 'BigQuery / Snowflake', before: 0, now: 0, target: 3 },
  { domain: 'Python', color: '#8B5CF6', key: 'py1', name: 'Pandas – Data Wrangling', before: 2, now: 2, target: 5 },
  { domain: 'Python', color: '#8B5CF6', key: 'py2', name: 'Matplotlib / Seaborn', before: 1, now: 1, target: 4 },
  { domain: 'Python', color: '#8B5CF6', key: 'py3', name: 'Plotly / Interactive Charts', before: 0, now: 0, target: 4 },
  { domain: 'Python', color: '#8B5CF6', key: 'py4', name: 'Statistics (scipy, numpy)', before: 1, now: 1, target: 4 },
  { domain: 'Python', color: '#8B5CF6', key: 'py5', name: 'Jupyter Notebooks', before: 2, now: 2, target: 5 },
  { domain: 'Python', color: '#8B5CF6', key: 'py6', name: 'EDA Best Practices', before: 1, now: 1, target: 5 },
  { domain: 'Power BI', color: '#F97316', key: 'pbi1', name: 'Power Query (M Language)', before: 0, now: 0, target: 4 },
  { domain: 'Power BI', color: '#F97316', key: 'pbi2', name: 'Data Modeling & Relationships', before: 0, now: 0, target: 5 },
  { domain: 'Power BI', color: '#F97316', key: 'pbi3', name: 'DAX – Basic Measures', before: 0, now: 0, target: 5 },
  { domain: 'Power BI', color: '#F97316', key: 'pbi4', name: 'DAX – Time Intelligence', before: 0, now: 0, target: 4 },
  { domain: 'Power BI', color: '#F97316', key: 'pbi5', name: 'Dashboard Design & UX', before: 0, now: 0, target: 4 },
  { domain: 'Power BI', color: '#F97316', key: 'pbi6', name: 'Power BI Service & Sharing', before: 0, now: 0, target: 3 },
  { domain: 'Excel', color: '#F59E0B', key: 'xl1', name: 'Pivot Tables & Charts', before: 2, now: 2, target: 5 },
  { domain: 'Excel', color: '#F59E0B', key: 'xl2', name: 'XLOOKUP / INDEX-MATCH', before: 2, now: 2, target: 5 },
  { domain: 'Excel', color: '#F59E0B', key: 'xl3', name: 'Power Query in Excel', before: 0, now: 0, target: 4 },
  { domain: 'Excel', color: '#F59E0B', key: 'xl4', name: 'Dynamic Arrays & Spill Formulas', before: 0, now: 0, target: 3 },
  { domain: 'Excel', color: '#F59E0B', key: 'xl5', name: 'Dashboard Design in Excel', before: 0, now: 0, target: 4 },
  { domain: 'Analytics Core', color: '#14B8A6', key: 'ac1', name: 'KPI Design & Business Metrics', before: 0, now: 0, target: 4 },
  { domain: 'Analytics Core', color: '#14B8A6', key: 'ac2', name: 'Cohort & Retention Analysis', before: 0, now: 0, target: 4 },
  { domain: 'Analytics Core', color: '#14B8A6', key: 'ac3', name: 'Funnel Analysis', before: 0, now: 0, target: 4 },
  { domain: 'Analytics Core', color: '#14B8A6', key: 'ac4', name: 'A/B Testing Basics', before: 0, now: 0, target: 3 },
  { domain: 'Analytics Core', color: '#14B8A6', key: 'ac5', name: 'Data Storytelling', before: 0, now: 0, target: 5 },
];

const PROJECTS = [
  { id: 'proj1', phase: 'p1', color: '#14B8A6', num: '01', title: 'KPI Dashboard — Retail Sales', tools: ['Excel'], dataset: 'Sample Superstore', kaggle: 'https://www.kaggle.com/datasets/pankajbhowmik/superstore-data', tasks: ['Define KPIs', 'Clean Data', 'Build Pivot Tables', 'Final Dash'], q: 'Which product categories drive the most profit?', insight: 'Furniture has ~50% lower margin than Technology', status: 'Not Started' },
  { id: 'proj2', phase: 'p2', color: '#3B82F6', num: '02', title: 'Cohort Retention Analysis', tools: ['SQL'], dataset: 'E-commerce transactions', kaggle: 'https://www.kaggle.com/datasets/mkeadhane/ecommerce-behavior-data-from-multi-category-store', tasks: ['Setup Postgres', 'Retention Query', 'Visualization'], q: 'What % of new customers return in month 2?', insight: 'Only 18% retention — email campaigns needed', status: 'Not Started' },
  { id: 'proj3', phase: 'p2', color: '#3B82F6', num: '03', title: 'SQL Funnel Analysis', tools: ['SQL', 'Power BI'], dataset: 'Funnel events table', kaggle: 'https://www.kaggle.com/datasets/mkeadhane/ecommerce-behavior-data-from-multi-category-store', tasks: ['Event Tracking SQL', 'Funnel Visualization'], q: 'Where do users drop off in the checkout flow?', insight: '65% drop at payment page', status: 'Not Started' },
  { id: 'proj4', phase: 'p3', color: '#8B5CF6', num: '04', title: 'Python EDA — HR Analytics', tools: ['Python', 'Pandas'], dataset: 'IBM HR Analytics', kaggle: 'https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset', tasks: ['Pandas Cleaning', 'Statistical Testing', 'EDA Plots'], q: 'What factors predict employee attrition?', insight: 'Overtime + low satisfaction = 40% higher attrition', status: 'Not Started' },
  { id: 'proj5', phase: 'p4', color: '#F97316', num: '05', title: 'Sales Performance Dashboard', tools: ['Power BI', 'DAX'], dataset: 'AdventureWorks', kaggle: 'https://www.kaggle.com/datasets/ukveteran/adventure-works', tasks: ['Power Query', 'DAX Measures', 'Report Design'], q: 'Which region is underperforming vs target?', insight: 'East region 12% below Q3 target', status: 'Not Started' },
  { id: 'proj6', phase: 'p4', color: '#F97316', num: '06', title: 'Marketing Campaign Analysis', tools: ['Power BI', 'Python'], dataset: 'Marketing dataset', kaggle: 'https://www.kaggle.com/datasets/rodsaldanha/arketing-campaign', tasks: ['Campaign Attribution', 'ROI Analysis'], q: 'Which campaign channel has the best ROI?', insight: 'Email ROI 4.2x vs Social 1.8x', status: 'Not Started' },
  { id: 'proj7', phase: 'p5', color: '#F59E0B', num: '07', title: 'Excel Financial Dashboard', tools: ['Excel'], dataset: 'Public company financials', kaggle: 'https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data', tasks: ['Financial Modeling', 'Margin Trends'], q: '3-year revenue & margin trend analysis', insight: 'Margins compressing 2% YoY since 2022', status: 'Not Started' },
  { id: 'proj8', phase: 'p6', color: '#10B981', num: '08', title: 'CAPSTONE — Full Analytics Project', tools: ['SQL', 'Python', 'Power BI'], dataset: 'Self-chosen open dataset', kaggle: 'https://www.kaggle.com', tasks: ['Problem Definition', 'Data Sourcing', 'Analysis', 'Presentation'], q: 'Define your own business question!', insight: 'TBD — this is your proof-of-work', status: 'Not Started' },
];

const RESOURCES = [
  { domain: 'SQL', type: 'Course', name: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial', priority: 'must', tags: ['free', 'interactive'] },
  { domain: 'SQL', type: 'Practice', name: 'LeetCode SQL', url: 'https://leetcode.com/problemset/database/', priority: 'must', tags: ['interview prep'] },
  { domain: 'SQL', type: 'Practice', name: 'DataLemur SQL', url: 'https://datalemur.com', priority: 'must', tags: ['analytics focused'] },
  { domain: 'SQL', type: 'Challenge', name: '8-Week SQL Challenge', url: 'https://8weeksqlchallenge.com', priority: 'must', tags: ['project based', 'free'] },
  { domain: 'SQL', type: 'Practice', name: 'StrataScratch', url: 'https://stratascratch.com', priority: 'high', tags: ['company questions'] },
  { domain: 'Python', type: 'Course', name: 'Kaggle Pandas / Python Course', url: 'https://kaggle.com/learn', priority: 'must', tags: ['free', 'hands-on'] },
  { domain: 'Python', type: 'Reference', name: 'Python Graph Gallery', url: 'https://python-graph-gallery.com', priority: 'high', tags: ['visualization'] },
  { domain: 'Python', type: 'Video', name: 'StatQuest (Josh Starmer)', url: 'https://www.youtube.com/@statquest', priority: 'must', tags: ['stats', 'youtube'] },
  { domain: 'Power BI', type: 'Course', name: 'Microsoft Learn — Power BI', url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi', priority: 'must', tags: ['official', 'free'] },
  { domain: 'Power BI', type: 'Video', name: 'Guy in a Cube', url: 'https://www.youtube.com/@GuyInACube', priority: 'must', tags: ['youtube', 'DAX'] },
  { domain: 'Power BI', type: 'Reference', name: 'SQLBI DAX Patterns', url: 'https://daxpatterns.com', priority: 'must', tags: ['DAX bible'] },
  { domain: 'Excel', type: 'Reference', name: 'ExcelJet', url: 'https://exceljet.net', priority: 'high', tags: ['formulas', 'free'] },
  { domain: 'Excel', type: 'Blog', name: 'Chandoo.org', url: 'https://chandoo.org', priority: 'high', tags: ['dashboards', 'tutorials'] },
  { domain: 'Analytics', type: 'Video', name: 'Alex The Analyst', url: 'https://www.youtube.com/@AlexTheAnalyst', priority: 'must', tags: ['youtube', 'career'] },
  { domain: 'Analytics', type: 'Blog', name: 'Towards Data Science', url: 'https://towardsdatascience.com', priority: 'high', tags: ['deep dives'] },
  { domain: 'Career', type: 'Practice', name: 'Interview Query', url: 'https://interviewquery.com', priority: 'high', tags: ['case studies'] },
];
