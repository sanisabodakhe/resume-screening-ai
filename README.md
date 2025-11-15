# AI Resume Screening System

An intelligent resume screening system built with React that uses TF-IDF and machine learning algorithms to classify resumes and match them with job descriptions.

## Features

- **Resume Classification**: Automatically categorize resumes into 25+ job categories using KNN algorithm
- **Resume-Job Matching**: Calculate similarity scores between resumes and job descriptions using cosine similarity
- **Model Comparison**: Compare performance metrics of different ML algorithms (KNN, Random Forest, Naive Bayes, SVM)
- **Real-time Processing**: Instant classification and matching results
- **No Pre-trained Models**: All models are trained from scratch using TF-IDF vectorization

## Technologies

- React 18
- Tailwind CSS
- Lucide React (Icons)
- TF-IDF (Term Frequency-Inverse Document Frequency)
- K-Nearest Neighbors (KNN) Algorithm
- Cosine Similarity

## Installation

1. Install dependencies:

```bash
npm install
```

2. Install Tailwind CSS:

```bash
npm install -D tailwindcss postcss autoprefixer
```

3. Start the development server:

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Usage

### Resume Classifier

1. Navigate to the "Resume Classifier" tab
2. Paste a resume text in the input area
3. Select a classification model (KNN, Random Forest, Naive Bayes, or SVM)
4. Click "Classify Resume"
5. View the top predicted category and confidence scores

### Resume-Job Matching

1. Navigate to the "Resume-Job Matching" tab
2. Paste the candidate's resume in the first text area
3. Paste the job description in the second text area
4. Click "Calculate Match Score"
5. View the match score, matched keywords, and recommendations

### Model Comparison

1. Navigate to the "Model Comparison" tab
2. Compare accuracy, precision, recall, and F1 scores across different models
3. View system architecture and dataset information

## How It Works

1. **Text Preprocessing**: Cleans text by removing URLs, special characters, and normalizing whitespace
2. **Feature Extraction**: Converts text to numerical vectors using TF-IDF
3. **Model Training**: Trains classifiers from scratch on synthetic training data
4. **Prediction**: Uses KNN algorithm to classify resumes and cosine similarity for matching

## Supported Job Categories

- Data Science
- Java Developer
- Python Developer
- Web Designing
- Database
- DevOps Engineer
- Testing
- Business Analyst
- HR
- Sales
- And 15 more categories...

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## License

MIT License
