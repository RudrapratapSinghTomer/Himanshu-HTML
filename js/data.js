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
  rating: 0,
  dayStatus: {}
};

const ROADMAPS = {
  'Data Engineering': [
    { id: 'de1', name: 'Month 1: The Core Engineering Sprint', color: '#6366F1', weeks: [1, 2, 3, 4] },
  ],
  'Data Science': [
    { id: 'ds1', name: 'Month 1: Foundations & ML Basics', color: '#8B5CF6', weeks: [1, 2, 3, 4] },
    { id: 'ds2', name: 'Month 2: Advanced ML & Deployment', color: '#8B5CF6', weeks: [5, 6, 7, 8, 9] },
  ]
};

const WEEKS = [
  // --- DATA ENGINEERING (The Architect) ---
  { 
    w: 1, 
    phase: 'de1', 
    title: 'SQL (Basic to Advanced)', 
    tools: ['SQL'], 
    goals: 'Day-1: Foundational Queries – Mastering SELECT, WHERE, and logical operators. Day-2: The Join Logic – Using INNER, LEFT, and CROSS JOINS. Day-3: Aggregations & Grouping – Using GROUP BY and HAVING to summarize data. Day-4: Advanced Window Functions – Applying RANK(), LEAD/LAG, and PARTITION BY. Day-5: DDL/DML & Performance – Creating/Altering tables and using INDEXING. Day-6: Complex Logic (CTEs) – Writing Common Table Expressions for nested queries.' 
  },
  { 
    w: 2, 
    phase: 'de1', 
    title: 'Python & PySpark (The Processing Engine)', 
    tools: ['Python', 'PySpark'], 
    goals: 'Day-1: Python for Data – Handling file I/O (CSV/JSON) and error logging. Day-2: Intro to Distributed Computing – Understanding Spark parallel processing. Day-3: PySpark DataFrames – Using Spark API to filter and aggregate massive datasets. Day-4: Spark SQL & Functions – Running SQL queries directly on Spark DataFrames. Day-5: Data Cleaning at Scale – Handling NULL values and schema inconsistencies. Day-6: Data Writing & Formats – Saving data in Parquet and Avro formats.' 
  },
  { 
    w: 3, 
    phase: 'de1', 
    title: 'Power BI (Visualizing the Pipeline)', 
    tools: ['Power BI'], 
    goals: 'Day-1: Connecting to Sources – Linking to SQL and Cloud (ADLS/S3). Day-2: Power Query (M Language) – Shaping and cleaning data. Day-3: Data Modeling Basics – Creating a Star Schema (Fact/Dimension). Day-4: Basic DAX – Writing formulas like CALCULATE and SUM. Day-5: Visual Design – Building interactive charts and Slicers. Day-6: Service & Sharing – Publishing to Power BI Service.' 
  },
  { 
    w: 4, 
    phase: 'de1', 
    title: 'Cloud & Orchestration (ADF / Databricks / Fabric)', 
    tools: ['ADF', 'Databricks', 'Fabric'], 
    goals: 'Day-1: Cloud Ingestion (ADF) – Building pipelines to move data to cloud. Day-2: Databricks Workspace – Setting up clusters and using notebooks. Day-3: The Medallion Architecture – Bronze, Silver, Gold strategy. Day-4: Microsoft Fabric (OneLake) – Unified SaaS platform. Day-5: Delta Lake Logic – ACID transactions (Upserts/Deletes). Day-6: Capstone Pipeline – End-to-end flow: ADF → Databricks → Power BI.' 
  },

  // --- DATA SCIENCE ---
  { w: 1, phase: 'ds1', title: 'SQL (Data Extraction)', tools: ['SQL'], goals: 'Day-1: Retrieval, Day-2: Filtering, Day-3: Aggregation, Day-4: Window Functions, Day-5: Data Sampling, Day-6: Formatting' },
  { w: 2, phase: 'ds1', title: 'Python & PySpark (Scalable ML)', tools: ['Python', 'PySpark'], goals: 'Day-1: Scikit-Learn, Day-2: Stats Foundations, Day-3: MLlib Basics, Day-4: Feature Engineering, Day-5: Regressions, Day-6: Spark ML Pipelines' },
  { w: 3, phase: 'ds1', title: 'Power BI (Model Evaluation)', tools: ['Power BI'], goals: 'Day-1: Confusion Matrix, Day-2: Python Scripts, Day-3: What-If Analysis, Day-4: RMSE DAX, Day-5: Storytelling, Day-6: Stakeholder Reporting' },
  { w: 4, phase: 'ds1', title: 'Cloud DS & AutoML', tools: ['Databricks', 'Fabric'], goals: 'Day-1: MLflow, Day-2: AutoML, Day-3: Distributed Training, Day-4: Deployment, Day-5: Drift Monitoring, Day-6: ML Project' },
  { w: 5, phase: 'ds2', title: 'Deep Learning Foundations', tools: ['PyTorch', 'Keras'], goals: 'Day-1: Neural Nets 101, Day-2: Activation Functions, Day-3: Backpropagation, Day-4: CNN Basics, Day-5: Training Loops, Day-6: Simple Image Classifier' },
  { w: 6, phase: 'ds2', title: 'Natural Language Processing', tools: ['HuggingFace', 'OpenAI'], goals: 'Day-1: Tokenization, Day-2: Embeddings, Day-3: Transformers, Day-4: Prompt Engineering, Day-5: Vector DBs, Day-6: Chatbot MVP' },
  { w: 7, phase: 'ds2', title: 'MLOps & CI/CD for ML', tools: ['MLflow', 'GitHub Actions'], goals: 'Day-1: Experiment Tracking, Day-2: Model Registry, Day-3: Automated Testing, Day-4: CI/CD Pipelines, Day-5: Production Serving, Day-6: MLOps Audit' },
  { w: 8, phase: 'ds2', title: 'Advanced Scalability', tools: ['Dask', 'Ray'], goals: 'Day-1: Parallelizing Python, Day-2: Ray Core, Day-3: Dask DataFrames, Day-4: Distributed Hyperopt, Day-5: Memory Management, Day-6: Scale Test' },
  { w: 9, phase: 'ds2', title: 'DS Capstone Project', tools: ['Full Stack DS'], goals: 'Day-1: Scoping, Day-2: Ingestion, Day-3: Model Selection, Day-4: Optimization, Day-5: Final Dashboard, Day-6: Presentation' },
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
  { id: 'de_p1', phase: 'de1', color: '#6366F1', num: '01', title: 'Cloud ETL Pipeline', tools: ['ADF', 'Databricks'], dataset: 'Log events', kaggle: 'https://www.kaggle.com', tasks: ['Ingest JSON', 'Transform to Parquet', 'Load to Lakehouse'], q: 'Latency trends?', insight: 'Average latency decreased by 20%', status: 'Not Started' },
  { id: 'de_p2', phase: 'de1', color: '#4361ee', num: '02', title: 'Delta Lake Implementation', tools: ['Databricks', 'Fabric'], dataset: 'IoT Sensors', kaggle: 'https://www.kaggle.com', tasks: ['Bronze to Gold layer', 'Schema evolution', 'Time travel analysis'], q: 'Sensor failure rate?', insight: 'High failure in Sensor-B', status: 'Not Started' },

  { id: 'ds_p1', phase: 'ds1', color: '#8B5CF6', num: '01', title: 'Scalable Churn Model', tools: ['PySpark', 'MLlib'], dataset: 'Telco Churn', kaggle: 'https://www.kaggle.com', tasks: ['Feature scaling', 'Distributed Training', 'MLflow tracking'], q: 'Best predictor of churn?', insight: 'Contract type is #1 predictor', status: 'Not Started' },
  { id: 'ds_p2', phase: 'ds2', color: '#9d4edd', num: '02', title: 'GenAI RAG System', tools: ['OpenAI', 'Databricks'], dataset: 'Wiki text', kaggle: 'https://www.kaggle.com', tasks: ['Vector indexing', 'Prompt engineering', 'Deployment'], q: 'Model precision?', insight: '92% retrieval precision', status: 'Not Started' },
];

const RESOURCES = [
  { domain: 'Data Engineering', type: 'Course', name: 'Azure Data Factory Fundamentals', url: 'https://learn.microsoft.com', priority: 'must', tags: ['cloud', 'adf'] },
  { domain: 'Data Engineering', type: 'Docs', name: 'Databricks Delta Lake Guide', url: 'https://docs.delta.io', priority: 'must', tags: ['spark', 'delta'] },
  
  { domain: 'Data Science', type: 'Course', name: 'Scalable ML with Spark', url: 'https://www.coursera.org', priority: 'must', tags: ['ml', 'spark'] },
  { domain: 'Data Science', type: 'Practice', name: 'Kaggle Competitions', url: 'https://www.kaggle.com', priority: 'must', tags: ['ml', 'practice'] },
];
