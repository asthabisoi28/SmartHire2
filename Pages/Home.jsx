import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Users, 
  FileText, 
  Code, 
  Video, 
  Shield,
  Zap,
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Globe,
  Sparkles,
  ChevronDown,
  PlayCircle,
  Rocket,
  Target,
  BarChart3,
  Building,
  UserIcon
} from "lucide-react";

export default function Home() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showUserTypeSelection, setShowUserTypeSelection] = React.useState(false);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Check if user has completed profile setup
      if (!userData.profile_completed) {
        setShowUserTypeSelection(true);
      } else {
        // Redirect to appropriate dashboard
        const dashboardUrl = userData.user_type === 'hr' ? createPageUrl("HRDashboard") : createPageUrl("CandidateDashboard");
        window.location.href = dashboardUrl;
      }
    } catch (error) {
      setUser(null);
    }
    setLoading(false);
  };

  const handleUserTypeSelection = async (userType) => {
    try {
      await User.updateMyUserData({
        user_type: userType,
        profile_completed: true
      });
      
      // Redirect to appropriate dashboard
      const dashboardUrl = userType === 'hr' ? createPageUrl("HRDashboard") : createPageUrl("CandidateDashboard");
      window.location.href = dashboardUrl;
    } catch (error) {
      console.error("Error updating user type:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto" />
            <div className="absolute inset-0 rounded-full bg-blue-50 blur-lg animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading InterviewAI...</p>
        </div>
      </div>
    );
  }

  // Show user type selection for new users
  if (user && showUserTypeSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-2 h-2 text-yellow-900" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    InterviewAI
                  </h1>
                  <p className="text-xs text-blue-300 font-medium tracking-wider">NEXT-GEN HIRING PLATFORM</p>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Welcome to InterviewAI, {user.full_name}!
              </CardTitle>
              <p className="text-gray-300 text-lg">
                How would you like to use our platform?
              </p>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card 
                  className="p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:border-blue-400 group"
                  onClick={() => handleUserTypeSelection('candidate')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">I'm a Candidate</h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Looking for job opportunities and want to showcase my skills through AI-powered interviews
                    </p>
                    <div className="space-y-2 text-xs text-blue-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>ATS Resume Screening</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Technical Assessments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Video Interviews</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:border-purple-400 group"
                  onClick={() => handleUserTypeSelection('hr')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">I'm an HR Manager</h3>
                    <p className="text-purple-700 text-sm mb-4">
                      I want to streamline hiring process and find the best candidates efficiently
                    </p>
                    <div className="space-y-2 text-xs text-purple-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Schedule Interviews</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Track Candidate Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Analytics & Insights</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="text-center">
                <p className="text-gray-400 text-xs">
                  You can always change this setting later in your profile
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show landing page for non-logged in users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          {/* Logo Animation */}
          <div className="mb-8 relative">
            <div className="inline-flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-3 h-3 text-yellow-900" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  InterviewAI
                </h1>
                <p className="text-sm text-blue-300 font-medium tracking-wider">NEXT-GEN HIRING PLATFORM</p>
              </div>
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Revolutionize Your
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Interview Process
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Experience the future of recruitment with our AI-powered platform featuring 
            automated resume screening, intelligent coding assessments, and real-time interview analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg shadow-2xl shadow-blue-500/25 hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              onClick={handleLogin}
            >
              <Rocket className="w-5 h-5 mr-2" />
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg backdrop-blur-sm"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: FileText,
                title: "AI Resume Screening",
                description: "Advanced ATS analysis with instant scoring and detailed feedback for optimization.",
                color: "from-blue-400 to-cyan-400"
              },
              {
                icon: Code,
                title: "Smart Coding Tests",
                description: "Real-time coding challenges with AI proctoring and automated evaluation.",
                color: "from-purple-400 to-pink-400"
              },
              {
                icon: Video,
                title: "Intelligent Interviews",
                description: "AI-powered video interviews with emotion analysis and behavioral insights.",
                color: "from-green-400 to-teal-400"
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {[
              { number: "50K+", label: "Interviews Completed" },
              { number: "95%", label: "Accuracy Rate" },
              { number: "1000+", label: "Companies Trust Us" },
              { number: "24/7", label: "AI Support Available" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/20 p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Hiring?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of companies already using AI to find the perfect candidates faster and more accurately than ever before.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              onClick={handleLogin}
            >
              <Target className="w-6 h-6 mr-3" />
              Start Your Free Trial
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}