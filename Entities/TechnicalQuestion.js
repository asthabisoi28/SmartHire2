/**
 * TechnicalQuestion Entity Class
 * Manages technical question data and operations
 */
export class TechnicalQuestion {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.difficulty = data.difficulty || 'medium';
    this.category = data.category || 'coding';
    this.sample_input = data.sample_input || '';
    this.sample_output = data.sample_output || '';
    this.starter_code = data.starter_code || '';
    this.time_limit = data.time_limit || 30;
    this.test_cases = data.test_cases || [];
    this.solution = data.solution || '';
    this.hints = data.hints || [];
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Static methods for API operations
  static async create(questionData) {
    try {
      const response = await fetch('/api/technical-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create technical question');
      }
      
      const data = await response.json();
      return new TechnicalQuestion(data);
    } catch (error) {
      console.error('Error creating technical question:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const response = await fetch(`/api/technical-questions/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch technical question');
      }
      
      const data = await response.json();
      return new TechnicalQuestion(data);
    } catch (error) {
      console.error('Error fetching technical question:', error);
      throw error;
    }
  }

  static async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/technical-questions?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch technical questions');
      }
      
      const data = await response.json();
      return data.map(item => new TechnicalQuestion(item));
    } catch (error) {
      console.error('Error fetching technical questions:', error);
      throw error;
    }
  }

  static async getByDifficulty(difficulty) {
    try {
      const response = await fetch(`/api/technical-questions?difficulty=${difficulty}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions by difficulty');
      }
      
      const data = await response.json();
      return data.map(item => new TechnicalQuestion(item));
    } catch (error) {
      console.error('Error fetching questions by difficulty:', error);
      throw error;
    }
  }

  static async getByCategory(category) {
    try {
      const response = await fetch(`/api/technical-questions?category=${category}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions by category');
      }
      
      const data = await response.json();
      return data.map(item => new TechnicalQuestion(item));
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      throw error;
    }
  }

  static async getRandomQuestion(filters = {}) {
    try {
      const queryParams = new URLSearchParams({ ...filters, random: true });
      const response = await fetch(`/api/technical-questions/random?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch random question');
      }
      
      const data = await response.json();
      return new TechnicalQuestion(data);
    } catch (error) {
      console.error('Error fetching random question:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      const method = this.id ? 'PUT' : 'POST';
      const url = this.id ? `/api/technical-questions/${this.id}` : '/api/technical-questions';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.toJSON()),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save technical question');
      }
      
      const data = await response.json();
      Object.assign(this, data);
      return this;
    } catch (error) {
      console.error('Error saving technical question:', error);
      throw error;
    }
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error('Cannot delete question without ID');
      }
      
      const response = await fetch(`/api/technical-questions/${this.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete technical question');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting technical question:', error);
      throw error;
    }
  }

  async submitAnswer(candidateId, answer, timeSpent) {
    try {
      const response = await fetch(`/api/technical-questions/${this.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_id: candidateId,
          answer,
          time_spent: timeSpent,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  // Utility methods
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      difficulty: this.difficulty,
      category: this.category,
      sample_input: this.sample_input,
      sample_output: this.sample_output,
      starter_code: this.starter_code,
      time_limit: this.time_limit,
      test_cases: this.test_cases,
      solution: this.solution,
      hints: this.hints,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  isValid() {
    return this.title && this.description;
  }

  getDifficultyColor() {
    const difficultyColors = {
      easy: 'green',
      medium: 'yellow',
      hard: 'red',
    };
    return difficultyColors[this.difficulty] || 'gray';
  }

  getCategoryIcon() {
    const categoryIcons = {
      algorithms: '🧮',
      data_structures: '🏗️',
      system_design: '🏛️',
      coding: '💻',
    };
    return categoryIcons[this.category] || '📝';
  }

  getFormattedTimeLimit() {
    if (this.time_limit < 60) {
      return `${this.time_limit} minutes`;
    }
    const hours = Math.floor(this.time_limit / 60);
    const minutes = this.time_limit % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  addTestCase(input, expectedOutput, isHidden = false) {
    this.test_cases.push({
      input,
      expected_output: expectedOutput,
      is_hidden: isHidden,
    });
    this.updated_at = new Date().toISOString();
  }

  addHint(hint) {
    this.hints.push(hint);
    this.updated_at = new Date().toISOString();
  }

  getPublicTestCases() {
    return this.test_cases.filter(testCase => !testCase.is_hidden);
  }

  getAllTestCases() {
    return this.test_cases;
  }

  static getDifficultyOptions() {
    return ['easy', 'medium', 'hard'];
  }

  static getCategoryOptions() {
    return ['algorithms', 'data_structures', 'system_design', 'coding'];
  }
}

export default TechnicalQuestion;