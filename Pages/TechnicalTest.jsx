import React, { useState, useEffect, useRef } from "react";
import { User } from "@/entities/User";
import { Interview } from "@/entities/Interview";
import { TechnicalQuestion } from "@/entities/TechnicalQuestion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Editor from "@monaco-editor/react";
import { setupMonacoWorkers } from "@/utils/monacoSetup";
import { loadPyodideOnce } from "@/utils/pyodideLoader";
import { Progress } from "@/components/ui/progress";
import { 
  Code, 
  Clock, 
  AlertTriangle, 
  Play, 
  Save, 
  Send,
  Monitor,
  Eye,
  Timer,
  CheckCircle
} from "lucide-react";
import { createPageUrl } from "@/utils";

export default function TechnicalTest() {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python'); // 'python' | 'java' | 'c'
  const [codeByLang, setCodeByLang] = useState({ python: '', java: '', c: '' });
  const [submissions, setSubmissions] = useState([]); // per-question { code, language }
  const [pyodide, setPyodide] = useState(null);
  const [pyReady, setPyReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [answers, setAnswers] = useState([]);
  const intervalRef = useRef(null);

  // Language helpers and templates
  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'c':
        // Monaco doesn't have a separate 'c' mode; use cpp highlighting
        return 'cpp';
      default:
        return 'javascript';
    }
  };

  const getStarterTemplate = (question, lang) => {
    const title = question?.title || 'Function';
    const desc = question?.description || '';
    const banner = `/* ${title} */\n/* ${desc.split('\n')[0]} */\n`;

    switch (lang) {
      case 'python':
        return (
`${banner}
# Write your solution in Python

def solve(input_data):
    # TODO: implement
    pass

if __name__ == "__main__":
    # You can test locally here
    sample = ${JSON.stringify(question?.sample_input || '')}
    print(solve(sample))
`
        );
      case 'java':
        return (
`${banner}
// Write your solution in Java
import java.io.*;
import java.util.*;

public class Solution {
    public static Object solve(String input) {
        // TODO: implement
        return null;
    }
    public static void main(String[] args) {
        String sample = ${JSON.stringify(question?.sample_input || '')};
        System.out.println(solve(sample));
    }
}
`
        );
      case 'c':
        return (
`${banner}
// Write your solution in C
#include <stdio.h>

// TODO: add your functions here

int main() {
    // You can test locally here
    const char* sample = ${JSON.stringify(question?.sample_input || '')};
    printf("%s\n", sample);
    return 0;
}
`
        );
      default:
        return question?.starter_code || '';
    }
  };

  useEffect(() => {
    setupMonacoWorkers();
    // Load Pyodide for Python execution
    loadPyodideOnce()
      .then((py) => { setPyodide(py); setPyReady(true); })
      .catch((e) => { console.error('Pyodide load failed', e); setPyReady(false); });
    loadData();
    setupTabMonitoring();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      removeTabMonitoring();
    };
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleTimeUp();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const questionData = await TechnicalQuestion.list();
      // Take first 3 and override the 2nd as Palindrome Check
      const customized = questionData.slice(0, 3);
      if (customized.length > 1) {
        customized[1] = {
          ...customized[1],
          title: 'Valid Palindrome',
          description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.',
          difficulty: customized[1]?.difficulty || 'medium',
          sample_input: 'A man, a plan, a canal: Panama',
          sample_output: 'true',
          test_cases: [
            { input: 'A man, a plan, a canal: Panama', expected_output: 'true' },
            { input: 'race a car', expected_output: 'false' },
            { input: ' ', expected_output: 'true' }
          ],
        };
      }
      setQuestions(customized);
      
      if (questionData.length > 0) {
        const q0 = questionData[0];
        const init = {
          python: getStarterTemplate(q0, 'python'),
          java: getStarterTemplate(q0, 'java'),
          c: getStarterTemplate(q0, 'c'),
        };
        setCodeByLang(init);
        setCode(init[selectedLanguage]);
        setTimeLeft(q0.time_limit * 60); // Convert to seconds
        setAnswers(new Array(3).fill(''));
        setSubmissions(new Array(Math.min(3, questionData.length)).fill(null));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const setupTabMonitoring = () => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        handleTabSwitch();
      }
    };

    const handleBlur = () => {
      if (isActive) {
        handleTabSwitch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  };

  const removeTabMonitoring = () => {
    document.removeEventListener('visibilitychange', () => {});
    window.removeEventListener('blur', () => {});
  };

  const handleTabSwitch = () => {
    const newWarnings = warnings + 1;
    setWarnings(newWarnings);
    
    if (newWarnings >= 2) {
      alert('Test terminated due to multiple tab switching violations.');
      handleTestTermination();
    } else {
      alert(`Warning ${newWarnings}/2: Tab switching detected. Test will be terminated after 2 warnings.`);
    }
  };

  const handleTestTermination = () => {
    setIsActive(false);
    setTestCompleted(true);
    setScore(0);
    saveResults(0);
  };

  const handleTimeUp = () => {
    setIsActive(false);
    setTestCompleted(true);
    calculateScore();
  };

  const startTest = () => {
    setIsActive(true);
  };

  const nextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = code;
    setAnswers(newAnswers);
    setSubmissions((prev) => {
      const copy = [...prev];
      copy[currentQuestion] = { code, language: selectedLanguage };
      return copy;
    });

    if (currentQuestion < questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      const nextQ = questions[nextIndex];
      setCodeByLang((prev) => ({
        ...prev,
        // keep existing buffers, only ensure template exists when empty
        [selectedLanguage]: prev[selectedLanguage] || getStarterTemplate(nextQ, selectedLanguage),
      }));
      setCode(getStarterTemplate(nextQ, selectedLanguage));
    } else {
      completeTest();
    }
  };

  const completeTest = async () => {
    setIsActive(false);
    setTestCompleted(true);
    await runExecutionBasedScoring();
  };

  // Execution-based scoring using JS in-browser for JS-like questions and stub for other langs
  const normalizeOutput = (val) => {
    try {
      // Direct boolean handling
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      // Objects/arrays: deterministic stringify
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val);
      }
      let s = typeof val === 'string' ? val : String(val);
      let trimmed = s.trim();
      // Normalize Python-style booleans to lowercase
      const lower = trimmed.toLowerCase();
      if (lower === 'true' || lower === 'false') return lower;
      // Try JSON parse on strings like "[1,2]", "{...}", numbers, booleans
      if (/^(\[|\{|\"|-?\d|true$|false$|null$)/i.test(trimmed)) {
        try {
          const parsed = JSON.parse(trimmed.toLowerCase() === 'nan' ? 'null' : trimmed);
          if (typeof parsed === 'boolean') return parsed ? 'true' : 'false';
          return JSON.stringify(parsed);
        } catch (_) {
          // fallthrough
        }
      }
      return trimmed;
    } catch (_) {
      return String(val).trim();
    }
  };

  const runExecutionBasedScoring = async () => {
    // Simulate scoring based on code length and basic checks
    const finalAnswers = [...answers];
    finalAnswers[currentQuestion] = code;
    
    // Gather test cases from question payloads
    let totalScore = 0;
    const perQuestionMax = Math.floor(100 / Math.max(1, questions.length));

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const submission = submissions[i] || { code: finalAnswers[i] || '', language: selectedLanguage };
      const codeText = submission?.code || '';

      const tests = Array.isArray(q.test_cases) && q.test_cases.length > 0 ? q.test_cases : [];
      if (tests.length === 0 || !codeText.trim()) continue;

      if (submission.language === 'python') {
        if (!pyReady || !pyodide) { console.warn('Pyodide not ready'); continue; }
        const results = [];
        try {
          // Load candidate code into Pyodide namespace
          await pyodide.runPythonAsync(codeText);
          // Ensure helpers are available
          await pyodide.runPythonAsync('import json, ast');
          // Verify solve is defined
          const hasSolve = await pyodide.runPythonAsync('"solve" in globals()');
          if (!hasSolve) { console.warn('No solve(input_data) in Python code'); }
          for (const t of tests) {
            try {
              const _in = String(t.input);
              const pySnippet = `\nimport json, ast\n_in = ${JSON.stringify(String(t.input))}\ntry:\n    __out = solve(_in)\nexcept Exception:\n    try:\n        __out = solve(json.loads(_in))\n    except Exception:\n        try:\n            if '|' in _in:\n                _arr_s, _tgt_s = _in.split('|', 1)\n                try:\n                    _arr = json.loads(_arr_s)\n                except Exception:\n                    _arr = ast.literal_eval(_arr_s)\n                try:\n                    _tgt = int(_tgt_s)\n                except Exception:\n                    try:\n                        _tgt = float(_tgt_s)\n                    except Exception:\n                        _tgt = _tgt_s\n                __out = solve(_arr, _tgt)\n            else:\n                raise Exception('unhandled input format')\n        except Exception as e3:\n            __out = '__ERROR__'\nstr(__out)\n`;
              const out = await pyodide.runPythonAsync(pySnippet);
              const ok = normalizeOutput(out) === normalizeOutput(t.expected_output);
              results.push(ok);
            } catch (e) {
              results.push(false);
            }
          }
        } catch (e) {
          console.error('Python execution error:', e);
          continue;
        }
        const passedCount = results.filter(Boolean).length;
        const qScore = Math.round((passedCount / Math.max(1, tests.length)) * perQuestionMax);
        totalScore += qScore;
        continue;
      }

      if (submission.language === 'java' || submission.language === 'c') {
        console.warn('Execution for language not yet supported:', submission.language);
        continue;
      }

      // JavaScript execution sandbox using a Function wrapper
      // Expect candidate to implement a solve(input) API returning a value comparable to expected_output
      const results = [];
      try {
        // Build a sandboxed function scope
        const wrapped = `"use strict";\n${codeText}\n;return (typeof solve === 'function') ? solve : null;`;
        const getSolve = new Function(wrapped);
        const solveFn = getSolve();
        if (typeof solveFn !== 'function') {
          console.warn('No solve(input) function found for question', q.id);
          continue;
        }
        for (const t of tests) {
          let out;
          try {
            // Pass raw input; author should parse if needed
            out = await Promise.resolve(solveFn(t.input));
          } catch (e) {
            results.push(false);
            continue;
          }
          const ok = normalizeOutput(out) === normalizeOutput(t.expected_output);
          results.push(ok);
        }
      } catch (e) {
        console.error('Execution error:', e);
        continue;
      }

      const passedCount = results.filter(Boolean).length;
      const qScore = Math.round((passedCount / Math.max(1, tests.length)) * perQuestionMax);
      totalScore += qScore;
    }

    const finalScore = Math.max(0, Math.min(100, totalScore));
    setScore(finalScore);
    saveResults(finalScore);
  };

  const saveResults = async () => {
    try {
      const userData = await User.me();
      await Interview.create({
        candidate_id: userData.id,
        job_title: "Technical Assessment",
        stage: "technical",
        status: "completed",
        technical_score: score,
        technical_warnings: warnings
      });
    } catch (error) {
      console.error("Error saving results:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (testCompleted) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-blue-50">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Completed!</h1>
            <div className="mb-6">
              <div className={`text-4xl font-bold mb-2 ${score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {score}/100
              </div>
              <div className="space-y-2">
                <Badge 
                  className={score >= 70 ? 'bg-green-100 text-green-800' : score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                >
                  {score >= 70 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Improvement'}
                </Badge>
                <div>
                  <Badge className='bg-blue-100 text-blue-800'>
                    Technical test completed
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-8">
              Your technical assessment has been submitted and scored.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = createPageUrl("CandidateDashboard")}
                variant="outline"
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => window.location.href = createPageUrl("InterviewRoom")}
                className="bg-green-600 hover:bg-green-700"
              >
                🎉 Proceed to Interview Round
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = createPageUrl("TechnicalTest")}
              >
                🔁 Retake Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Technical Assessment</h1>
            <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Timer className="w-5 h-5 text-blue-600" />
              <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-600">
                Warnings: {warnings}/2
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(((currentQuestion) / questions.length) * 100)}%</span>
          </div>
          <Progress value={(currentQuestion / questions.length) * 100} className="h-2" />
        </div>
      </div>

      {/* Warning Alert */}
      {warnings > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {warnings === 1 
              ? "Warning: Tab switching detected. One more violation will terminate the test."
              : "Multiple violations detected. Test has been terminated."
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Proctoring Indicator */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Monitor className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="font-medium">AI Proctoring Active</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <p className="text-sm mt-1">
            Your activity is being monitored. Do not switch tabs or leave the browser window.
          </p>
        </AlertDescription>
      </Alert>

      {!isActive ? (
        <Card className="shadow-xl border-0">
          <CardContent className="p-12 text-center">
            <Code className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start?</h2>
            <p className="text-gray-600 mb-6">
              You have {questions[0]?.time_limit || 30} minutes to complete {questions.length} coding challenges.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Rules:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Do not switch tabs or leave the browser</li>
                <li>• Maximum 2 warnings before test termination</li>
                <li>• AI monitoring is active throughout the test</li>
                <li>• Submit your best solution for each problem</li>
              </ul>
            </div>
            <Button 
              onClick={startTest}
              size="lg"
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <Play className="w-5 h-5" />
              Start Test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Question Panel */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                {questions[currentQuestion]?.title}
              </CardTitle>
              <Badge className={
                questions[currentQuestion]?.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                questions[currentQuestion]?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {questions[currentQuestion]?.difficulty}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Problem Description</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {questions[currentQuestion]?.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Sample Input</h4>
                  <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                    {questions[currentQuestion]?.sample_input}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Expected Output</h4>
                  <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                    {questions[currentQuestion]?.sample_output}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-600" />
                  Code Editor
                </span>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setCodeByLang((prev) => ({ ...prev, [selectedLanguage]: code }));
                      setSelectedLanguage(newLang);
                      setCode((prev) => codeByLang[newLang] || getStarterTemplate(questions[currentQuestion], newLang));
                    }}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="c">C</option>
                  </select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const tpl = getStarterTemplate(questions[currentQuestion], selectedLanguage);
                      setCodeByLang((prev) => ({ ...prev, [selectedLanguage]: tpl }));
                      setCode(tpl);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Editor
                  height="320px"
                  language={getMonacoLanguage(selectedLanguage)}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => {
                    const v = value || '';
                    setCode(v);
                    setCodeByLang((prev) => ({ ...prev, [selectedLanguage]: v }));
                  }}
                  onMount={(editor, monaco) => {
                    // Ensure Tab inserts indentation rather than moving focus
                    try { monaco?.editor?.setTabFocusMode?.(false); } catch {}
                    // Strong indentation and Python enter rules
                    editor.updateOptions({
                      insertSpaces: true,
                      detectIndentation: false,
                      tabSize: 2,
                      autoIndent: 'full',
                    });
                    // Improve Python new line indentation after ':' (def, if, for, etc.)
                    try {
                      monaco.languages.setLanguageConfiguration('python', {
                        onEnterRules: [
                          {
                            beforeText: /^(\s*)(def|class|if|elif|else|for|while|try|except|finally|with)\b.*:\s*$/,
                            action: { indentAction: monaco.languages.IndentAction.Indent }
                          }
                        ],
                        // Keep default brackets/quotes auto-closing behavior strong
                        autoClosingPairs: [
                          { open: '"', close: '"' },
                          { open: "'", close: "'" },
                          { open: '(', close: ')' },
                          { open: '[', close: ']' },
                          { open: '{', close: '}' },
                        ],
                      });
                    } catch {}
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    // Keep Tab for indentation
                    tabCompletion: 'off',
                  }}
                />
                
               <div className="flex flex-col gap-3">
                 <div className="flex gap-3">
                   <Button 
                     variant="outline" 
                     className="flex-1 gap-2"
                     onClick={() => {
                       // Simulate code execution
                       alert('Code execution simulated - check console for output');
                       console.log('Executing code:', code);
                     }}
                   >
                     <Play className="w-4 h-4" />
                     Run Code
                   </Button>
                   <Button 
                     onClick={currentQuestion < questions.length - 1 ? nextQuestion : completeTest}
                     className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                   >
                     <Send className="w-4 h-4" />
                     {currentQuestion < questions.length - 1 ? 'Next Question' : 'Submit Test'}
                   </Button>
                 </div>

               </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}