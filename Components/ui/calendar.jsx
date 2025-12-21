import React from "react";
import { cn } from "../../utils";

const Calendar = React.forwardRef(({ className, selected, onSelect, ...props }, ref) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  const handleDateClick = (day) => {
    if (day) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      onSelect?.(newDate);
    }
  };
  
  return (
    <div
      ref={ref}
      className={cn("p-3 bg-white border rounded-lg shadow-sm", className)}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <h3 className="font-medium">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="p-2 font-medium text-gray-500">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            className={cn(
              "p-2 hover:bg-gray-100 rounded",
              day && selected && selected.getDate() === day && 
              selected.getMonth() === currentDate.getMonth() && 
              selected.getFullYear() === currentDate.getFullYear()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "",
              !day ? "cursor-default" : ""
            )}
            disabled={!day}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
});
Calendar.displayName = "Calendar";

export { Calendar };