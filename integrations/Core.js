/**
 * Core Integration Functions
 * Handles file uploads and LLM interactions
 */

// Mock file upload function
export const UploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }

      setTimeout(() => {
        resolve({
          success: true,
          fileId: `file_${Date.now()}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          url: URL.createObjectURL(file)
        });
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
};


      // Mock interview question generation
      if (prompt.includes('interview') || prompt.includes('question')) {
        resolve({
          success: true,
          questions: [
            {
              id: 1,
              question: "Tell me about yourself and your background.",
              type: "behavioral",
              expectedDuration: 3
            },
            {
              id: 2,
              question: "What interests you about this role?",
              type: "motivational",
              expectedDuration: 2
            },
            {
              id: 3,
              question: "Describe a challenging project you worked on.",
              type: "behavioral",
              expectedDuration: 4
            }
          ]
        });
      }
      
        // Default response
        resolve({
          success: true,
          response: "This is a mock LLM response for: " + prompt,
          confidence: 0.85
        });
      }, 2000);
    } catch (error) {
      reject(error);
    }
  });
};

// Mock technical question generation
export const GenerateTechnicalQuestions = async (difficulty = 'medium', topic = 'general') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const questions = {
        easy: [
          {
            id: 1,
            title: "Two Sum",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            difficulty: "easy",
            topic: "arrays",
            timeLimit: 30,
            testCases: [
              { input: "[2,7,11,15], target = 9", output: "[0,1]" },
              { input: "[3,2,4], target = 6", output: "[1,2]" }
            ]
          }
        ],
        medium: [
          {
            id: 2,
            title: "Add Two Numbers",
            description: "You are given two non-empty linked lists representing two non-negative integers. Add the two numbers and return the sum as a linked list.",
            difficulty: "medium",
            topic: "linked-lists",
            timeLimit: 45,
            testCases: [
              { input: "[2,4,3] + [5,6,4]", output: "[7,0,8]" },
              { input: "[0] + [0]", output: "[0]" }
            ]
          }
        ],
        hard: [
          {
            id: 3,
            title: "Median of Two Sorted Arrays",
            description: "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.",
            difficulty: "hard",
            topic: "arrays",
            timeLimit: 60,
            testCases: [
              { input: "[1,3], [2]", output: "2.0" },
              { input: "[1,2], [3,4]", output: "2.5" }
            ]
          }
        ]
      };
      
      resolve({
        success: true,
        questions: questions[difficulty] || questions.medium
      });
    }, 1500);
  });
};