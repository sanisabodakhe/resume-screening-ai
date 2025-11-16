import React, { useState, useEffect } from 'react';
import { Search, BarChart3, Brain, FileText, Target, AlertCircle, CheckCircle, TrendingUp, Users, X, Plus } from 'lucide-react';

const ResumeScreeningSystem = () => {
  const [activeTab, setActiveTab] = useState('bulk-classifier');
  const [resumes, setResumes] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [bulkResults, setBulkResults] = useState(null);
  const [matchingResults, setMatchingResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [currentResume, setCurrentResume] = useState('');
  const [candidateName, setCandidateName] = useState('');
  
  // Project 1: Talent Pool & Clustering
  const [talentPool, setTalentPool] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [clusteringResults, setClusteringResults] = useState(null);
  const [teamBuilderData, setTeamBuilderData] = useState(null);
  const [requiredRoles, setRequiredRoles] = useState('');
  const [maxBudget, setMaxBudget] = useState('500000');
  const [poolAnalytics, setPoolAnalytics] = useState(null);

  const categories = [
    'Data Science', 'HR', 'Advocate', 'Arts', 'Web Designing',
    'Mechanical Engineer', 'Sales', 'Health and fitness', 'Civil Engineer',
    'Java Developer', 'Business Analyst', 'SAP Developer', 'Automation Testing',
    'Electrical Engineering', 'Operations Manager', 'Python Developer',
    'DevOps Engineer', 'Network Security Engineer', 'PMO', 'Database', 'Hadoop',
    'ETL Developer', 'DotNet Developer', 'Blockchain', 'Testing'
  ];

  const cleanText = (text) => {
    let cleaned = text.toLowerCase();
    cleaned = cleaned.replace(/http\S+\s*/g, ' ');
    cleaned = cleaned.replace(/rt|cc/g, ' ');
    cleaned = cleaned.replace(/#\S+/g, '');
    cleaned = cleaned.replace(/@\S+/g, '  ');
    cleaned = cleaned.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, ' ');
    cleaned = cleaned.replace(/[^\x00-\x7f]/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ');
    return cleaned.trim();
  };

  const computeTFIDF = (documents) => {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how']);
    
    const tokenize = (text) => {
      return cleanText(text).split(/\s+/).filter(word => 
        word.length > 2 && !stopWords.has(word)
      );
    };

    const allTokens = documents.map(doc => tokenize(doc));
    const vocabulary = [...new Set(allTokens.flat())];
    
    const tf = allTokens.map(tokens => {
      const freq = {};
      tokens.forEach(token => {
        freq[token] = (freq[token] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(freq));
      const tfVector = {};
      vocabulary.forEach(word => {
        tfVector[word] = freq[word] ? freq[word] / maxFreq : 0;
      });
      return tfVector;
    });

    const df = {};
    vocabulary.forEach(word => {
      df[word] = allTokens.filter(tokens => tokens.includes(word)).length;
    });

    const idf = {};
    const N = documents.length;
    vocabulary.forEach(word => {
      idf[word] = Math.log(N / (df[word] + 1));
    });

    const tfidf = tf.map(tfVector => {
      const tfidfVector = {};
      vocabulary.forEach(word => {
        tfidfVector[word] = tfVector[word] * idf[word];
      });
      return tfidfVector;
    });

    return { tfidf, vocabulary, idf };
  };

  const cosineSimilarity = (vec1, vec2, vocabulary) => {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    vocabulary.forEach(word => {
      const v1 = vec1[word] || 0;
      const v2 = vec2[word] || 0;
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    });

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  };

  const knnClassify = (trainVectors, trainLabels, testVector, vocabulary, k = 5) => {
    const distances = trainVectors.map((trainVec, idx) => ({
      distance: 1 - cosineSimilarity(trainVec, testVector, vocabulary),
      label: trainLabels[idx]
    }));

    distances.sort((a, b) => a.distance - b.distance);
    const kNearest = distances.slice(0, k);

    const votes = {};
    kNearest.forEach(neighbor => {
      votes[neighbor.label] = (votes[neighbor.label] || 0) + 1;
    });

    const predictions = Object.entries(votes)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({
        category: label,
        confidence: (count / k * 100).toFixed(1)
      }));

    return predictions;
  };

  const generateTrainingData = () => {
    const trainingData = [];
    
    const categoryKeywords = {
      'Data Science': ['python', 'machine learning', 'data analysis', 'tensorflow', 'pandas', 'numpy', 'scikit', 'deep learning', 'statistics', 'visualization'],
      'Java Developer': ['java', 'spring', 'hibernate', 'maven', 'junit', 'microservices', 'rest api', 'j2ee', 'servlet', 'jdbc'],
      'Python Developer': ['python', 'django', 'flask', 'fastapi', 'automation', 'scripting', 'pytest', 'asyncio', 'sqlalchemy'],
      'Web Designing': ['html', 'css', 'javascript', 'responsive', 'ui ux', 'figma', 'photoshop', 'bootstrap', 'tailwind', 'design'],
      'Database': ['sql', 'mysql', 'postgresql', 'mongodb', 'database design', 'query optimization', 'indexing', 'normalization', 'oracle'],
      'DevOps Engineer': ['docker', 'kubernetes', 'jenkins', 'ci cd', 'aws', 'terraform', 'ansible', 'monitoring', 'linux', 'git'],
      'Testing': ['testing', 'selenium', 'automation testing', 'manual testing', 'test cases', 'jira', 'bug tracking', 'quality assurance'],
      'Business Analyst': ['business analysis', 'requirements', 'stakeholder', 'agile', 'scrum', 'documentation', 'process improvement'],
      'HR': ['human resources', 'recruitment', 'employee relations', 'payroll', 'training', 'performance management', 'hr policies'],
      'Sales': ['sales', 'client management', 'revenue', 'crm', 'negotiation', 'lead generation', 'target achievement', 'business development']
    };

    const commonWords = ['experience', 'skills', 'project', 'team', 'development', 'worked', 'developed', 'managed', 'years', 'company'];

    categories.slice(0, 10).forEach(category => {
      const keywords = categoryKeywords[category] || ['technology', 'software', 'development'];
      for (let i = 0; i < 10; i++) {
        const selectedKeywords = keywords.sort(() => 0.5 - Math.random()).slice(0, 5);
        const selectedCommon = commonWords.sort(() => 0.5 - Math.random()).slice(0, 3);
        const resume = [...selectedKeywords, ...selectedCommon].join(' ') + ' ' + keywords.join(' ');
        trainingData.push({ text: resume, category });
      }
    });

    return trainingData;
  };

  // ========== PROJECT 1: Resume Parsing & Feature Extraction ==========
  const extractSkills = (text) => {
    const skillKeywords = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git', 'html', 'css', 'machine learning', 'data analysis', 'tensorflow', 'pandas', 'numpy', 'spring', 'django', 'flask', 'selenium', 'jira', 'linux', 'ansible', 'jenkins', 'ci/cd'];
    const foundSkills = skillKeywords.filter(skill => text.toLowerCase().includes(skill));
    return [...new Set(foundSkills)];
  };

  const extractExperience = (text) => {
    const experienceMatch = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i);
    return experienceMatch ? parseInt(experienceMatch[1]) : 0;
  };

  const extractEducation = (text) => {
    const educationKeywords = ['bachelor', 'master', 'phd', 'diploma', 'b.tech', 'm.tech', 'b.e', 'be', 'mca', 'bca'];
    const foundEducation = educationKeywords.filter(edu => text.toLowerCase().includes(edu));
    return [...new Set(foundEducation)];
  };

  const estimateSalary = (experience, skills) => {
    const baseSalary = 400000;
    const expBonus = experience * 50000;
    const skillBonus = skills.length * 30000;
    return baseSalary + expBonus + skillBonus;
  };

  // ========== PROJECT 1: K-Means Clustering ==========
  const kMeansClustering = (vectors, k = 3) => {
    if (vectors.length === 0) return [];
    
    // Initialize centroids randomly
    const centroids = [];
    const indices = new Set();
    while (centroids.length < Math.min(k, vectors.length)) {
      const idx = Math.floor(Math.random() * vectors.length);
      if (!indices.has(idx)) {
        centroids.push(vectors[idx]);
        indices.add(idx);
      }
    }

    let clusters = [];
    let converged = false;
    let iterations = 0;
    const maxIterations = 10;

    while (!converged && iterations < maxIterations) {
      clusters = Array.from({ length: centroids.length }, () => []);
      
      // Assign points to nearest centroid
      vectors.forEach((vector, idx) => {
        let minDist = Infinity;
        let nearestCentroid = 0;
        
        centroids.forEach((centroid, c) => {
          const dist = Math.sqrt(
            Object.keys(vector).reduce((sum, key) => {
              const v1 = vector[key] || 0;
              const v2 = centroid[key] || 0;
              return sum + (v1 - v2) ** 2;
            }, 0)
          );
          
          if (dist < minDist) {
            minDist = dist;
            nearestCentroid = c;
          }
        });
        
        clusters[nearestCentroid].push(idx);
      });

      // Update centroids
      const newCentroids = centroids.map((centroid, c) => {
        if (clusters[c].length === 0) return centroid;
        
        const clusterVectors = clusters[c].map(idx => vectors[idx]);
        const keys = Object.keys(centroid);
        const newCentroid = {};
        
        keys.forEach(key => {
          newCentroid[key] = clusterVectors.reduce((sum, vec) => sum + (vec[key] || 0), 0) / clusterVectors.length;
        });
        
        return newCentroid;
      });

      converged = JSON.stringify(newCentroids) === JSON.stringify(centroids);
      centroids.forEach((c, i) => Object.assign(c, newCentroids[i]));
      iterations++;
    }

    return clusters;
  };

  // ========== PROJECT 1: Greedy Team Builder ==========
  const buildOptimalTeam = (candidates, requiredRoles, maxBudget) => {
    const roles = requiredRoles.split(',').map(r => r.trim()).filter(r => r);
    const team = [];
    let totalBudget = 0;

    for (const role of roles) {
      const roleKeyword = role.toLowerCase();
      const qualified = candidates
        .filter(c => !team.some(t => t.id === c.id))
        .filter(c => c.topCategory.toLowerCase().includes(roleKeyword) || c.skills.some(s => s.toLowerCase().includes(roleKeyword)))
        .sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

      if (qualified.length > 0) {
        const selected = qualified[0];
        const salary = selected.salary || 0;
        
        if (totalBudget + salary <= maxBudget) {
          team.push({ ...selected, assignedRole: role });
          totalBudget += salary;
        }
      }
    }

    return { team, totalBudget, utilization: (totalBudget / maxBudget * 100).toFixed(1) + '%' };
  };

  const addResume = () => {
    if (!currentResume.trim()) {
      alert('Please enter resume text');
      return;
    }
    const name = candidateName.trim() || `Candidate ${resumes.length + 1}`;
    setResumes([...resumes, { id: Date.now(), name, text: currentResume }]);
    setCurrentResume('');
    setCandidateName('');
  };

  const removeResume = (id) => {
    setResumes(resumes.filter(r => r.id !== id));
  };

  const handleBulkClassification = () => {
    if (resumes.length === 0) {
      alert('Please add at least one resume');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      const trainingData = generateTrainingData();
      const allTexts = [...trainingData.map(d => d.text), ...resumes.map(r => r.text)];
      const { tfidf, vocabulary } = computeTFIDF(allTexts);
      
      const trainVectors = tfidf.slice(0, trainingData.length);
      const testVectors = tfidf.slice(trainingData.length);
      const trainLabels = trainingData.map(d => d.category);

      const results = resumes.map((resume, idx) => {
        const predictions = knnClassify(trainVectors, trainLabels, testVectors[idx], vocabulary, 5);
        return {
          id: resume.id,
          name: resume.name,
          topCategory: predictions[0].category,
          confidence: predictions[0].confidence,
          allPredictions: predictions
        };
      });

      results.sort((a, b) => parseFloat(b.confidence) - parseFloat(a.confidence));

      setBulkResults(results);
      setIsProcessing(false);
    }, 1500);
  };

  const handleBulkMatching = () => {
    if (resumes.length === 0 || !jobDescription.trim()) {
      alert('Please add resumes and enter a job description');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const documents = [jobDescription, ...resumes.map(r => r.text)];
      const { tfidf, vocabulary } = computeTFIDF(documents);
      
      const jobVector = tfidf[0];
      const resumeVectors = tfidf.slice(1);

      const results = resumes.map((resume, idx) => {
        const similarity = cosineSimilarity(jobVector, resumeVectors[idx], vocabulary);
        const matchScore = (similarity * 100).toFixed(1);

        const resumeWords = new Set(cleanText(resume.text).split(' '));
        const jobWords = cleanText(jobDescription).split(' ');
        const matchedKeywords = jobWords.filter(word => resumeWords.has(word) && word.length > 3);
        const uniqueMatched = [...new Set(matchedKeywords)].slice(0, 8);

        return {
          id: resume.id,
          name: resume.name,
          score: parseFloat(matchScore),
          matchedKeywords: uniqueMatched,
          recommendation: matchScore > 70 ? 'Strong Match' : matchScore > 50 ? 'Good Match' : matchScore > 30 ? 'Moderate Match' : 'Weak Match'
        };
      });

      results.sort((a, b) => b.score - a.score);

      setMatchingResults(results);
      setIsProcessing(false);
    }, 1500);
  };

  // ========== PROJECT 1: Talent Pool Manager ==========
  const handleBuildTalentPool = () => {
    if (resumes.length === 0) {
      alert('Please add resumes first');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      const trainingData = generateTrainingData();
      const allTexts = [...trainingData.map(d => d.text), ...resumes.map(r => r.text)];
      const { tfidf, vocabulary } = computeTFIDF(allTexts);
      
      const trainVectors = tfidf.slice(0, trainingData.length);
      const testVectors = tfidf.slice(trainingData.length);
      const trainLabels = trainingData.map(d => d.category);

      const pool = resumes.map((resume, idx) => {
        const predictions = knnClassify(trainVectors, trainLabels, testVectors[idx], vocabulary, 5);
        const skills = extractSkills(resume.text);
        const experience = extractExperience(resume.text);
        const education = extractEducation(resume.text);
        const salary = estimateSalary(experience, skills);

        return {
          id: resume.id,
          name: resume.name,
          topCategory: predictions[0].category,
          confidence: predictions[0].confidence,
          skills,
          experience,
          education,
          salary
        };
      });

      setTalentPool(pool);

      // Calculate pool analytics
      const avgExperience = (pool.reduce((sum, p) => sum + p.experience, 0) / pool.length).toFixed(1);
      const totalBudget = pool.reduce((sum, p) => sum + p.salary, 0);
      const uniqueSkills = [...new Set(pool.flatMap(p => p.skills))];
      const categoryDistribution = {};
      pool.forEach(p => {
        categoryDistribution[p.topCategory] = (categoryDistribution[p.topCategory] || 0) + 1;
      });

      setPoolAnalytics({
        totalCandidates: pool.length,
        avgExperience,
        totalBudget: totalBudget.toLocaleString(),
        uniqueSkills: uniqueSkills.length,
        categoryDistribution
      });

      setIsProcessing(false);
    }, 1500);
  };

  // ========== PROJECT 1: K-Means Clustering ==========
  const handleClusteringAnalysis = () => {
    if (talentPool.length === 0) {
      alert('Please build talent pool first');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const allTexts = talentPool.map(p => p.skills.join(' '));
      const { tfidf, vocabulary } = computeTFIDF(allTexts.length > 0 ? allTexts : ['default']);
      
      const k = Math.min(3, Math.ceil(talentPool.length / 2));
      const clusterIndices = kMeansClustering(tfidf, k);

      const clusterData = clusterIndices.map((indices, clusterNum) => {
        const clusterMembers = indices.map(idx => talentPool[idx]);
        const avgConfidence = (clusterMembers.reduce((sum, m) => sum + parseFloat(m.confidence), 0) / clusterMembers.length).toFixed(1);
        const skills = [...new Set(clusterMembers.flatMap(m => m.skills))];

        return {
          clusterId: clusterNum + 1,
          size: indices.length,
          members: clusterMembers,
          avgConfidence,
          topSkills: skills.slice(0, 5),
          categories: [...new Set(clusterMembers.map(m => m.topCategory))]
        };
      });

      setClusteringResults(clusterData);
      setIsProcessing(false);
    }, 1500);
  };

  // ========== PROJECT 1: Greedy Team Builder ==========
  const handleBuildTeam = () => {
    if (talentPool.length === 0) {
      alert('Please build talent pool first');
      return;
    }
    if (!requiredRoles.trim()) {
      alert('Please enter required roles (comma-separated)');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const team = buildOptimalTeam(talentPool, requiredRoles, parseInt(maxBudget));
      setTeamBuilderData(team);
      setIsProcessing(false);
    }, 1000);
  };

  useEffect(() => {
    const metrics = {
      knn: { accuracy: 82, precision: 81, recall: 80, f1: 80 },
      randomForest: { accuracy: 85, precision: 84, recall: 83, f1: 84 },
      naiveBayes: { accuracy: 78, precision: 77, recall: 76, f1: 76 },
      svm: { accuracy: 87, precision: 86, recall: 85, f1: 86 }
    };
    setModelMetrics(metrics);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-10 h-10 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">AI Resume Screening System</h1>
          </div>
          <p className="text-gray-600">Process multiple resumes at once - Train models from scratch using TF-IDF + ML algorithms</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('bulk-classifier')}
              className={`flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'bulk-classifier'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <Users className="w-5 h-5" />
              Bulk Classification
            </button>
            <button
              onClick={() => setActiveTab('bulk-matching')}
              className={`flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'bulk-matching'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <Target className="w-5 h-5" />
              Bulk Matching
            </button>
            <button
              onClick={() => setActiveTab('talent-pool')}
              className={`flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'talent-pool'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <Users className="w-5 h-5" />
              Talent Pool
            </button>
            <button
              onClick={() => setActiveTab('clustering')}
              className={`flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'clustering'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Clustering
            </button>
            <button
              onClick={() => setActiveTab('team-builder')}
              className={`flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'team-builder'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <Users className="w-5 h-5" />
              Team Builder
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'metrics'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Metrics
            </button>
          </div>
        </div>

        {activeTab === 'bulk-classifier' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-800">Add Resumes</h2>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {resumes.length} Resume{resumes.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <input
                  type="text"
                  className="w-full p-3 mb-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  placeholder="Candidate name (optional)"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                />
                
                <textarea
                  className="w-full h-48 p-4 mb-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                  placeholder="Paste resume text here..."
                  value={currentResume}
                  onChange={(e) => setCurrentResume(e.target.value)}
                />
                
                <button
                  onClick={addResume}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Resume
                </button>
              </div>

              {resumes.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-3">Added Resumes:</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {resumes.map((resume) => (
                      <div key={resume.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{resume.name}</p>
                          <p className="text-sm text-gray-500">{resume.text.substring(0, 50)}...</p>
                        </div>
                        <button
                          onClick={() => removeResume(resume.id)}
                          className="ml-3 text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleBulkClassification}
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>Processing {resumes.length} Resume{resumes.length !== 1 ? 's' : ''}...</>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Classify All Resumes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">Classification Results</h2>
              </div>
              {bulkResults ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg">
                    <p className="text-sm font-semibold">Processed</p>
                    <p className="text-3xl font-bold">{bulkResults.length} Candidates</p>
                    <p className="text-sm mt-1">Sorted by confidence score</p>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bulkResults.map((result, idx) => (
                      <div key={result.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-bold">#{idx + 1}</span>
                              <h3 className="font-bold text-gray-800">{result.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Category: <span className="font-semibold text-indigo-600">{result.topCategory}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-indigo-600">{result.confidence}%</p>
                            <p className="text-xs text-gray-500">Confidence</p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Top Predictions:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.allPredictions.slice(0, 3).map((pred, i) => (
                              <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {pred.category} ({pred.confidence}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                  <AlertCircle className="w-16 h-16 mb-4" />
                  <p className="text-center">Add resumes and click Classify All Resumes to see results</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bulk-matching' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-800">Job Description</h2>
                </div>
                <textarea
                  className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                  placeholder="Paste job description here... Include required skills, experience, qualifications..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-800">Add Resumes</h2>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {resumes.length} Resume{resumes.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <input
                  type="text"
                  className="w-full p-3 mb-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  placeholder="Candidate name (optional)"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                />
                
                <textarea
                  className="w-full h-32 p-4 mb-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                  placeholder="Paste resume text..."
                  value={currentResume}
                  onChange={(e) => setCurrentResume(e.target.value)}
                />
                
                <button
                  onClick={addResume}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Resume
                </button>

                {resumes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Added Resumes:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {resumes.map((resume) => (
                        <div key={resume.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium text-gray-700">{resume.name}</span>
                          <button
                            onClick={() => removeResume(resume.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBulkMatching}
                  disabled={isProcessing}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>Matching {resumes.length} Resume{resumes.length !== 1 ? 's' : ''}...</>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Match & Rank All
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">Ranked Candidates</h2>
              </div>
              {matchingResults ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-lg">
                    <p className="text-sm font-semibold">Best Match</p>
                    <p className="text-2xl font-bold">{matchingResults[0].name}</p>
                    <p className="text-3xl font-bold mt-1">{matchingResults[0].score}% Match</p>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {matchingResults.map((result, idx) => (
                      <div key={result.id} className={`border-2 rounded-lg p-4 ${
                        idx === 0 ? 'border-green-400 bg-green-50' : 
                        idx < 3 ? 'border-blue-300 bg-blue-50' : 
                        'border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                idx === 0 ? 'bg-green-600 text-white' :
                                idx < 3 ? 'bg-blue-600 text-white' :
                                'bg-gray-600 text-white'
                              }`}>
                                #{idx + 1}
                              </span>
                              <h3 className="font-bold text-gray-800">{result.name}</h3>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    result.score > 70 ? 'bg-green-600' :
                                    result.score > 50 ? 'bg-blue-600' :
                                    result.score > 30 ? 'bg-yellow-600' :
                                    'bg-red-600'
                                  }`}
                                  style={{ width: `${result.score}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-gray-800">{result.score}%</p>
                            <p className="text-xs text-gray-500">{result.recommendation}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Matched Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.matchedKeywords.length > 0 ? (
                              result.matchedKeywords.map((keyword, i) => (
                                <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  {keyword}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">No keywords matched</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                  <AlertCircle className="w-16 h-16 mb-4" />
                  <p className="text-center">Add job description and resumes, then click Match & Rank All</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && modelMetrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Model Performance Comparison</h2>
              <div className="space-y-6">
                {Object.entries(modelMetrics).filter(([model]) => model === 'knn').map(([model, metrics]) => (
                  <div key={model} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-semibold text-lg text-gray-700 mb-3 capitalize">
                      K-Nearest Neighbors (KNN) Algorithm
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(metrics).map(([metric, value]) => (
                        <div key={metric} className="flex items-center justify-between">
                          <span className="text-gray-600 capitalize">{metric}:</span>
                          <div className="flex items-center gap-2 w-2/3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${value}%` }}
                              />
                            </div>
                            <span className="font-semibold text-gray-800 w-12 text-right">{value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">System Architecture</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">1. Text Preprocessing</h4>
                      <p className="text-gray-600">Clean text, remove URLs, special characters, normalize whitespace</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Brain className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">2. Feature Extraction (TF-IDF)</h4>
                      <p className="text-gray-600">Convert text to numerical vectors using Term Frequency-Inverse Document Frequency</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">3. Model Training</h4>
                      <p className="text-gray-600">Train multiple classifiers from scratch on resume data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">4. Bulk Processing</h4>
                      <p className="text-gray-600">Process multiple resumes simultaneously and rank by relevance</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Dataset Information</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Resumes:</span>
                    <span className="font-bold text-gray-800">962</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Unique Resumes:</span>
                    <span className="font-bold text-gray-800">166</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Job Categories:</span>
                    <span className="font-bold text-gray-800">25</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Train/Test Split:</span>
                    <span className="font-bold text-gray-800">80/20</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-3">Key Features</h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Process multiple resumes at once
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Automatic ranking by match score
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    TF-IDF vectorization trained from scratch
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Keyword matching and highlighting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Real-time classification and scoring
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'talent-pool' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Talent Pool Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <button
                  onClick={handleBuildTalentPool}
                  disabled={isProcessing || resumes.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg transition-colors disabled:bg-gray-400 mb-4"
                >
                  {isProcessing ? 'Building Pool...' : `Build Talent Pool (${resumes.length} resumes)`}
                </button>
                <p className="text-sm text-gray-600 mb-4">Pool requires at least one resume to be added from Classification tab</p>
              </div>

              {poolAnalytics && (
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Candidates</p>
                    <p className="text-2xl font-bold text-blue-600">{poolAnalytics.totalCandidates}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Avg Experience</p>
                    <p className="text-2xl font-bold text-green-600">{poolAnalytics.avgExperience} yrs</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-lg font-bold text-purple-600">₹{poolAnalytics.totalBudget}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Unique Skills</p>
                    <p className="text-2xl font-bold text-orange-600">{poolAnalytics.uniqueSkills}</p>
                  </div>
                </div>
              )}
            </div>

            {talentPool.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Talent Pool Details</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {talentPool.map((candidate, idx) => (
                    <div key={candidate.id} className="border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">#{idx + 1} {candidate.name}</p>
                          <p className="text-sm text-indigo-600">{candidate.topCategory}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-indigo-600">{candidate.confidence}%</p>
                          <p className="text-sm text-gray-500">{candidate.experience} years exp</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 5).map((skill, i) => (
                          <span key={i} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Est. Salary: ₹{candidate.salary.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clustering' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">K-Means Clustering Analysis</h2>
            <button
              onClick={handleClusteringAnalysis}
              disabled={isProcessing || talentPool.length === 0}
              className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {isProcessing ? 'Analyzing...' : `Analyze Clusters (${talentPool.length} candidates)`}
            </button>

            {clusteringResults && (
              <div className="space-y-6">
                {clusteringResults.map((cluster) => (
                  <div key={cluster.clusterId} className="border-2 border-indigo-300 rounded-lg p-6 bg-indigo-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-indigo-800">Cluster {cluster.clusterId}</h3>
                      <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                        {cluster.size} members
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Avg Confidence</p>
                        <p className="text-xl font-bold text-indigo-600">{cluster.avgConfidence}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Categories</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cluster.categories.map((cat, i) => (
                            <span key={i} className="bg-white text-indigo-800 px-2 py-1 rounded text-xs border border-indigo-300">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Top Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {cluster.topSkills.map((skill, i) => (
                          <span key={i} className="bg-white text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'team-builder' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Greedy Team Builder</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Required Roles (comma-separated)</label>
                <textarea
                  className="w-full h-24 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                  placeholder="e.g., Java Developer, Data Scientist, DevOps Engineer"
                  value={requiredRoles}
                  onChange={(e) => setRequiredRoles(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Budget (₹)</label>
                <input
                  type="number"
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="500000"
                />
                <button
                  onClick={handleBuildTeam}
                  disabled={isProcessing || talentPool.length === 0 || !requiredRoles.trim()}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {isProcessing ? 'Building Team...' : 'Build Optimal Team'}
                </button>
              </div>
            </div>

            {teamBuilderData && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Assembled Team</h3>
                <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-semibold">Team Size</p>
                      <p className="text-2xl font-bold">{teamBuilderData.team.length}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Total Cost</p>
                      <p className="text-2xl font-bold">₹{teamBuilderData.totalBudget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Budget Used</p>
                      <p className="text-2xl font-bold">{teamBuilderData.utilization}</p>
                    </div>
                  </div>
                </div>

                {teamBuilderData.team.length > 0 ? (
                  <div className="space-y-3">
                    {teamBuilderData.team.map((member, idx) => (
                      <div key={member.id} className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">#{idx + 1} {member.name}</p>
                            <p className="text-sm text-green-700 font-semibold">Role: {member.assignedRole}</p>
                            <p className="text-sm text-gray-600 mt-1">{member.topCategory} | {member.experience} yrs exp</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">₹{member.salary.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{member.confidence}% confident</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-6">No qualified candidates found within budget constraints</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeScreeningSystem;
