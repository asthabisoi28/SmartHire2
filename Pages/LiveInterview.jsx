import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Interview } from "@/entities/Interview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  Phone, 
  MessageCircle,
  Send,
  Eye,
  Shield,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Scan,
  Zap,
  Target,
  Monitor,
  Camera
} from "lucide-react";

export default function LiveInterview() {
  const [searchParams] = useSearchParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Simulated real-time proctoring data for HR view
  const [proctorStats, setProctorStats] = useState({
    faceDetected: true,
    faceCount: 1,
    eyeContact: 85,
    lookingAway: false,
    objectsDetected: [],
    audioQuality: 'good',
    totalViolations: 0
  });

  const proctorIntervalRef = useRef(null);

  useEffect(() => {
    const interviewId = searchParams.get('interviewId');
    if (interviewId) {
      loadInterview(interviewId);
    } else {
      setLoading(false);
    }
    
    // Start simulating proctoring updates for the HR
    startProctoringSimulation();

    return () => {
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
    };
  }, [searchParams]);

  const loadInterview = async (id) => {
    try {
      const interviewData = await Interview.get(id);
      setInterview(interviewData);
    } catch (error) {
      console.error("Error loading interview:", error);
    }
    setLoading(false);
  };
  
  const startProctoringSimulation = () => {
    proctorIntervalRef.current = setInterval(() => {
      // This simulates receiving data from the candidate's side
      setProctorStats(prev => {
        let newViolations = prev.totalViolations;
        let newEyeContact = Math.min(100, prev.eyeContact + 2);
        let newFaceCount = 1;
        let newLookingAway = false;
        
        // Randomly trigger a "looking away" event
        if (Math.random() > 0.8) {
          newViolations++;
          newEyeContact = Math.max(30, prev.eyeContact - 20);
          newLookingAway = true;
        }
        
        // Randomly trigger a "multiple faces" event
        if (Math.random() > 0.95) {
          newViolations++;
          newFaceCount = 2;
        }
        
        return {
          ...prev,
          totalViolations: newViolations,
          eyeContact: newEyeContact,
          faceCount: newFaceCount,
          lookingAway: newLookingAway,
          audioQuality: Math.random() > 0.9 ? 'fair' : 'good'
        };
      });
    }, 3000);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        text: newMessage,
        sender: 'hr',
        timestamp: new Date().toLocaleTimeString()
      }]);
      setNewMessage('');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading Interview...</div>;
  }

  if (!interview) {
    return <div className="p-8 text-center text-red-500">Interview not found.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Live Interview Session</h1>
        <p className="text-gray-600">
          Interview with: <span className="font-medium">{interview.candidate_id}</span> for <span className="font-medium">{interview.job_title}</span>
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Video and Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-2xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center gap-2">
                  <Video className="w-6 h-6 text-blue-600" />
                  Candidate's Video Feed
                </span>
                <Badge variant={proctorStats.lookingAway ? "destructive" : "default"}>
                  {proctorStats.lookingAway ? "Looking Away" : "Focused"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Candidate Video Simulation */}
              <div className="bg-gray-900 rounded-xl h-96 flex items-center justify-center text-white relative">
                 <Users className="w-24 h-24 text-gray-600" />
                 <p className="absolute bottom-4">Candidate Video</p>
                 {proctorStats.faceCount > 1 && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold animate-pulse">
                        ⚠️ MULTIPLE FACES: {proctorStats.faceCount}
                    </div>
                 )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-6">
             {/* HR Video Simulation */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Camera className="w-5 h-5 text-green-600" />
                        Your Video Feed
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-800 rounded-lg h-40 flex items-center justify-center text-white text-sm">
                        HR Video
                    </div>
                </CardContent>
            </Card>

            {/* Chat */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                        Live Chat
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-24 overflow-y-auto mb-2 p-2 bg-gray-100 rounded">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className="text-sm">
                                <span className="font-bold">{msg.sender === 'hr' ? 'You' : 'Candidate'}:</span> {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type message..." />
                        <Button onClick={sendMessage} size="icon"><Send className="w-4 h-4" /></Button>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Proctoring Dashboard */}
        <div className="space-y-6">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Scan className="w-5 h-5 animate-pulse" />
                AI Proctoring Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                <span className="flex items-center gap-2"><Eye className="w-4 h-4"/>Eye Contact</span>
                <Progress value={proctorStats.eyeContact} className="w-24 h-2" />
                <Badge className="bg-purple-100 text-purple-800">{proctorStats.eyeContact}%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                <span className="flex items-center gap-2"><Users className="w-4 h-4"/>Face Count</span>
                <Badge variant={proctorStats.faceCount > 1 ? 'destructive' : 'default'}>{proctorStats.faceCount}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                <span className="flex items-center gap-2"><Target className="w-4 h-4"/>Object Detection</span>
                <Badge variant="secondary">None</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4"/>Violations</span>
                <Badge variant={proctorStats.totalViolations > 0 ? "destructive" : "default"}>
                  {proctorStats.totalViolations}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="text-lg">Session Controls</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="destructive" className="w-full gap-2">
                    <Phone className="w-4 h-4" />
                    End Interview
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}