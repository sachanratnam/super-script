
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          // Adjusted styles for Material Design feel
          'flex min-h-[110px] w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground', // Increased padding, rounded-lg, min-h-110px
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-primary', // Use focus:border-primary
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-200 ease-in-out', // Smooth transition
           'md:text-sm', // Keep responsive text size
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
