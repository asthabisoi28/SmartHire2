import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Interview } from "@/entities/Interview";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Code,
  Video,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  Calendar,
  ArrowRight,
  Brain, // Added for new loading screen
  Zap // Added for Quick Actions title
} from "lucide-react";

export default function CandidateDashboard() {
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // If user hasn't set their type, redirect to home for setup
      if (!userData.user_type) {
        window.location.href = createPageUrl("Home");
        return;
      }

      const interviewData = await Interview.filter(
        { candidate_id: userData.email }, // Changed from userData.id to userData.email
        '-created_date'
      );
      setInterviews(interviewData);
    } catch (error) {
      console.error("Error loading data:", error);
      // Redirect to home if user not found or other error
      window.location.href = createPageUrl("Home");
    }
    setLoading(false);
  };

  const getStageProgress = (stage) => {
    const stages = ['ats', 'technical', 'interview', 'completed'];
    const currentIndex = stages.indexOf(stage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'ats': return FileText;
      case 'technical': return Code;
      case 'interview': return Video;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const activeInterview = interviews.find(i => i.status === 'in_progress');
  const scheduledInterviews = interviews.filter(i => i.status === 'scheduled');
  const completedInterviews = interviews.filter(i => i.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full animate-bounce" />
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Enhanced Welcome Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {user?.full_name?.charAt(0) || 'C'}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Welcome back, {user?.full_name}! 🚀
                </h1>
                <p className="text-gray-600 text-lg">
                  Ready to advance your career with AI-powered interviews
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-500">Active</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last login: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Interviews",
              value: interviews.length,
              icon: FileText,
              color: "from-blue-500 to-cyan-500",
              bgColor: "from-blue-50 to-cyan-50"
            },
            {
              label: "Scheduled",
              value: scheduledInterviews.length,
              icon: Calendar,
              color: "from-orange-500 to-red-500",
              bgColor: "from-orange-50 to-red-50"
            },
            {
              label: "Completed",
              value: completedInterviews.length,
              icon: CheckCircle,
              color: "from-green-500 to-emerald-500",
              bgColor: "from-green-50 to-emerald-50"
            },
            {
              label: "Average Score",
              value: completedInterviews.length > 0 ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.interview_score || 0), 0) / completedInterviews.length) : 0,
              icon: Award,
              color: "from-purple-500 to-pink-500",
              bgColor: "from-purple-50 to-pink-50"
            }
          ].map((stat, index) => (
            <Card key={index} className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br ${stat.bgColor} hover:scale-105 transform`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active/Scheduled Interviews */}
          <div className="lg:col-span-2">
            {/* Scheduled Interviews Section */}
            {scheduledInterviews.length > 0 && (
              <Card className="mb-8 shadow-2xl border-0 bg-gradient-to-br from-orange-50 to-red-50/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-2xl" />
                <CardHeader className="pb-4 relative">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    Scheduled Interviews ({scheduledInterviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    {scheduledInterviews.map((interview) => (
                      <div key={interview.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                              {interview.job_title}
                            </h3>
                            {interview.scheduled_time && (
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(interview.scheduled_time).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(interview.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                              </div>
                            )}
                            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                              {interview.stage} stage
                            </Badge>
                          </div>
                          <div className="text-right">
                            <Button 
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                              onClick={() => {
                                if (interview.stage === 'ats') {
                                  window.location.href = createPageUrl("ATSChecker");
                                } else if (interview.stage === 'technical') {
                                  window.location.href = createPageUrl("TechnicalTest");
                                } else if (interview.stage === 'interview') {
                                  window.location.href = createPageUrl("InterviewRoom");
                                }
                              }}
                            >
                              Start Interview
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Interview - Enhanced */}
            {activeInterview && activeInterview.status === 'in_progress' ? (
              <Card className="mb-8 shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl" />
                <CardHeader className="pb-4 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      Active Interview
                    </CardTitle>
                    <Badge
                      variant="default"
                      className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {activeInterview.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {activeInterview.job_title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Interview Progress: {activeInterview.stage}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Overall Progress</span>
                        <span className="font-medium">{Math.round(getStageProgress(activeInterview.stage))}%</span>
                      </div>
                      <Progress value={getStageProgress(activeInterview.stage)} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {['ats', 'technical', 'interview', 'completed'].map((stage, index) => {
                        const StageIcon = getStageIcon(stage);
                        const isCompleted = ['ats', 'technical', 'interview', 'completed'].indexOf(activeInterview.stage) >= index;
                        const isCurrent = activeInterview.stage === stage;

                        return (
                          <div
                            key={stage}
                            className={`flex flex-col items-center p-3 rounded-lg ${
                              isCurrent ? 'bg-blue-50 ring-2 ring-blue-500' :
                              isCompleted ? 'bg-green-50' : 'bg-gray-50'
                            }`}
                          >
                            <StageIcon className={`w-6 h-6 mb-2 ${
                              isCurrent ? 'text-blue-600' :
                              isCompleted ? 'text-green-600' : 'text-gray-400'
                            }`} />
                            <span className={`text-xs font-medium capitalize ${
                              isCurrent ? 'text-blue-600' :
                              isCompleted ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-3 mt-6">
                      {activeInterview.stage === 'ats' && (
                        <Link to={createPageUrl("ATSChecker")} className="flex-1">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Start ATS Check
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                      {activeInterview.stage === 'technical' && (
                        <Link to={createPageUrl("TechnicalTest")} className="flex-1">
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            Take Technical Test
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                      {activeInterview.stage === 'interview' && (
                        <Link to={createPageUrl("InterviewRoom")} className="flex-1">
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">
                            Join Interview
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : !scheduledInterviews.length && (
              <Card className="mb-8 border-dashed border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/30">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Interviews</h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any scheduled interviews at the moment.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.open('mailto:hr@company.com')}
                  >
                    Contact HR
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Interviews */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  Recent Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {interviews.length > 0 ? (
                  <div className="space-y-4">
                    {interviews.slice(0, 3).map((interview) => (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {interview.job_title?.charAt(0) || 'I'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{interview.job_title}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(interview.created_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            interview.status === 'completed' ? 'default' :
                            interview.status === 'in_progress' ? 'secondary' : 'outline'
                          }>
                            {interview.status.replace('_', ' ')}
                          </Badge>
                          {interview.interview_score && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                Score: {interview.interview_score}/100
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No interviews yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions - Enhanced */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-indigo-50/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    title: "Check Resume ATS Score",
                    url: "ATSChecker",
                    icon: FileText,
                    color: "hover:bg-blue-50 hover:border-blue-300",
                    iconColor: "text-blue-600"
                  },
                  {
                    title: "Practice Coding",
                    url: "TechnicalTest",
                    icon: Code,
                    color: "hover:bg-green-50 hover:border-green-300",
                    iconColor: "text-green-600"
                  },
                  {
                    title: "Mock Interview",
                    url: "InterviewRoom",
                    icon: Video,
                    color: "hover:bg-purple-50 hover:border-purple-300",
                    iconColor: "text-purple-600"
                  }
                ].map((action, index) => (
                  <Link key={index} to={createPageUrl(action.url)}>
                    <Button
                      variant="outline"
                      className={`w-full justify-start gap-3 h-14 ${action.color} transition-all duration-300 group`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                      </div>
                      <span className="font-medium">{action.title}</span>
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Enhanced Tips Card */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { tip: "Ensure stable internet connection", icon: CheckCircle },
                    { tip: "Test camera and microphone", icon: CheckCircle },
                    { tip: "Find quiet, well-lit space", icon: CheckCircle },
                    { tip: "Review job requirements", icon: CheckCircle }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                      <item.icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-800 font-medium">{item.tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}