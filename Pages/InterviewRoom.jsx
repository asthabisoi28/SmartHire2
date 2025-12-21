import React, { useState, useEffect, useRef } from "react";
import { User } from "@/entities/User";
import { Interview } from "@/entities/Interview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageCircle,
  Send,
  Eye,
  Shield,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Camera,
  Play,
  Radio,
  Scan,
  UserX,
  Volume2,
  Monitor,
  Zap,
  Target,
  Brain,
  SkipForward,
  RotateCcw,
  FileText,
  Timer
} from "lucide-react";
import { createPageUrl } from "@/utils";

export default function InterviewRoom() {
  const [user, setUser] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [interviewScore, setInterviewScore] = useState(null);

  // AI Interview States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Transcript + LLM evaluation state
  const [transcript, setTranscript] = useState('');
  const [evalLoading, setEvalLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evalError, setEvalError] = useState(null);

  // Proctoring States (keeping existing proctoring features)
  const [proctoringActive, setProctoringActive] = useState(false);
  const [proctoringMessage, setProctoringMessage] = useState({ text: 'AI Proctoring is standing by.', type: 'info' });
  const [proctorAlerts, setProctorAlerts] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeContact, setEyeContact] = useState(0);
  const [lookingAway, setLookingAway] = useState(false);
  const [violations, setViolations] = useState(0);

  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const blazefaceModelRef = useRef(null);
  const cocoModelRef = useRef(null);
  const tfReadyRef = useRef(false);

  useEffect(() => {
    loadUser();
    startCamera();
    // lazy-load TF and models via CDN
    (async () => {
      const loadScript = (src) => new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      try {
        if (!window.tf) {
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.18.0/dist/tf.min.js');
        }
        if (!window.blazeface) {
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.1.0/dist/blazeface.min.js');
        }
        if (!window.cocoSsd) {
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
        }
        if (!blazefaceModelRef.current) {
          blazefaceModelRef.current = await window.blazeface.load();
        }
        if (!cocoModelRef.current) {
          cocoModelRef.current = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
        }
        tfReadyRef.current = true;
        if (interviewStarted) {
          startDetectionLoop();
        }
      } catch (e) {
        console.error('Failed to load TF.js/models', e);
      }
    })();

    return () => {
      stopCamera();
      stopDetectionLoop();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (interviewStarted) {
      startProctoring();
    } else {
      stopProctoring();
    }
  }, [interviewStarted]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsVideoOn(false);
      addProctorAlert("Camera access denied - Interview cannot proceed", "critical");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const startProctoring = () => {
    setProctoringActive(true);
    setProctoringMessage({ text: 'AI Proctoring Assistant is active.', type: 'info' });

    // Start duration timer
    intervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    // Start detection loop when models ready and camera on
    startDetectionLoop();
  };

  const stopProctoring = () => {
    setProctoringActive(false);
    stopDetectionLoop();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Detection loop using BlazeFace and coco-ssd
  const drawOverlay = (predictions, objects) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    const { videoWidth: w, videoHeight: h } = video;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    // draw faces
    if (predictions && predictions.length) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      predictions.forEach(p => {
        const [x, y] = p.topLeft;
        const [x2, y2] = p.bottomRight;
        const bw = x2 - x;
        const bh = y2 - y;
        ctx.strokeRect(x, y, bw, bh);
        if (p.landmarks) {
          ctx.fillStyle = '#22c55e';
          p.landmarks.forEach(([lx, ly]) => ctx.fillRect(lx - 2, ly - 2, 4, 4));
        }
      });
    }

    // draw objects
    if (objects && objects.length) {
      ctx.strokeStyle = '#60a5fa';
      ctx.fillStyle = '#60a5fa';
      ctx.lineWidth = 2;
      objects.forEach(o => {
        const [x, y, bw, bh] = o.bbox;
        ctx.strokeRect(x, y, bw, bh);
        ctx.font = '12px sans-serif';
        ctx.fillText(`${o.class} (${(o.score*100).toFixed(0)}%)`, x + 4, y + 14);
      });
    }
  };

  const startDetectionLoop = () => {
    if (!videoRef.current || !tfReadyRef.current) return;
    const loop = async () => {
      if (!videoRef.current || !tfReadyRef.current) return;
      try {
        const video = videoRef.current;
        const faceModel = blazefaceModelRef.current;
        const coco = cocoModelRef.current;
        let faces = [];
        let objects = [];
        if (faceModel && video.readyState >= 2) {
          faces = await faceModel.estimateFaces(video, false);
          setFaceDetected(faces.length > 0);
          // naive eye-contact heuristic: if face present and width ~ central
          if (faces.length) {
            const f = faces[0];
            const [x, y] = f.topLeft;
            const [x2, y2] = f.bottomRight;
            const cx = (x + x2) / 2;
            const centerDist = Math.abs(cx - video.videoWidth / 2) / (video.videoWidth / 2);
            const attention = Math.max(0, 100 - Math.min(100, centerDist * 200));
            setEyeContact(Math.round(attention));
            setLookingAway(attention < 50);
          }
        }
        if (coco && video.readyState >= 2) {
          objects = await coco.detect(video);
        }
        drawOverlay(faces, objects);

        // simple alerts
        const personCount = (objects || []).filter(o => o.class === 'person' && o.score > 0.5).length;
        if (personCount > 1) {
          addProctorAlert(`Multiple people detected (${personCount})`, 'warning');
        }
        const flagged = (objects || []).filter(o => ['cell phone','book','tv','laptop'].includes(o.class) && o.score > 0.6);
        if (flagged.length) {
          const names = Array.from(new Set(flagged.map(f => f.class))).join(', ');
          addProctorAlert(`Suspicious objects: ${names}`, 'warning');
        }
      } catch (e) {
        // swallow per-frame errors
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  const stopDetectionLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Removed simulateAIProctoring, handleLookingAway, handleMultipleFaces,
  // handleObjectDetection, handleAudioIssue, updateNormalStats as per outline

  const startInterview = () => {
    setInterviewStarted(true);
    setIsRecording(true);

    setChatMessages(prev => [...prev, {
      id: Date.now(),
      text: "You have joined the interview. Please wait for the HR manager to start.",
      sender: 'system',
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Simulate HR joining after a short delay
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "HR Manager has joined the room.",
        sender: 'system',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 3000);
  };

  const endInterview = async () => {
    setInterviewStarted(false);
    setIsRecording(false);
    setInterviewEnded(true);

    // Compute or skip score; remove simulation fallback
    const finalScore = null;
    setInterviewScore(finalScore);

    // Save to database
    try {
      const userData = await User.me();
      await Interview.create({
        candidate_id: userData.id,
        job_title: "AI Video Interview",
        stage: "interview",
        status: "completed",
        interview_score: finalScore,
        // Removed technical_warnings and interview_notes as per simplified proctoring
      });
    } catch (error) {
      console.error("Error saving interview:", error);
    }
  };

  const addProctorAlert = (message, type) => {
    setProctorAlerts(prev => [...prev.slice(-4), { // Keep only last 5 alerts
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        text: newMessage,
        sender: 'candidate',
        timestamp: new Date().toLocaleTimeString()
      }]);
      setNewMessage('');

      // Simulate HR response
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: "Thank you for that. Let's move on to the next question.",
          sender: 'interviewer',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }, 2000);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Removed getSecurityLevelColor as securityLevel state is removed

  if (interviewEnded) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-blue-50">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Completed!</h1>
            {typeof interviewScore === 'number' ? (
              <div className="mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">{interviewScore}/100</div>
                <Badge className="bg-green-100 text-green-800">
                  {interviewScore >= 80 ? 'Excellent Performance' :
                   interviewScore >= 70 ? 'Good Performance' : 'Average Performance'}
                </Badge>
              </div>
            ) : (
              <div className="mb-6">
                <div className="text-xl font-semibold text-gray-700">Interview completed.</div>
                <div className="text-sm text-gray-500">No simulated score shown.</div>
              </div>
            )}

            {/* Removed Security Report section as per outline */}

            <p className="text-gray-600 mb-4">Duration: {formatDuration(duration)}</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => window.location.href = createPageUrl("CandidateDashboard")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Interview Room</h1>
          <p className="text-gray-600">
            {interviewStarted ? 'Secure interview session in progress' : 'Preparing for your interview session'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {interviewStarted && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
              <Radio className="w-5 h-5 text-red-600 animate-pulse" />
              <span className="font-semibold text-red-600">
                LIVE • {formatDuration(duration)}
              </span>
            </div>
          )}
          <Badge variant={interviewStarted ? "default" : "secondary"} className="px-4 py-2">
            {interviewStarted ? "Interview Active" : "Waiting to Start"}
          </Badge>
        </div>
      </div>

      {/* Simplified Proctoring Alert */}
      <Alert className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <Shield className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 animate-pulse" />
            <span className="font-medium">{proctoringMessage.text}</span>
          </div>
          {/* Removed dynamic badge and detailed message content */}
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Enhanced Video Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Video className="w-6 h-6 text-blue-600" />
                Live Interview Session
                {/* Removed proctorStats.faceCount badge */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  {/* Main video area showing HR */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden h-96 relative shadow-2xl flex items-center justify-center text-white">
                    <Users className="w-24 h-24 text-gray-600" />
                    <p className="absolute bottom-4">HR Manager's Video</p>
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span>Connected</span>
                    </div>
                  </div>

                  {/* Candidate's own video feed with overlay */}
                  <div className="absolute top-4 right-4 w-40 h-28 bg-gray-800 rounded-xl border-2 border-blue-500 shadow-lg overflow-hidden">
                    {isVideoOn ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay canvas */}
                        <canvas
                          ref={canvasRef}
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs">
                        Camera Off
                      </div>
                    )}
                  </div>

                  {/* Removed AI Overlay Indicators */}

                  {/* Recording indicator */}
                  {isRecording && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm shadow-lg">
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span className="font-medium">REC • {formatDuration(duration)}</span>
                    </div>
                  )}
                  {/* Removed Connection status */}
                </div>

                {/* Enhanced Video Controls */}
                <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <Button
                    variant={isVideoOn ? "default" : "destructive"}
                    size="lg"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className="gap-2 min-w-[140px]"
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    {isVideoOn ? 'Camera On' : 'Camera Off'}
                  </Button>

                  <Button
                    variant={isAudioOn ? "default" : "destructive"}
                    size="lg"
                    onClick={() => setIsAudioOn(!isAudioOn)}
                    className="gap-2 min-w-[140px]"
                  >
                    {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    {isAudioOn ? 'Mic On' : 'Mic Off'}
                  </Button>

                  {!interviewStarted ? (
                    <Button
                      size="lg"
                      onClick={startInterview}
                      className="bg-green-600 hover:bg-green-700 gap-2 min-w-[160px] shadow-lg"
                    >
                      <Play className="w-5 h-5" />
                      Start Interview
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={endInterview}
                      variant="destructive"
                      className="gap-2 min-w-[160px] shadow-lg"
                    >
                      <Phone className="w-5 h-5" />
                      End Interview
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Section */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Secure Interview Chat
                {interviewStarted && (
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                    Encrypted
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-48 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-xl border">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      {interviewStarted ? 'Secure chat messages will appear here...' : 'Chat will be available during the interview'}
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'candidate' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-xl text-sm shadow-sm ${
                            msg.sender === 'candidate'
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 opacity-70`}>{msg.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={!interviewStarted}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !interviewStarted}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Transcript and LLM evaluation */}
                <div className="space-y-3 pt-4 border-t">
                  <label className="text-sm font-medium text-gray-700">Answer Transcript</label>
                  <Textarea
                    placeholder="Paste or type the candidate's transcribed answer here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={5}
                    disabled={!interviewStarted}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={async () => {
                        setEvalError(null);
                        setEvaluation(null);
                        if (!transcript.trim()) return;
                        setEvalLoading(true);
                        try {
                          const resp = await fetch('/api/evaluate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              question: questions[currentQuestionIndex] || 'Interview Question',
                              transcript,
                              rubric: 'Consider correctness, clarity, completeness, depth, and examples.'
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
                      disabled={!interviewStarted || !transcript.trim() || evalLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {evalLoading ? 'Evaluating…' : 'Evaluate with OpenAI'}
                    </Button>
                  </div>

                  {evalError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Removed Real-time AI Analysis card */}
          {/* Removed Security Violations card */}

          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <p><strong>Position:</strong> Senior Software Engineer</p>
                <p><strong>Interviewer:</strong> Sarah Chen (HR Manager)</p>
                <p><strong>Stage:</strong> Final Interview</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="w-5 h-5" />
                Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-700">
                <p>• Speak clearly and concisely.</p>
                <p>• Maintain eye contact with the camera.</p>
                <p>• Use the STAR method for behavioral questions.</p>
                <p>• Have questions prepared for the interviewer.</p>
            </CardContent>
          </Card>

          {/* Removed Recent Alerts card */}
        </div>
      </div>
    </div>
  );
}