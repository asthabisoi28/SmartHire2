import React from "react";
import { cn } from "../../utils";

const Popover = ({ children, open, onOpenChange }) => {
  return (
    <div className="relative inline-block">
      {children}
    </div>
  );
};

const PopoverTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("cursor-pointer", className)}
    {...props}
  >
    {children}
  </div>
));
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none bg-white top-full mt-1",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };