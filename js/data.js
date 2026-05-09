// Static data for the Bestpeers Learning Dashboard
const MOCK_USERS = [
  { id: 'u1', firstName: 'Arjun', lastName: 'Tomar', role: 'host', assignedRoadmap: 'Data Analytics', weekStatus: { 1: 'done', 2: 'done', 3: 'active' }, weekReviews: {}, skillNow: {}, projectStatus: {}, projectTasks: {}, logEntries: [] },
  { id: 'u2', firstName: 'Priya', lastName: 'Singh', role: 'user', assignedRoadmap: 'Data Analytics', weekStatus: { 1: 'done', 2: 'todo' }, weekReviews: {}, skillNow: {}, projectStatus: {}, projectTasks: {}, logEntries: [] },
  { id: 'u3', firstName: 'Rohan', lastName: 'Verma', role: 'user', assignedRoadmap: 'Data Engineering', weekStatus: { 1: 'active' }, weekReviews: {}, skillNow: {}, projectStatus: {}, projectTasks: {}, logEntries: [] },
  { id: 'u4', firstName: 'Neha', lastName: 'Sharma', role: 'user', assignedRoadmap: 'Data Analytics', weekStatus: { 1: 'done', 2: 'done', 3: 'done', 4: 'done' }, weekReviews: {}, skillNow: {}, projectStatus: {}, projectTasks: {}, logEntries: [] }
];

const defaultState = {
  firstName: '',
  lastName: '',
  role: 'user',
  assignedRoadmap: 'Data Analytics',
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
};

const ROADMAPS = {
  'Data Analytics': [
    { id: 'p1', name: 'Analytics Mindset', color: '#14B8A6', weeks: [1, 2] },
    { id: 'p2', name: 'SQL Deep Dive', color: '#3B82F6', weeks: [3, 4, 5, 6] },
    { id: 'p3', name: 'Python Analytics', color: '#8B5CF6', weeks: [7, 8, 9, 10] },
    { id: 'p4', name: 'Power BI', color: '#F97316', weeks: [11, 12, 13, 14] },
    { id: 'p5', name: 'Advanced Excel', color: '#F59E0B', weeks: [15, 16] },
    { id: 'p6', name: 'Portfolio & Career', color: '#10B981', weeks: [17, 18, 19, 20] },
  ],
  'Data Engineering': [
    { id: 'e1', name: 'Cloud Infra', color: '#6366F1', weeks: [1, 2] },
    { id: 'e2', name: 'Data Modeling', color: '#3B82F6', weeks: [3, 4] },
  ]
};

const WEEKS = [
  { w: 1, phase: 'p1', title: 'What is Data Analytics?', tools: ['Notes', 'YouTube'], goals: 'Analyst vs Engineer vs Scientist roles; Analytics lifecycle; Tool landscape', handson: 'Write 1-page role comparison; Map 5 JDs to skills' },
  { w: 2, phase: 'p1', title: 'Business Thinking & KPIs', tools: ['Excel'], goals: 'KPI design (SMART); Funnel metrics; Cohort basics; Pivot tables', handson: 'Build KPI dashboard in Excel from sample sales data' },
  { w: 3, phase: 'p2', title: 'SQL — Advanced Querying', tools: ['PostgreSQL'], goals: 'CTEs, Window functions (ROW_NUMBER, RANK, LAG/LEAD), Subqueries vs joins', handson: '10 LeetCode SQL mediums; Window function queries on sample DB' },
  { w: 4, phase: 'p2', title: 'SQL — Analytics Patterns', tools: ['BigQuery', 'dbt'], goals: 'Cohort analysis, Retention & churn SQL, Funnel queries, Date math', handson: 'Cohort retention table on e-commerce dataset; Funnel analysis query' },
  { w: 5, phase: 'p2', title: 'SQL — Performance & Modeling', tools: ['PostgreSQL', 'dbt'], goals: 'EXPLAIN & indexes; Star vs snowflake schema; Intro dbt', handson: 'Optimize 3 slow queries; Build a star schema on sample data' },
  { w: 6, phase: 'p2', title: 'SQL — Project Week', tools: ['SQL', 'Power BI'], goals: 'End-to-end SQL analytics project; Data cleaning; Storytelling', handson: 'Full project: raw CSV → SQL clean → 5 key metrics → present findings' },
  { w: 7, phase: 'p3', title: 'Pandas & Data Wrangling', tools: ['Python', 'Pandas'], goals: 'merge, groupby, pivot_table; Nulls, duplicates, dtypes; Date operations', handson: 'Clean a messy Kaggle CSV; Groupby analysis with 5 insights' },
  { w: 8, phase: 'p3', title: 'Data Visualization — Python', tools: ['Seaborn', 'Plotly'], goals: 'Chart types & when to use; Seaborn statistical plots; Interactive Plotly', handson: '5 chart types on same dataset; EDA notebook with 10 visuals' },
  { w: 9, phase: 'p3', title: 'Statistics for Analytics', tools: ['scipy', 'numpy'], goals: 'Descriptive stats; Correlation vs causation; t-test, chi-square', handson: 'Statistical EDA on HR dataset; 3 statistically significant insights' },
  { w: 10, phase: 'p3', title: 'Python Analytics Project', tools: ['Python', 'Jupyter'], goals: 'End-to-end analysis project; Storytelling with data; Notebook best practices', handson: 'Full Jupyter: load → clean → explore → visualize → insights → conclusions' },
  { w: 11, phase: 'p4', title: 'Power BI — Fundamentals', tools: ['Power BI'], goals: 'Data model concepts; Power Query (M) basics; Relationships & cardinality', handson: 'Connect to Excel → 3-table model → 5 basic visuals' },
  { w: 12, phase: 'p4', title: 'DAX Fundamentals', tools: ['Power BI', 'DAX'], goals: 'Measures vs columns; CALCULATE, FILTER, ALL; Time intelligence basics', handson: '10 DAX measures (YTD, MoM%, running total); Sales summary report' },
  { w: 13, phase: 'p4', title: 'Power BI — Advanced Visuals', tools: ['Power BI'], goals: 'Custom visuals; Drill-through & bookmarks; Mobile layout; RLS basics', handson: 'Interactive multi-page dashboard; Drill-through on product report' },
  { w: 14, phase: 'p4', title: 'Power BI — Publish & Project', tools: ['Power BI Service'], goals: 'Publish to Service; Scheduled refresh; Share & collaborate; Row-level security', handson: 'Publish dashboard to PBI Service; Set auto-refresh; Present to peer' },
  { w: 15, phase: 'p5', title: 'Excel — Advanced Analytics', tools: ['Excel'], goals: 'INDEX-MATCH, XLOOKUP, array formulas; Power Query in Excel; Data validation', handson: 'Rebuild SQL metrics in Excel; Power Query to merge 3 tables' },
  { w: 16, phase: 'p5', title: 'Excel — Dashboard & VBA Intro', tools: ['Excel', 'VBA'], goals: 'Dynamic charts & named ranges; Slicers & dropdowns; Basic VBA macros', handson: 'Executive Excel dashboard with slicers; Record 1 macro' },
  { w: 17, phase: 'p6', title: 'Capstone — Data Collection', tools: ['SQL', 'Python'], goals: 'Choose real-world dataset; Full cleaning pipeline SQL + Python; Data dictionary', handson: 'Source Kaggle dataset; Clean & document every column' },
  { w: 18, phase: 'p6', title: 'Capstone — Analysis & Insights', tools: ['Python', 'Power BI'], goals: 'Full EDA + statistical analysis; Define 5 key business questions; Answer with data', handson: 'Full EDA notebook; Power BI dashboard for same capstone data' },
  { w: 19, phase: 'p6', title: 'Portfolio & GitHub', tools: ['GitHub', 'Markdown'], goals: 'Clean notebooks; Write READMEs; Publish 3+ projects', handson: 'Polish 3 projects; Write case-study READMEs; Post on LinkedIn' },
  { w: 20, phase: 'p6', title: 'Interview Prep & Mock Analytics', tools: ['All'], goals: 'SQL interview patterns; Case study practice; Present capstone', handson: '20 SQL interview Qs; Present capstone; Update resume' },
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
