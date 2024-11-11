"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Dashboard from '@/components/Dashboard';

interface SurveyResults {
  primary: string;
  hybrid: string[] | null;
  scores: Record<string, number>;
}

interface AggregateData {
  [key: string]: number;
}

const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Somewhat Disagree' },
  { value: 4, label: 'Neutral' },
  { value: 5, label: 'Somewhat Agree' },
  { value: 6, label: 'Agree' },
  { value: 7, label: 'Strongly Agree' },
];

const QUESTIONS = [
  "Traditional practices and rituals are an important part of my life.",
  "I am interested in understanding the reasoning or philosophy behind spiritual or religious practices.",
  "Astrology or planetary influences play a role in how I approach life decisions.",
  "Participating in cultural festivals and customs is meaningful to me.",
  "Spiritual practices for personal well-being, such as meditation or mindfulness, are important to me.",
  "Religious rituals or practices provide value in my daily life, whether adapted or traditional.",
  "I approach astrology with an interest in rational or evidence-based perspectives.",
  "I am drawn to exploring the cultural or historical background of traditions.",
  "Spiritual practices help me find inner peace or a sense of connection.",
  "I appreciate cultural customs but prefer ways to celebrate them that fit with modern life.",
  "I enjoy astrology as a source of insight or guidance, though I don't always follow it strictly.",
  "I value religious practices most when they are preserved in their original forms."
];

const PERSONAS: Record<string, number[]> = {
  'Traditional Spiritual': [1, 9],
  'Traditional Religious': [1, 6, 12],
  'Traditional Astrologer': [3],
  'Traditional Cultural': [4, 8],
  'Scientific Spiritual': [2, 5],
  'Scientific Religious': [2],
  'Scientific Astrologer': [3, 7],
  'Scientific Cultural': [8],
  'Practical Spiritual': [5, 9],
  'Practical Religious': [6],
  'Practical Astrologer': [3, 11],
  'Practical Cultural': [4, 10]
};

const SpiritualSurvey = () => {
  const [answers, setAnswers] = useState<number[]>(Array(QUESTIONS.length).fill(null));
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [aggregateData, setAggregateData] = useState<AggregateData>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('surveyAggregateData');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('surveyAggregateData', JSON.stringify(aggregateData));
    }
  }, [aggregateData]);

  const calculateScores = (): Record<string, number> => {
    const scores: Record<string, number> = {};
    Object.entries(PERSONAS).forEach(([persona, questionIndices]) => {
      scores[persona] = questionIndices.reduce((sum, qIndex) => 
        sum + (answers[qIndex - 1] || 0), 0);
    });
    return scores;
  };

  const determinePersona = (scores: Record<string, number>): SurveyResults => {
    const maxScore = Math.max(...Object.values(scores));
    const topPersonas = Object.entries(scores)
      .filter(([, score]) => score === maxScore)
      .map(([persona]) => persona);
    
    setAggregateData(prev => ({
      ...prev,
      [topPersonas[0]]: (prev[topPersonas[0]] || 0) + 1
    }));

    return {
      primary: topPersonas[0],
      hybrid: topPersonas.length > 1 ? topPersonas : null,
      scores: scores
    };
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const scores = calculateScores();
      setResults(determinePersona(scores));
    }
  };

  const resetSurvey = () => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setCurrentQuestion(0);
    setResults(null);
    setShowDashboard(false);
  };

  const viewDashboard = () => {
    setShowDashboard(true);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all aggregate data?')) {
      setAggregateData({});
      localStorage.removeItem('surveyAggregateData');
      resetSurvey();
    }
  };

  // Show only dashboard if that mode is selected
  if (showDashboard) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Dashboard aggregateData={aggregateData} />
        <button
          onClick={resetSurvey}
          className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Take New Survey
        </button>
      </div>
    );
  }

  // Show results if survey is completed
  if (results) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        {/* Individual Results */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Spiritual Persona Results</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-lg">
            {results.hybrid ? 
              `You show a hybrid persona combining: ${results.hybrid.join(' & ')}` :
              `Your primary persona is: ${results.primary}`}
          </div>
          
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Detailed Scores:</h3>
          <div className="space-y-3">
            {Object.entries(results.scores)
              .sort(([,a], [,b]) => b - a)
              .map(([persona, score]) => (
                <div key={persona} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span className="font-medium text-gray-700">{persona}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-blue-500 h-4 rounded-full transition-all"
                        style={{ width: `${(score / (7 * 3)) * 100}%` }}
                      />
                    </div>
                    <span className="min-w-[3ch] text-blue-600 font-semibold">{score}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={resetSurvey}
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Take Survey Again
          </button>
          <button
            onClick={viewDashboard}
            className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors"
          >
            View All Results Dashboard
          </button>
          <button
            onClick={clearAllData}
            className="flex-1 border border-gray-300 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>
    );
  }

  // Show survey questions
  // Update the survey question section
// Update the survey question section
return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Spiritual Persona Survey</h2>
        <button
          onClick={viewDashboard}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          View Dashboard
        </button>
      </div>
      <div className="space-y-6">
        <div className="text-sm text-black font-medium">
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </div>
        
        <p className="text-lg font-medium text-black">
          {QUESTIONS[currentQuestion]}
        </p>
        
        <div className="space-y-2">
          {LIKERT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="w-full text-left px-4 py-3 border rounded hover:bg-gray-50 transition-colors text-black font-medium"
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SpiritualSurvey;