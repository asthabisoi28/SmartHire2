import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Interview } from "@/entities/Interview";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Video, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  UserCheck,
  Target,
  CalendarIcon // Added CalendarIcon
} from "lucide-react";
import ScheduleInterviewModal from "../components/interview/ScheduleInterviewModal"; // Added ScheduleInterviewModal import

export default function HRDashboard() {
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false); // New state for modal

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
      
      const interviewData = await Interview.list('-created_date');
      setInterviews(interviewData);
    } catch (error) {
      console.error("Error loading data:", error);
      // Redirect to home if user not found or unauthenticated
      window.location.href = createPageUrl("Home");
    }
    setLoading(false);
  };

  const handleInterviewScheduled = () => {
    loadData(); // Refresh the data
    setShowScheduleModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const inProgressInterviews = interviews.filter(i => i.status === 'in_progress');
  const avgScore = completedInterviews.length > 0 
    ? Math.round(completedInterviews.reduce((sum, i) => sum + ((i.ats_score || 0) + (i.technical_score || 0) + (i.interview_score || 0)) / 3, 0) / completedInterviews.length)
    : 0;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Welcome Header */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-3xl" />
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {user?.full_name?.charAt(0) || 'H'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Welcome back, {user?.full_name}! 🚀
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage interviews and track candidate progress
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowScheduleModal(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              Schedule Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Candidates</p>
                <p className="text-2xl font-bold text-blue-700">{interviews.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-700">{completedInterviews.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-orange-700">{inProgressInterviews.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Average Score</p>
                <p className="text-2xl font-bold text-purple-700">{avgScore}</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Candidates */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Recent Candidates ({interviews.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowScheduleModal(true)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    Schedule
                  </Button>
                  <Link to={createPageUrl("CandidateManagement")}>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.slice(0, 6).map((interview) => (
                    <div 
                      key={interview.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {interview.job_title?.charAt(0) || 'C'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {interview.job_title || 'Interview'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              className={getStatusColor(interview.status)}
                              variant="secondary"
                            >
                              {interview.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {interview.stage}
                            </Badge>
                            {interview.scheduled_time && (
                              <Badge variant="outline" className="text-xs text-blue-600">
                                {new Date(interview.scheduled_time).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {interview.status === 'scheduled' ? (
                          <Link to={createPageUrl(`LiveInterview?interviewId=${interview.id}`)}>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Video className="w-4 h-4 mr-2" />
                              Join Interview
                            </Button>
                          </Link>
                        ) : (
                          // Preserve existing content for non-scheduled interviews
                          <>
                            <p className="text-sm text-gray-600">
                              {interview.candidate_id}
                            </p>
                            {interview.status === 'completed' && (
                              <div className="flex gap-1 mt-1">
                                {interview.ats_score && (
                                  <Badge variant="outline" className="text-xs">
                                    ATS: {interview.ats_score}
                                  </Badge>
                                )}
                                {interview.technical_score && (
                                  <Badge variant="outline" className="text-xs">
                                    Tech: {interview.technical_score}
                                  </Badge>
                                )}
                                {interview.interview_score && (
                                  <Badge variant="outline" className="text-xs">
                                    Interview: {interview.interview_score}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No interviews yet</h3>
                  <p className="text-gray-500 mb-4">Get started by scheduling your first interview</p>
                  <Button 
                    onClick={() => setShowScheduleModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Analytics */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => setShowScheduleModal(true)}
                variant="outline" 
                className="w-full justify-start gap-3 h-12 hover:bg-blue-50 hover:border-blue-300"
              >
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Schedule New Interview
              </Button>
              <Link to={createPageUrl("CandidateManagement")}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 h-12 hover:bg-green-50 hover:border-green-300"
                >
                  <UserCheck className="w-5 h-5 text-green-600" />
                  Manage Candidates
                </Button>
              </Link>
              <Link to={createPageUrl("Analytics")}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 h-12 hover:bg-purple-50 hover:border-purple-300"
                >
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-indigo-900">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-800">Pass Rate</span>
                  <span className="font-bold text-indigo-900">
                    {interviews.length > 0 ? Math.round((completedInterviews.length / interviews.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-800">Avg. ATS Score</span>
                  <span className="font-bold text-indigo-900">
                    {completedInterviews.length > 0 
                      ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.ats_score || 0), 0) / completedInterviews.length)
                      : 0
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-800">Avg. Technical</span>
                  <span className="font-bold text-indigo-900">
                    {completedInterviews.length > 0 
                      ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.technical_score || 0), 0) / completedInterviews.length)
                      : 0
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-indigo-800">This Month</span>
                  <span className="font-bold text-indigo-900">
                    {interviews.filter(i => new Date(i.created_date) > new Date(Date.now() - 30*24*60*60*1000)).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {interviews.slice(0, 4).map((interview) => (
                  <div key={interview.id} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="text-gray-900">
                        New {interview.stage} stage completed
                      </p>
                      <p className="text-gray-500 text-xs">
                        {interview.job_title} • {new Date(interview.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {interviews.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onScheduled={handleInterviewScheduled}
      />
    </div>
  );
}