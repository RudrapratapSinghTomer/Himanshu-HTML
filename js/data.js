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
  selectedReviewWeek: 20,
  activeSkillTab: 'all',
  activeResourceFilter: 'All',
  streak: 0,
  rating: 0,
  dayStatus: {},
  selectedQuizTopic: 'all'
};

const ROADMAPS = {
  'Data Engineering': [
    { id: 'de1', name: 'Month 1: The Core Engineering Sprint', color: '#6366F1', weeks: [1, 2, 3, 4, 5, 6, 7, 8] },
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
    url: 'https://www.youtube.com/watch?v=OT1RErkfLNQ',
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
    title: 'Microsoft Power BI Desktop for Business Intelligence',
    tools: ['Power BI Hands-on'],
    url: 'https://www.udemy.com/course/microsoft-power-bi-up-running-with-power-bi-desktop/?src=sac&kw=Microsoft+Power+BI+Desktop+for+Business+Intelligence',
    goals: 'Day-1: Data Ingestion & Power Query (The ETL Phase). Day-2: Advanced Data Profiling & Transformation. Day-3: Relational Data Modeling (The Foundation). Day-4: DAX Foundations (Calculated Columns & Measures). Day-5: Advanced DAX & Time Intelligence. Day-6: Data Visualization & UI/UX Design. Day-7: AI Visuals & The Final Capstone Project'
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
  // SQL
  { domain: 'SQL', color: '#3B82F6', key: 'sql1', name: 'SQL Joins & Subqueries', before: 4, now: 4, target: 5 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql2', name: 'Window Functions', before: 3, now: 3, target: 5 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql3', name: 'CTEs & Recursive Queries', before: 2, now: 2, target: 5 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql4', name: 'Query Optimization & EXPLAIN', before: 2, now: 2, target: 4 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql5', name: 'Analytics Patterns (cohort/funnel)', before: 0, now: 0, target: 4 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql6', name: 'dbt (Data Build Tool)', before: 0, now: 0, target: 3 },
  { domain: 'SQL', color: '#3B82F6', key: 'sql7', name: 'BigQuery / Snowflake', before: 0, now: 0, target: 3 },

  // PYTHON
  { domain: 'Python', color: '#8B5CF6', key: 'py1', name: 'Pandas – Data Wrangling', before: 2, now: 2, target: 5 },
  { domain: 'Python', color: '#8B5CF6', key: 'py2', name: 'Matplotlib / Seaborn', before: 1, now: 1, target: 4 },
  { domain: 'Python', color: '#8B5CF6', key: 'py3', name: 'Plotly / Interactive Charts', before: 0, now: 0, target: 4 },
  { domain: 'Python', color: '#8B5CF6', key: 'py4', name: 'Statistics (scipy, numpy)', before: 1, now: 1, target: 4 },
  { domain: 'Python', color: '#8B5CF6', key: 'py5', name: 'Jupyter Notebooks', before: 2, now: 2, target: 5 },
  { domain: 'Python', color: '#8B5CF6', key: 'py6', name: 'EDA Best Practices', before: 1, now: 1, target: 5 },

  // POWER BI
  { domain: 'Power BI', color: '#F97316', key: 'pbi1', name: 'Power Query (M Language)', before: 0, now: 0, target: 4 },
  { domain: 'Power BI', color: '#F97316', key: 'pbi2', name: 'Data Modeling & Relationships', before: 0, now: 0, target: 5 },
  { domain: 'Power BI', color: '#F97316', key: 'pbi3', name: 'DAX – Basic Measures', before: 0, now: 0, target: 5 },
  { domain: 'Power BI', color: '#F97316', key: 'pbi4', name: 'DAX – Time Intelligence', before: 0, now: 0, target: 4 },
  { domain: 'Power BI', color: '#F97316', key: 'pbi5', name: 'Dashboard Design & UX', before: 0, now: 0, target: 4 },
  { domain: 'Power BI', color: '#F97316', key: 'pbi6', name: 'Power BI Service & Sharing', before: 0, now: 0, target: 3 },

  // MACHINE LEARNING
  { domain: 'Machine Learning', color: '#10B981', key: 'ml1', name: 'Feature Engineering', before: 0, now: 0, target: 5 },
  { domain: 'Machine Learning', color: '#10B981', key: 'ml2', name: 'Model Selection & Tuning', before: 0, now: 0, target: 4 },
  { domain: 'Machine Learning', color: '#10B981', key: 'ml3', name: 'Model Evaluation Metrics', before: 0, now: 0, target: 5 },
  { domain: 'Machine Learning', color: '#10B981', key: 'ml4', name: 'Deep Learning Basics', before: 0, now: 0, target: 3 },
  { domain: 'Machine Learning', color: '#10B981', key: 'ml5', name: 'LLM & Prompt Engineering', before: 0, now: 0, target: 4 },
  { domain: 'Machine Learning', color: '#10B981', key: 'ml6', name: 'MLOps (Tracking & Deploy)', before: 0, now: 0, target: 3 },
];



const PROJECTS = [
  { id: 'de_p1', phase: 'de1', color: '#6366F1', num: '01', title: 'Cloud ETL Pipeline', tools: ['ADF', 'Databricks'], dataset: 'Log events', kaggle: 'https://www.kaggle.com', tasks: ['Ingest JSON', 'Transform to Parquet', 'Load to Lakehouse'], q: 'Latency trends?', insight: 'Average latency decreased by 20%', status: 'Not Started' },
  { id: 'de_p2', phase: 'de1', color: '#4361ee', num: '02', title: 'Delta Lake Implementation', tools: ['Databricks', 'Fabric'], dataset: 'IoT Sensors', kaggle: 'https://www.kaggle.com', tasks: ['Bronze to Gold layer', 'Schema evolution', 'Time travel analysis'], q: 'Sensor failure rate?', insight: 'High failure in Sensor-B', status: 'Not Started' },

  { id: 'ds_p1', phase: 'ds1', color: '#8B5CF6', num: '01', title: 'Scalable Churn Model', tools: ['PySpark', 'MLlib'], dataset: 'Telco Churn', kaggle: 'https://www.kaggle.com', tasks: ['Feature scaling', 'Distributed Training', 'MLflow tracking'], q: 'Best predictor of churn?', insight: 'Contract type is #1 predictor', status: 'Not Started' },
  { id: 'ds_p2', phase: 'ds2', color: '#9d4edd', num: '02', title: 'GenAI RAG System', tools: ['OpenAI', 'Databricks'], dataset: 'Wiki text', kaggle: 'https://www.kaggle.com', tasks: ['Vector indexing', 'Prompt engineering', 'Deployment'], q: 'Model precision?', insight: '92% retrieval precision', status: 'Not Started' },
];

const RESOURCES = [
  { domain: 'Data Engineering', type: 'Course', name: 'Azure Data Factory Fundamentals', url: 'https://learn.microsoft.com', priority: 'must', tags: ['Cloud', 'adf'] },
  { domain: 'Data Engineering', type: 'Docs', name: 'Databricks Delta Lake Guide', url: 'https://docs.delta.io', priority: 'must', tags: ['Spark', 'delta'] },
  { domain: 'Data Engineering', type: 'Docs', name: 'Learn SQL Beginner to Advanced', url: 'https://www.youtube.com/watch?v=OT1RErkfLNQ&t=2s', priority: 'must', tags: ['SQL', 'Advanced'] },
  { domain: 'Data Engineering', type: 'Docs', name: 'Learn Power BI in Under 3 Hours | Formatting, Visualizations, Dashboards + Full Project', url: 'https://www.youtube.com/watch?v=I0vQ_VLZTWg', priority: 'must', tags: ['Power BI', 'Beginner'] },
  { domain: 'Data Engineering', type: 'Docs', name: 'Microsoft Power BI Desktop for Business Intelligence', url: 'https://www.udemy.com/course/microsoft-power-bi-up-running-with-power-bi-desktop/?src=sac&kw=Microsoft+Power+BI+Desktop+for+Business+Intelligence&couponCode=PMNVD2025', priority: 'must', tags: ['Power BI', 'Advanced'] },

  { domain: 'Data Science', type: 'Course', name: 'Scalable ML with Spark', url: 'https://www.coursera.org', priority: 'must', tags: ['ml', 'spark'] },
  { domain: 'Data Science', type: 'Practice', name: 'Kaggle Competitions', url: 'https://www.kaggle.com', priority: 'must', tags: ['ml', 'practice'] },
  { domain: 'Data Science', type: 'Course', name: '100 Days of Deep Learning', url: 'https://www.youtube.com/watch?v=2dH_qjc9mFg&list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn', priority: 'must', tags: ['ml', 'Deep Learning'] },
  { domain: 'Data Science', type: 'Course', name: '100 Days of Machine Learning', url: 'https://www.youtube.com/watch?v=ZftI2fEz0Fw&list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH', priority: 'must', tags: ['ml', 'Machine Learning'] },
  { domain: 'Data Science', type: 'Course', name: '100 Days of Python Programming', url: 'https://www.youtube.com/watch?v=u1RKh1kQqaE&list=PLKnIA16_Rmvb1RYR-iTA_hzckhdONtSW4', priority: 'must', tags: ['Python', 'Programming'] },
  { domain: 'Data Science', type: 'Course', name: 'GenAI Roadmap for Beginners | End-to-End GenAI Course 2025', url: 'https://www.youtube.com/watch?v=pSVk-5WemQ0&list=PLKnIA16_RmvaTbihpo4MtzVm4XOQa0ER0', priority: 'must', tags: ['ml', 'GenAI'] }
];

const ALL_QUESTIONS = [
  // SQL Topics
  {
    topic: "SQL (Basic to Advanced)",
    tags: ["Data Engineering", "SQL"],
    question: "Which SQL clause is used to filter records after an aggregation has been performed?",
    options: ["WHERE", "FILTER", "HAVING", "GROUP BY"],
    correctIndex: 2
  },
  {
    topic: "SQL (Basic to Advanced)",
    tags: ["Data Engineering", "SQL"],
    question: "What is the result of a LEFT JOIN if there is no match in the right table?",
    options: ["An error is thrown", "The row is omitted", "NULL values for right table columns", "A default value is used"],
    correctIndex: 2
  },
  {
    topic: "SQL (Data Extraction)",
    tags: ["Data Science", "SQL"],
    question: "Which window function would you use to get the value from the previous row?",
    options: ["LEAD()", "LAG()", "RANK()", "PREV()"],
    correctIndex: 1
  },

  // Python & PySpark
  {
    topic: "Python & PySpark (The Processing Engine)",
    tags: ["Data Engineering", "Python", "PySpark"],
    question: "In PySpark, which operation is a 'transformation' (lazy evaluation)?",
    options: ["show()", "collect()", "count()", "select()"],
    correctIndex: 3
  },
  {
    topic: "Python & PySpark (The Processing Engine)",
    tags: ["Data Engineering", "Python", "PySpark"],
    question: "What is the primary storage format used in Delta Lake for high-performance reads?",
    options: ["CSV", "JSON", "Parquet", "Avro"],
    correctIndex: 2
  },
  {
    topic: "Python & PySpark (Scalable ML)",
    tags: ["Data Science", "Python", "PySpark"],
    question: "Which Spark ML component is used to string together multiple transformations and estimators?",
    options: ["Transformer", "Estimator", "Pipeline", "Evaluator"],
    correctIndex: 2
  },

  // Power BI
  {
    topic: "Power BI (Visualizing the Pipeline)",
    tags: ["Data Engineering", "Power BI"],
    question: "Which Power BI feature allows you to see the underlying data for a specific visual element?",
    options: ["Drillthrough", "Data View", "Power Query", "Relationship View"],
    correctIndex: 0
  },
  {
    topic: "Microsoft Power BI Desktop for Business Intelligence",
    tags: ["Data Engineering", "Power BI"],
    question: "In DAX, what is the difference between a Calculated Column and a Measure?",
    options: ["Columns are calculated at refresh, Measures at query time", "Measures are calculated at refresh, Columns at query time", "There is no difference", "Columns use less memory"],
    correctIndex: 0
  },

  // Machine Learning & Cloud (Data Science)
  {
    topic: "Cloud DS & AutoML",
    tags: ["Data Science", "Cloud"],
    question: "What does 'Drift' refer to in Machine Learning monitoring?",
    options: ["Software bugs", "Change in model input data distribution over time", "Slow model training speed", "Database connection issues"],
    correctIndex: 1
  },
  {
    topic: "Natural Language Processing",
    tags: ["Data Science", "NLP"],
    question: "What is the primary benefit of the Transformer architecture over RNNs?",
    options: ["Better at handling small datasets", "Parallel processing of sequences", "Lower memory usage", "Simpler mathematical foundation"],
    correctIndex: 1
  },
  {
    topic: "Deep Learning Foundations",
    tags: ["Data Science", "Deep Learning"],
    question: "Which activation function is commonly used in the hidden layers of a CNN to avoid the vanishing gradient problem?",
    options: ["Sigmoid", "Tanh", "ReLU", "Softmax"],
    correctIndex: 2
  },

  // MLOps
  {
    topic: "MLOps & CI/CD for ML",
    tags: ["Data Science", "MLOps"],
    question: "What is the main purpose of MLflow Tracking?",
    options: ["To deploy models to Kubernetes", "To log parameters, code versions, and metrics", "To visualize data distributions", "To manage user permissions"],
    correctIndex: 1
  }
];

const CODING_CHALLENGES = [
  {
    topic: "SQL (Basic to Advanced)",
    type: "code",
    question: "Write a SQL query to find the total hours logged by each user. Output the user_id and the sum of hours, ordered by total hours descending.",
    initialCode: "-- Write your SQL here\nSELECT ...",
    expectedKeywords: ["GROUP BY", "SUM", "ORDER BY", "DESC"],
    tags: ["SQL", "Data Engineering"]
  },
  {
    topic: "Python & PySpark (The Processing Engine)",
    type: "code",
    question: "Create a Python function 'clean_data' that takes a list of strings and returns only those that are not empty and have more than 3 characters.",
    initialCode: "def clean_data(items):\n    # Your code here\n    return []",
    expectedKeywords: ["def", "filter", "len", "return"],
    tags: ["Python", "Data Engineering"]
  },
  {
    topic: "Python & PySpark (Scalable ML)",
    type: "code",
    question: "In PySpark, how would you read a Parquet file located at 's3://my-bucket/data.parquet' into a DataFrame named 'df'?",
    initialCode: "df = ...",
    expectedKeywords: ["spark.read.parquet", "s3://"],
    tags: ["PySpark", "Data Science"]
  }
];

