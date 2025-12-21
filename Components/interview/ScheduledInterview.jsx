import React, { useState } from "react";
import { Interview } from "@/entities/Interview";
import { User } from "@/entities/User";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User as UserIcon, Briefcase } from "lucide-react";

export default function ScheduleInterviewModal({ isOpen, onClose, onScheduled }) {
  const [formData, setFormData] = useState({
    candidate_email: "",
    job_title: "",
    scheduled_date: null,
    scheduled_time: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await User.me();
      
      // Combine date and time
      const scheduledDateTime = new Date(formData.scheduled_date);
      const [hours, minutes] = formData.scheduled_time.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      const interviewData = {
        candidate_id: formData.candidate_email, // Using email as ID for demo
        hr_id: user.id,
        job_title: formData.job_title,
        status: "scheduled",
        stage: "ats",
        scheduled_time: scheduledDateTime.toISOString(),
        interview_notes: formData.notes || `Interview scheduled for ${formData.job_title} position`
      };

      await Interview.create(interviewData);
      
      onScheduled && onScheduled();
      onClose();
      
      // Reset form
      setFormData({
        candidate_email: "",
        job_title: "",
        scheduled_date: null,
        scheduled_time: "",
        notes: ""
      });

    } catch (error) {
      setError("Failed to schedule interview. Please try again.");
      console.error("Error scheduling interview:", error);
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            Schedule New Interview
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="candidate_email" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Candidate Email
            </Label>
            <Input
              id="candidate_email"
              name="candidate_email"
              type="email"
              placeholder="candidate@example.com"
              value={formData.candidate_email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job Title
            </Label>
            <Input
              id="job_title"
              name="job_title"
              placeholder="Senior Software Engineer"
              value={formData.job_title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Interview Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduled_date ? format(formData.scheduled_date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.scheduled_date}
                    onSelect={(date) => setFormData({...formData, scheduled_date: date})}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </Label>
              <Input
                id="scheduled_time"
                name="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any specific requirements or notes for this interview..."
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.scheduled_date || !formData.scheduled_time}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <CalendarIcon className="w-4 h-4 mr-2" />
              )}
              Schedule Interview
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}