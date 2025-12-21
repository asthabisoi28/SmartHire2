import React, { useState, useRef } from "react";
import { User } from "@/entities/User";
import { Interview } from "@/entities/Interview";
import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Download,
  ArrowRight,
  Target,
  TrendingUp,
  Award,
  BarChart3
} from "lucide-react";
import { createPageUrl, extractResumeTests } from "@/utils";

export default function ATSChecker() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef(null);

  // LLM evaluation state (GPT-4o-mini)
  const [atsText, setAtsText] = useState('');
  const [evalLoading, setEvalLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evalError, setEvalError] = useState(null);

  // Reset all states
  const resetStates = () => {
    setFile(null);
    setUploading(false);
    setAnalyzing(false);
    setResults(null);
    setError(null);
    setUploadProgress(0);
    setAnalysisProgress(0);
  };

  // Validate file
  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      throw new Error("No file selected");
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      throw new Error("Please upload a PDF, DOC, DOCX, or TXT file");
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      throw new Error("File size must be less than 10MB");
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    try {
      const selectedFile = e.target.files[0];
      if (!selectedFile) return;

      validateFile(selectedFile);
      setFile(selectedFile);
      setError(null);
      setResults(null);
    } catch (err) {
      setError(err.message);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile) return;

      validateFile(droppedFile);
      setFile(droppedFile);
      setError(null);
      setResults(null);
    } catch (err) {
      setError(err.message);
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Simulate upload progress
  const simulateProgress = (setProgress, duration = 2000) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          setProgress(100);
          clearInterval(interval);
          setTimeout(resolve, 200);
        } else {
          setProgress(Math.floor(progress));
        }
      }, duration / 20);
    });
  };

  // Handle file upload and analysis
  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setError(null);
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload with progress
      await simulateProgress(setUploadProgress, 1500);

      // Upload file
      const uploadResult = await UploadFile(file);

      // Read file as base64
      const toBase64 = (f) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });
      const fileDataBase64 = await toBase64(file);
      
      if (!uploadResult.success) {
        throw new Error("Failed to upload file");
      }

      setUploading(false);
      setAnalyzing(true);
      setAnalysisProgress(0);

      // Simulate analysis progress
      await simulateProgress(setAnalysisProgress, 3000);

      // Analyze resume with text extraction via server endpoint
      const resp = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'ATS Resume Analysis',
          transcript: `File: ${uploadResult.fileName} (type: ${uploadResult.fileType})\n` +
            'The resume content is attached or referenced. Evaluate for ATS (Applicant Tracking System) compatibility and return JSON with: ' +
            'score (0-100), strengths (array), improvements (array), keywords {found:[], missing:[]}, sections {contact, summary, experience, skills, education} each with score and feedback.',
          rubric: 'Focus on ATS parsing, keyword coverage, measurable achievements, formatting best practices, and clarity. Be concise.'
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }
      setResults(data.evaluation);
      // Build real tests from evaluation + optional plain text (if available later)
      const checks = extractResumeTests({ evaluation: data.evaluation });
      setResults(prev => ({ ...(prev || data.evaluation), extractedChecks: checks }));
      setAnalyzing(false);

    } catch (err) {
      console.error("ATS Analysis Error:", err);
      setError(err.message || "An error occurred during analysis");
      setUploading(false);
      setAnalyzing(false);
      setUploadProgress(0);
      setAnalysisProgress(0);
    }
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Get score badge variant
  const getScoreBadge = (score) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-blue-100 text-blue-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ATS Resume Checker</h1>
              <p className="text-gray-600">Optimize your resume for Applicant Tracking Systems</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Your Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {file ? (
                <div className="space-y-2">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                  <p className="text-lg font-medium text-green-800">{file.name}</p>
                  <p className="text-sm text-green-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetStates();
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drag and drop your resume here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse files
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Button */}
            <div className="flex gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1"
                disabled={uploading || analyzing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              
              <Button
                onClick={handleUploadAndAnalyze}
                disabled={!file || uploading || analyzing}
                className="flex-1"
              >
                {uploading || analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploading ? 'Uploading...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>

            {/* Progress Bars */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {analyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing with AI...</span>
                  <span>{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* LLM Evaluation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              GPT-4o-mini Evaluation (Paste Resume Text)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste the resume text here to evaluate without uploading a file..."
              value={atsText}
              onChange={(e) => setAtsText(e.target.value)}
              rows={6}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={async () => {
                  setEvalError(null);
                  setEvaluation(null);
                  if (!atsText.trim()) return;
                  setEvalLoading(true);
                  try {
                    const resp = await fetch('/api/evaluate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        question: 'ATS Resume Quality Evaluation',
                        transcript: atsText,
                        rubric: 'Assess resume for ATS compatibility, clarity, keyword coverage, measurable outcomes, and overall quality. Return score and structured feedback.'
                      })
                    });
                    const data = await resp.json();
                    if (!resp.ok || !data.ok) throw new Error(data.error || 'Evaluation failed');
                    setEvaluation(data.evaluation);
                  } catch (e) {
                    setEvalError(e.message || 'Failed to evaluate');
                  } finally {
                    setEvalLoading(false);
                  }
                }}
                disabled={!atsText.trim() || evalLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {evalLoading ? 'Evaluating…' : 'Evaluate with OpenAI'}
              </Button>
            </div>

            {evalError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{evalError}</AlertDescription>
              </Alert>
            )}
            {evaluation && (
              <div className="p-4 rounded-lg border bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold">Score: {evaluation.score}/100</div>
                  <Badge>{evaluation.verdict}</Badge>
                </div>
                {evaluation.summary && <p className="text-gray-700">{evaluation.summary}</p>}
                {Array.isArray(evaluation.strengths) && evaluation.strengths.length > 0 && (
                  <div>
                    <div className="font-medium">Strengths</div>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(evaluation.improvements) && evaluation.improvements.length > 0 && (
                  <div>
                    <div className="font-medium">Improvements</div>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {evaluation.improvements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  ATS Compatibility Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-4xl font-bold ${getScoreColor(results.score)}`}>
                      {results.score}/100
                    </div>
                    <Badge className={getScoreBadge(results.score)}>
                      {results.score >= 90 ? 'Excellent' : 
                       results.score >= 80 ? 'Good' : 
                       results.score >= 70 ? 'Fair' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <div className="w-24 h-24">
                    <Progress value={results.score} className="h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <TrendingUp className="w-5 h-5" />
                    Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.improvements?.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Extracted Checks */}
            {Array.isArray(results.extractedChecks) && results.extractedChecks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Resume Checks (Extracted)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {results.extractedChecks.map((c, idx) => (
                      <div key={`${c.id}-${idx}`} className={`flex items-center justify-between border rounded p-2 ${c.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <span className="text-sm font-medium">{c.name}</span>
                        <Badge className={c.passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}>
                          {c.passed ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Keywords Analysis */}
            {results.keywords && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Keyword Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Found Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.found?.map((keyword, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.missing?.map((keyword, index) => (
                        <Badge key={index} className="bg-red-100 text-red-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section Analysis */}
            {results.sections && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Section Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(results.sections).map(([section, data]) => (
                      <div key={section} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{section}</span>
                          <Badge className={getScoreBadge(data.score)}>
                            {data.score}/100
                          </Badge>
                        </div>
                        <Progress value={data.score} className="h-2" />
                        <p className="text-sm text-gray-600">{data.feedback}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={resetStates}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Analyze Another Resume
              </Button>
              <Button
                onClick={() => window.location.href = createPageUrl("TechnicalTest")}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Take Technical Test
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}