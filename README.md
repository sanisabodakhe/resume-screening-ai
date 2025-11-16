# AI Resume Screening System# AI Resume Screening System



An intelligent resume screening system built with React and machine learning algorithms to automatically classify resumes into job categories and match them with job descriptions.An intelligent resume screening system built with React and machine learning algorithms to automatically classify resumes into job categories and match them with job descriptions.



## Overview## Features



The Resume Screening System uses TF-IDF vectorization and K-Nearest Neighbors (KNN) classification to automate resume screening. It processes resumes in real-time and provides multiple features for HR professionals to manage candidate evaluation efficiently.- **Resume Classification**: Automatically categorize resumes into 25+ job categories using KNN algorithm

- **Resume-Job Matching**: Calculate similarity scores between resumes and job descriptions using cosine similarity

## System Features- **Model Comparison**: Compare performance metrics of different ML algorithms (KNN, Random Forest, Naive Bayes, SVM)

- **Real-time Processing**: Instant classification and matching results

1. Resume Classification - Categorize resumes into 25 job categories using KNN- **No Pre-trained Models**: All models are trained from scratch using TF-IDF vectorization

2. Resume-Job Matching - Calculate match scores between resumes and job descriptions

3. Talent Pool Management - Extract and organize candidate information## Technologies

4. Candidate Clustering - Group candidates by experience level using K-Means

5. Team Building - Assemble optimal teams within budget constraints- React 18

6. Model Performance - View accuracy and performance metrics- Tailwind CSS

- Lucide React (Icons)

## Key Capabilities- TF-IDF (Term Frequency-Inverse Document Frequency)

- K-Nearest Neighbors (KNN) Algorithm

- Automatic resume categorization into 25 job categories- Cosine Similarity

- Real-time similarity scoring for job-resume matching

- Candidate skill and experience extraction## Installation

- Unsupervised candidate clustering by experience level

- Optimized team composition within budget constraints1. Install dependencies:

- Processing speed: Under 2 seconds for 50 resumes

- Runs entirely in the browser with no backend required```bash

npm install

## Technologies```



- React 18.2.0 - Frontend framework2. Install Tailwind CSS:

- Tailwind CSS 3.4.1 - Styling

- JavaScript ES6+ - ML algorithms```bash

- Python 3.8+ - Optional ML trainingnpm install -D tailwindcss postcss autoprefixer

- scikit-learn - ML library```



## Installation3. Start the development server:



Step 1: Install dependencies```bash

npm start

```bash```

npm install

```The application will open at [http://localhost:3000](http://localhost:3000)



Step 2: Install build dependencies## Usage



```bash### Resume Classifier

npm install -D tailwindcss postcss autoprefixer

```1. Navigate to the "Resume Classifier" tab

2. Paste a resume text in the input area

Step 3: Start the development server3. Select a classification model (KNN, Random Forest, Naive Bayes, or SVM)

4. Click "Classify Resume"

```bash5. View the top predicted category and confidence scores

npm start

```### Resume-Job Matching



Application opens at http://localhost:30001. Navigate to the "Resume-Job Matching" tab

2. Paste the candidate's resume in the first text area

## Usage Guide3. Paste the job description in the second text area

4. Click "Calculate Match Score"

### Resume Classification5. View the match score, matched keywords, and recommendations



1. Navigate to "Bulk Classification" tab### Model Comparison

2. Paste resume text

3. Enter candidate name (optional)1. Navigate to the "Model Comparison" tab

4. Click "Add Resume" for additional resumes2. Compare accuracy, precision, recall, and F1 scores across different models

5. Click "Classify All Resumes"3. View system architecture and dataset information

6. View results with category and confidence score

## How It Works

### Resume-Job Matching

1. **Text Preprocessing**: Cleans text by removing URLs, special characters, and normalizing whitespace

1. Navigate to "Bulk Matching & Ranking" tab2. **Feature Extraction**: Converts text to numerical vectors using TF-IDF

2. Paste job description in first text area3. **Model Training**: Trains classifiers from scratch on synthetic training data

3. Paste resume(s) in second area4. **Prediction**: Uses KNN algorithm to classify resumes and cosine similarity for matching

4. Click "Match & Rank All Resumes"

5. View match scores and matched keywords## Supported Job Categories



### Talent Pool Management- Data Science

- Java Developer

1. Navigate to "Talent Pool" tab- Python Developer

2. Click "Build Talent Pool"- Web Designing

3. View extracted information: skills, experience, education, salary- Database

4. See analytics dashboard with statistics- DevOps Engineer

- Testing

### Clustering Analysis- Business Analyst

- HR

1. Navigate to "Clustering" tab- Sales

2. Click "Analyze Clusters"- And 15 more categories...

3. View three candidate groups:

   - Senior Level: 8+ years experience## Build for Production

   - Mid Level: 4-5 years experience

   - Junior Level: 1-2 years experience```bash

npm run build

### Team Building```



1. Navigate to "Team Builder" tabThis creates an optimized production build in the `build` folder.

2. Enter required roles (comma-separated)

3. Set maximum budget## License

4. Click "Build Optimal Team"

5. View selected candidates and total costMIT License


### Model Metrics

View performance metrics of the KNN classifier:
- Accuracy: 97.93%
- Precision: 98.21%
- Recall: 97.93%
- F1 Score: 0.9794

## Algorithm Details

TF-IDF Vectorization: Converts resume text to numerical vectors. Prioritizes rare important words while reducing common words.

K-Nearest Neighbors: Finds 5 most similar training resumes and assigns majority category. Parameters: k=5, distance: cosine similarity.

Cosine Similarity: Measures document similarity on scale of 0 (different) to 1 (identical). Used for job-resume matching.

K-Means Clustering: Groups candidates into clusters based on feature similarity. Parameters: k=3, max iterations: 10, distance: Euclidean.

Greedy Algorithm: Selects best candidate per role while respecting budget. Optimizes for immediate feasibility rather than global optimality.

## Performance Specifications

Processing Times:
- Single resume classification: Less than 100 milliseconds
- Batch processing (50 resumes): 1.5 seconds
- Job matching (50 resumes): 1.5 seconds
- K-Means clustering (50 candidates): 500 milliseconds
- Team assembly: 200 milliseconds

Memory Requirements:
- React application: 2-3 MB
- Vectorized data (50 resumes): 5-10 MB
- Total runtime: Less than 20 MB

## Dataset Specifications

Training data: 962 real resumes from UpdatedResumeDataSet.csv
Categories: 25 distinct job roles
Training set: 769 resumes (80%)
Test set: 193 resumes (20%)
Features: 5000+ TF-IDF features

## Supported Job Categories

Java Developer, Python Developer, Data Scientist, Web Designer, Database Administrator, DevOps Engineer, Quality Assurance, Business Analyst, HR Manager, Sales Executive, Health and Fitness, Advocate, Arts and Design, Electrical Engineering, Operations Manager, Network Security Engineer, Project Manager, Database Developer, Hadoop Developer, ETL Developer, DotNet Developer, Blockchain Developer, Automation Testing, Mechanical Engineer, Civil Engineer

## Python ML Training (Optional)

To train models using Python:

Step 1: Install Python dependencies

```bash
pip install -r requirements-ml.txt
```

Step 2: Run training

```bash
python ml_training.py
```

Trains KNN on full dataset and saves models to models/ directory.

## Project Structure

```
resume-screening/
├── src/
│   ├── components/
│   │   └── ResumeScreeningSystem.jsx    (1225 lines)
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   └── dataset/
│       └── UpdatedResumeDataSet.csv
├── public/
│   └── index.html
├── ml_training.py
├── models/
│   ├── knn_model.pkl
│   ├── vectorizer.pkl
│   └── metrics.pkl
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── craco.config.js
└── README.md
```

## Build for Production

```bash
npm run build
```

Creates optimized production build in build/ folder.

## Model Performance

Accuracy: 97.93% on test set
Precision: 98.21%
Recall: 97.93%
F1 Score: 0.9794

All 25 categories achieve above 95% accuracy.

## Requirements

Node.js 14 or higher
Python 3.8 or higher (optional for training)
Modern web browser

## License

MIT License
