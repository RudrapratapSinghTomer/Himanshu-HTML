// Static data for the Bestpeers Learning Dashboard
const MOCK_USERS = [];

const defaultState = {
  firstName: '',
  lastName: '',
  role: 'user',
  assignedRoadmap: 'Data Engineering',
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
  'Data Engineering': [
    { id: 'de1', name: 'Month 1: The Core Engineering Sprint', color: '#6366F1', weeks: [1, 2, 3, 4] },
  ],
  'Data Science': [
    { id: 'ds1', name: 'Month 1: The Machine Learning Sprint', color: '#8B5CF6', weeks: [1, 2, 3, 4] },
  ]
};

const WEEKS = [
  // --- DATA ENGINEERING ---
  { w: 1, phase: 'de1', title: 'SQL (Basic to Advanced)', tools: ['SQL'], goals: 'Day-1: Foundational Queries (SELECT/WHERE), Day-2: Join Logic (INNER/LEFT/CROSS), Day-3: Aggregations & Grouping, Day-4: Advanced Window Functions, Day-5: DDL/DML & Performance, Day-6: Complex Logic (CTEs)' },
  { w: 2, phase: 'de1', title: 'Python & PySpark (Processing)', tools: ['Python', 'PySpark'], goals: 'Day-1: Python for Data I/O, Day-2: Distributed Computing Concepts, Day-3: PySpark DataFrames, Day-4: Spark SQL & Functions, Day-5: Data Cleaning at Scale, Day-6: Data Writing & Formats (Parquet)' },
  { w: 3, phase: 'de1', title: 'Power BI (The Pipeline)', tools: ['Power BI'], goals: 'Day-1: Connecting to Sources (SQL/Cloud), Day-2: Power Query (M Language), Day-3: Data Modeling Basics (Star Schema), Day-4: Basic DAX (CALCULATE), Day-5: Visual Design & Slicers, Day-6: Service & Sharing' },
  { w: 4, phase: 'de1', title: 'Cloud & Orchestration', tools: ['ADF', 'Databricks', 'Fabric'], goals: 'Day-1: Cloud Ingestion (ADF), Day-2: Databricks Workspace & Notebooks, Day-3: Medallion Architecture, Day-4: Microsoft Fabric (OneLake), Day-5: Delta Lake Logic (ACID), Day-6: Capstone Pipeline Project' },

  // --- DATA SCIENCE ---
  { w: 1, phase: 'ds1', title: 'SQL (Data Extraction)', tools: ['SQL'], goals: 'Day-1: Retrieval (Efficient SELECT), Day-2: Filtering & Case Logic, Day-3: Feature Aggregation (GROUP BY), Day-4: Window Functions for Trends, Day-5: Data Sampling, Day-6: SQL Clean-up & Formatting' },
  { w: 2, phase: 'ds1', title: 'Python & PySpark (Scalable ML)', tools: ['Python', 'PySpark'], goals: 'Day-1: Scikit-Learn Foundations, Day-2: Stats with Python, Day-3: PySpark MLlib, Day-4: Distributed Feature Engineering, Day-5: Linear & Logistic Regression, Day-6: Spark ML Pipelines' },
  { w: 3, phase: 'ds1', title: 'Power BI (Model Evaluation)', tools: ['Power BI'], goals: 'Day-1: Visualizing Results (Confusion Matrix), Day-2: Power BI + Python Scripts, Day-3: Dynamic Dashboards (What-If), Day-4: DAX for Data Science (RMSE), Day-5: Storytelling (Key Influencers), Day-6: Stakeholder Reporting' },
  { w: 4, phase: 'ds1', title: 'Cloud DS & AutoML', tools: ['Databricks', 'Fabric'], goals: 'Day-1: MLflow on Databricks, Day-2: AutoML (Fabric/Databricks), Day-3: Distributed Training, Day-4: Model Deployment (API), Day-5: Monitoring Drift, Day-6: Final DS Project' },
];


const SKILLS = [
  { domain: 'Data Engineering', color: '#6366F1', key: 'de1', name: 'Cloud Ingestion (ADF/Fabric)', before: 0, now: 0, target: 5 },
  { domain: 'Data Engineering', color: '#6366F1', key: 'de2', name: 'PySpark & Distributed Compute', before: 0, now: 0, target: 5 },
  { domain: 'Data Engineering', color: '#6366F1', key: 'de3', name: 'Delta Lake & Medallion Arch', before: 0, now: 0, target: 5 },
  
  { domain: 'Data Science', color: '#8B5CF6', key: 'ds1', name: 'Scalable ML with PySpark', before: 0, now: 0, target: 5 },
  { domain: 'Data Science', color: '#8B5CF6', key: 'ds2', name: 'Deep Learning & LLM APIs', before: 0, now: 0, target: 5 },
  { domain: 'Data Science', color: '#8B5CF6', key: 'ds3', name: 'MLOps & Model Tracking', before: 0, now: 0, target: 5 },
];

const PROJECTS = [
  // --- DATA ENGINEERING ---
  { id: 'de_p1', phase: 'de1', color: '#6366F1', num: '01', title: 'Cloud ETL Pipeline', tools: ['ADF', 'Databricks'], dataset: 'Log events', kaggle: 'https://www.kaggle.com', tasks: ['Ingest JSON', 'Transform to Parquet', 'Load to Lakehouse'], q: 'Latency trends?', insight: 'Average latency decreased by 20%', status: 'Not Started' },
  { id: 'de_p2', phase: 'de2', color: '#4361ee', num: '02', title: 'Delta Lake Implementation', tools: ['Databricks', 'Fabric'], dataset: 'IoT Sensors', kaggle: 'https://www.kaggle.com', tasks: ['Bronze to Gold layer', 'Schema evolution', 'Time travel analysis'], q: 'Sensor failure rate?', insight: 'High failure in Sensor-B', status: 'Not Started' },

  // --- DATA SCIENCE ---
  { id: 'ds_p1', phase: 'ds1', color: '#8B5CF6', num: '01', title: 'Scalable Churn Model', tools: ['PySpark', 'MLlib'], dataset: 'Telco Churn', kaggle: 'https://www.kaggle.com', tasks: ['Feature scaling', 'Distributed Training', 'MLflow tracking'], q: 'Best predictor of churn?', insight: 'Contract type is #1 predictor', status: 'Not Started' },
  { id: 'ds_p2', phase: 'ds2', color: '#9d4edd', num: '02', title: 'GenAI RAG System', tools: ['OpenAI', 'Databricks'], dataset: 'Wiki text', kaggle: 'https://www.kaggle.com', tasks: ['Vector indexing', 'Prompt engineering', 'Deployment'], q: 'Model precision?', insight: '92% retrieval precision', status: 'Not Started' },
];

const RESOURCES = [
  { domain: 'Data Engineering', type: 'Course', name: 'Azure Data Factory Fundamentals', url: 'https://learn.microsoft.com', priority: 'must', tags: ['cloud', 'adf'] },
  { domain: 'Data Engineering', type: 'Docs', name: 'Databricks Delta Lake Guide', url: 'https://docs.delta.io', priority: 'must', tags: ['spark', 'delta'] },
  
  { domain: 'Data Science', type: 'Course', name: 'Scalable ML with Spark', url: 'https://www.coursera.org', priority: 'must', tags: ['ml', 'spark'] },
  { domain: 'Data Science', type: 'Practice', name: 'Kaggle Competitions', url: 'https://www.kaggle.com', priority: 'must', tags: ['ml', 'practice'] },
];
