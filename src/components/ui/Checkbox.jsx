import React from 'react';
import { cn } from '../../utils/cn';

const Checkbox = React.forwardRef(({
  className,
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  error,
  required = false,
  id,
  name,
  value,
  ...props
}, ref) => {
  
  const checkboxId = id || `checkbox-${Math.random()?.toString(36)?.substr(2, 9)}`;

  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e);
    }
  };

  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "h-4 w-4 rounded border border-input bg-background text-primary",
            "focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-150",
            error && "border-destructive focus:ring-destructive"
          )}
          {...props}
        />
      </div>
      
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                "text-sm font-medium leading-none cursor-pointer",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                error ? "text-destructive" : "text-foreground"
              )}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
          
          {description && !error && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
          
          {error && (
            <p className="text-sm text-destructive mt-1">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;