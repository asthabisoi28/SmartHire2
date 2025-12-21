import React, { useState, useEffect } from "react";
import { Interview } from "@/entities/Interview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  Award,
  Target,
  Calendar,
  CheckCircle
} from "lucide-react";

export default function Analytics() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const interviewData = await Interview.list('-created_date');
      setInterviews(interviewData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  // Analytics calculations
  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const totalCandidates = interviews.length;
  const passRate = totalCandidates > 0 ? ((completedInterviews.length / totalCandidates) * 100) : 0;
  
  const avgATSScore = completedInterviews.length > 0 
    ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.ats_score || 0), 0) / completedInterviews.length)
    : 0;
  
  const avgTechnicalScore = completedInterviews.length > 0 
    ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.technical_score || 0), 0) / completedInterviews.length)
    : 0;
  
  const avgInterviewScore = completedInterviews.length > 0 
    ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.interview_score || 0), 0) / completedInterviews.length)
    : 0;

  // Stage distribution
  const stageDistribution = interviews.reduce((acc, interview) => {
    acc[interview.stage] = (acc[interview.stage] || 0) + 1;
    return acc;
  }, {});

  // Monthly trends (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const count = interviews.filter(interview => {
      const interviewDate = new Date(interview.created_date);
      return interviewDate.getMonth() === date.getMonth() && 
             interviewDate.getFullYear() === date.getFullYear();
    }).length;
    monthlyData.push({ month, count });
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive insights into your interview performance and candidate trends
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Candidates</p>
                <p className="text-3xl font-bold text-blue-700">{totalCandidates}</p>
                <p className="text-xs text-blue-600 mt-1">All time</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Pass Rate</p>
                <p className="text-3xl font-bold text-green-700">{Math.round(passRate)}%</p>
                <p className="text-xs text-green-600 mt-1">Completion rate</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Score</p>
                <p className="text-3xl font-bold text-purple-700">
                  {Math.round((avgATSScore + avgTechnicalScore + avgInterviewScore) / 3)}
                </p>
                <p className="text-xs text-purple-600 mt-1">Overall average</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">This Month</p>
                <p className="text-3xl font-bold text-orange-700">
                  {monthlyData[monthlyData.length - 1]?.count || 0}
                </p>
                <p className="text-xs text-orange-600 mt-1">New candidates</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Score Breakdown */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">ATS Score</span>
                  <span className="text-sm font-bold text-gray-900">{avgATSScore}/100</span>
                </div>
                <Progress value={avgATSScore} className="h-3" />
                <p className="text-xs text-gray-500 mt-1">Resume compatibility average</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Technical Score</span>
                  <span className="text-sm font-bold text-gray-900">{avgTechnicalScore}/100</span>
                </div>
                <Progress value={avgTechnicalScore} className="h-3" />
                <p className="text-xs text-gray-500 mt-1">Coding assessment average</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Interview Score</span>
                  <span className="text-sm font-bold text-gray-900">{avgInterviewScore}/100</span>
                </div>
                <Progress value={avgInterviewScore} className="h-3" />
                <p className="text-xs text-gray-500 mt-1">Video interview average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stage Distribution */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Stage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stageDistribution).map(([stage, count]) => {
                const percentage = totalCandidates > 0 ? (count / totalCandidates) * 100 : 0;
                return (
                  <div key={stage} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="capitalize"
                        >
                          {stage}
                        </Badge>
                        <span className="text-sm text-gray-600">{count} candidates</span>
                      </div>
                      <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map(({ month, count }) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{month}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.max(5, (count / Math.max(...monthlyData.map(d => d.count), 1)) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-900">Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-white/50 rounded-lg">
                <p className="font-medium text-indigo-900 mb-1">Highest Performing Stage</p>
                <p className="text-indigo-700">
                  {avgATSScore >= avgTechnicalScore && avgATSScore >= avgInterviewScore ? 'ATS Screening' :
                   avgTechnicalScore >= avgInterviewScore ? 'Technical Assessment' : 'Video Interview'}
                </p>
              </div>
              
              <div className="p-3 bg-white/50 rounded-lg">
                <p className="font-medium text-indigo-900 mb-1">Completion Rate</p>
                <p className="text-indigo-700">{Math.round(passRate)}% of candidates complete all stages</p>
              </div>
              
              <div className="p-3 bg-white/50 rounded-lg">
                <p className="font-medium text-indigo-900 mb-1">Growth Trend</p>
                <p className="text-indigo-700">
                  {monthlyData.length >= 2 && monthlyData[monthlyData.length - 1].count > monthlyData[monthlyData.length - 2].count 
                    ? 'Candidate applications are increasing' 
                    : 'Steady application rate'
                  }
                </p>
              </div>
              
              <div className="p-3 bg-white/50 rounded-lg">
                <p className="font-medium text-indigo-900 mb-1">Recommendation</p>
                <p className="text-indigo-700">
                  {avgTechnicalScore < 70 ? 'Focus on improving technical assessment clarity' :
                   avgInterviewScore < 70 ? 'Consider interview training for better results' :
                   'Performance looks strong across all stages'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}