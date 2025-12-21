/**
 * Interview Entity Class
 * Manages interview data and operations
 */
export class Interview {
  constructor(data = {}) {
    this.id = data.id || null;
    this.candidate_id = data.candidate_id || '';
    this.hr_id = data.hr_id || '';
    this.job_title = data.job_title || '';
    this.status = data.status || 'scheduled';
    this.stage = data.stage || 'ats';
    this.ats_score = data.ats_score || null;
    this.technical_score = data.technical_score || null;
    this.interview_score = data.interview_score || null;
    this.resume_url = data.resume_url || '';
    this.technical_warnings = data.technical_warnings || 0;
    this.interview_notes = data.interview_notes || '';
    this.scheduled_time = data.scheduled_time || null;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Static methods for API operations
  static async create(interviewData) {
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create interview');
      }
      
      const data = await response.json();
      return new Interview(data);
    } catch (error) {
      console.error('Error creating interview:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const response = await fetch(`/api/interviews/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch interview');
      }
      
      const data = await response.json();
      return new Interview(data);
    } catch (error) {
      console.error('Error fetching interview:', error);
      throw error;
    }
  }

  static async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/interviews?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch interviews');
      }
      
      const data = await response.json();
      return data.map(item => new Interview(item));
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error;
    }
  }

  static async getByCandidateId(candidateId) {
    try {
      const response = await fetch(`/api/interviews/candidate/${candidateId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch candidate interviews');
      }
      
      const data = await response.json();
      return data.map(item => new Interview(item));
    } catch (error) {
      console.error('Error fetching candidate interviews:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      const method = this.id ? 'PUT' : 'POST';
      const url = this.id ? `/api/interviews/${this.id}` : '/api/interviews';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.toJSON()),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save interview');
      }
      
      const data = await response.json();
      Object.assign(this, data);
      return this;
    } catch (error) {
      console.error('Error saving interview:', error);
      throw error;
    }
  }

  async updateStatus(newStatus) {
    this.status = newStatus;
    this.updated_at = new Date().toISOString();
    return await this.save();
  }

  async updateStage(newStage) {
    this.stage = newStage;
    this.updated_at = new Date().toISOString();
    return await this.save();
  }

  async updateScore(scoreType, score) {
    if (['ats_score', 'technical_score', 'interview_score'].includes(scoreType)) {
      this[scoreType] = score;
      this.updated_at = new Date().toISOString();
      return await this.save();
    }
    throw new Error('Invalid score type');
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error('Cannot delete interview without ID');
      }
      
      const response = await fetch(`/api/interviews/${this.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete interview');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting interview:', error);
      throw error;
    }
  }

  // Utility methods
  toJSON() {
    return {
      id: this.id,
      candidate_id: this.candidate_id,
      hr_id: this.hr_id,
      job_title: this.job_title,
      status: this.status,
      stage: this.stage,
      ats_score: this.ats_score,
      technical_score: this.technical_score,
      interview_score: this.interview_score,
      resume_url: this.resume_url,
      technical_warnings: this.technical_warnings,
      interview_notes: this.interview_notes,
      scheduled_time: this.scheduled_time,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  isValid() {
    return this.candidate_id && this.job_title;
  }

  getStatusColor() {
    const statusColors = {
      scheduled: 'blue',
      in_progress: 'yellow',
      completed: 'green',
      cancelled: 'red',
    };
    return statusColors[this.status] || 'gray';
  }

  getStageProgress() {
    const stages = ['ats', 'technical', 'interview', 'completed'];
    const currentIndex = stages.indexOf(this.stage);
    return ((currentIndex + 1) / stages.length) * 100;
  }

  canProceedToNextStage() {
    switch (this.stage) {
      case 'ats':
        return this.ats_score && this.ats_score >= 70;
      case 'technical':
        return this.technical_score && this.technical_score >= 60;
      case 'interview':
        return this.interview_score && this.interview_score >= 60;
      default:
        return false;
    }
  }
}

export default Interview;