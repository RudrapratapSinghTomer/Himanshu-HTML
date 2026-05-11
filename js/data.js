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
  { w: 6, phase: 'da2', title: 'Advanced Analytics (PySpark)', tools: ['PySpark', 'Databricks'], goals: 'Day-1: Spark for Analysts, Day-2: Handling Huge Datasets (Parquet), Day-3: Databricks Dashboards' },
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
  { domain: 'Data Analyst', color: '#3B82F6', key: 'da1', name: 'SQL Joins & Window Functions', before: 0, now: 0, target: 5 },
  { domain: 'Data Analyst', color: '#3B82F6', key: 'da2', name: 'Power BI DAX & Star Schema', before: 0, now: 0, target: 5 },
  { domain: 'Data Analyst', color: '#3B82F6', key: 'da3', name: 'Python (Pandas/Seaborn) for EDA', before: 0, now: 0, target: 5 },
  
  { domain: 'Data Engineering', color: '#6366F1', key: 'de1', name: 'Cloud Ingestion (ADF/GCP)', before: 0, now: 0, target: 5 },
  { domain: 'Data Engineering', color: '#6366F1', key: 'de2', name: 'PySpark & Distributed Compute', before: 0, now: 0, target: 5 },
  { domain: 'Data Engineering', color: '#6366F1', key: 'de3', name: 'Delta Lake & Medallion Arch', before: 0, now: 0, target: 5 },
  
  { domain: 'Data Science', color: '#8B5CF6', key: 'ds1', name: 'ML - Supervised/Unsupervised', before: 0, now: 0, target: 5 },
  { domain: 'Data Science', color: '#8B5CF6', key: 'ds2', name: 'Deep Learning (PyTorch/TF)', before: 0, now: 0, target: 5 },
  { domain: 'Data Science', color: '#8B5CF6', key: 'ds3', name: 'MLOps & Model Tracking', before: 0, now: 0, target: 5 },
];

const PROJECTS = [
  // --- DATA ANALYST ---
  { id: 'da_p1', phase: 'da1', color: '#3B82F6', num: '01', title: 'SQL Retail Analytics', tools: ['SQL'], dataset: 'Superstore', kaggle: 'https://www.kaggle.com/datasets/pankajbhowmik/superstore-data', tasks: ['Join tables', 'Calculate MoM growth', 'Window functions for ranking'], q: 'Which region has the highest growth?', insight: 'West region growing 12% MoM', status: 'Not Started' },
  { id: 'da_p2', phase: 'da2', color: '#14B8A6', num: '02', title: 'Advanced PBI Dashboard', tools: ['Power BI'], dataset: 'AdventureWorks', kaggle: 'https://www.kaggle.com', tasks: ['Complex DAX', 'RLS Implementation', 'Page tooltips'], q: 'Total Revenue vs Target?', insight: '15% above target in Q4', status: 'Not Started' },

  // --- DATA ENGINEERING ---
  { id: 'de_p1', phase: 'de1', color: '#6366F1', num: '01', title: 'Cloud ETL Pipeline', tools: ['ADF', 'GCP'], dataset: 'Log events', kaggle: 'https://www.kaggle.com', tasks: ['Ingest JSON', 'Transform to Parquet', 'Load to BigQuery'], q: 'Latency trends?', insight: 'Average latency decreased by 20%', status: 'Not Started' },
  { id: 'de_p2', phase: 'de2', color: '#4361ee', num: '02', title: 'Delta Lake Implementation', tools: ['Databricks'], dataset: 'IoT Sensors', kaggle: 'https://www.kaggle.com', tasks: ['Bronze to Gold layer', 'Schema evolution', 'Time travel analysis'], q: 'Sensor failure rate?', insight: 'High failure in Sensor-B', status: 'Not Started' },

  // --- DATA SCIENCE ---
  { id: 'ds_p1', phase: 'ds1', color: '#8B5CF6', num: '01', title: 'Customer Churn Model', tools: ['Scikit-Learn'], dataset: 'Telco Churn', kaggle: 'https://www.kaggle.com', tasks: ['Feature scaling', 'Logistic Regression', 'ROC-AUC curve'], q: 'Best predictor of churn?', insight: 'Contract type is #1 predictor', status: 'Not Started' },
  { id: 'ds_p2', phase: 'ds2', color: '#9d4edd', num: '02', title: 'LLM Chatbot Deploy', tools: ['PyTorch', 'Streamlit'], dataset: 'Wiki text', kaggle: 'https://www.kaggle.com', tasks: ['Fine-tuning', 'Quantization', 'Web deployment'], q: 'Model accuracy?', insight: '92% retrieval precision', status: 'Not Started' },
];

const RESOURCES = [
  { domain: 'Data Analyst', type: 'Course', name: 'SQL for Analysts (Mode)', url: 'https://mode.com/sql-tutorial', priority: 'must', tags: ['sql', 'analytics'] },
  { domain: 'Data Analyst', type: 'Video', name: 'Power BI Masterclass', url: 'https://www.youtube.com', priority: 'must', tags: ['viz', 'dax'] },
  
  { domain: 'Data Engineering', type: 'Course', name: 'Data Engineering on GCP', url: 'https://cloud.google.com/training', priority: 'must', tags: ['cloud', 'etl'] },
  { domain: 'Data Engineering', type: 'Docs', name: 'Databricks Delta Lake Guide', url: 'https://docs.delta.io', priority: 'must', tags: ['spark', 'delta'] },
  
  { domain: 'Data Science', type: 'Course', name: 'Machine Learning (Andrew Ng)', url: 'https://www.coursera.org', priority: 'must', tags: ['ml', 'stats'] },
  { domain: 'Data Science', type: 'Practice', name: 'Kaggle Competitions', url: 'https://www.kaggle.com', priority: 'must', tags: ['ml', 'practice'] },
];
