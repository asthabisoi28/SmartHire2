import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Interview } from "@/entities/Interview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Filter,
  Download,
  Eye,
  Calendar,
  FileText,
  Code,
  Video,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export default function CandidateManagement() {
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [interviews, searchTerm, activeTab]);

  const loadInterviews = async () => {
    try {
      const interviewData = await Interview.list('-created_date');
      setInterviews(interviewData);
    } catch (error) {
      console.error("Error loading interviews:", error);
    }
    setLoading(false);
  };

  const filterInterviews = () => {
    let filtered = [...interviews];
    
    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(interview => interview.status === activeTab);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(interview => 
        interview.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.candidate_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredInterviews(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const exportData = () => {
    const csvData = filteredInterviews.map(interview => ({
      'Job Title': interview.job_title,
      'Candidate ID': interview.candidate_id,
      'Status': interview.status,
      'Stage': interview.stage,
      'ATS Score': interview.ats_score || 'N/A',
      'Technical Score': interview.technical_score || 'N/A',
      'Interview Score': interview.interview_score || 'N/A',
      'Created Date': new Date(interview.created_date).toLocaleDateString()
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'candidates.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Management</h1>
          <p className="text-gray-600">
            Track and manage all candidate applications and interview progress
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportData}
            disabled={filteredInterviews.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0 mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by job title or candidate ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100">
                <TabsTrigger value="all">All ({interviews.length})</TabsTrigger>
                <TabsTrigger value="scheduled">
                  Scheduled ({interviews.filter(i => i.status === 'scheduled').length})
                </TabsTrigger>
                <TabsTrigger value="in_progress">
                  In Progress ({interviews.filter(i => i.status === 'in_progress').length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({interviews.filter(i => i.status === 'completed').length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Candidates ({filteredInterviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInterviews.length > 0 ? (
            <div className="space-y-4">
              {filteredInterviews.map((interview) => {
                const StageIcon = getStageIcon(interview.stage);
                return (
                  <div 
                    key={interview.id} 
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold">
                            {interview.job_title?.charAt(0) || 'C'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {interview.job_title || 'Interview Application'}
                            </h3>
                            <Badge 
                              className={getStatusColor(interview.status)}
                              variant="secondary"
                            >
                              {interview.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span>ID: {interview.candidate_id}</span>
                            <span>•</span>
                            <span>{new Date(interview.created_date).toLocaleDateString()}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <StageIcon className="w-4 h-4" />
                              <span className="capitalize">{interview.stage}</span>
                            </div>
                          </div>
                          
                          {/* Progress Indicators */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {['ats', 'technical', 'interview', 'completed'].map((stage, index) => {
                                const Icon = getStageIcon(stage);
                                const isCompleted = ['ats', 'technical', 'interview', 'completed'].indexOf(interview.stage) >= index;
                                const isCurrent = interview.stage === stage;
                                
                                return (
                                  <div 
                                    key={stage}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full text-xs ${
                                      isCurrent ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' :
                                      isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col lg:items-end gap-3">
                        {/* Scores */}
                        {interview.status === 'completed' && (
                          <div className="flex gap-2">
                            {interview.ats_score && (
                              <Badge variant="outline" className="text-xs">
                                ATS: {interview.ats_score}/100
                              </Badge>
                            )}
                            {interview.technical_score && (
                              <Badge variant="outline" className="text-xs">
                                Tech: {interview.technical_score}/100
                              </Badge>
                            )}
                            {interview.interview_score && (
                              <Badge variant="outline" className="text-xs">
                                Interview: {interview.interview_score}/100
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert(`Viewing details for ${interview.job_title}`)}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert(`Scheduling interview for ${interview.job_title}`)}
                            className="gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {interview.interview_notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{interview.interview_notes}</p>
                      </div>
                    )}
                    
                    {interview.technical_warnings > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{interview.technical_warnings} proctoring warning(s)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-500">
                {searchTerm || activeTab !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'No candidates have applied yet'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}