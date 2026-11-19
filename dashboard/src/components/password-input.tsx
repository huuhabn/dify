'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PasswordInputProps
  extends React.ComponentProps<'input'> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className='relative w-full'>
        <input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent pe-9 ps-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='absolute end-0 top-0 h-full px-2.5 py-1 hover:bg-transparent text-muted-foreground hover:text-foreground'
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <Icons.eyeOff className='size-4' aria-hidden='true' />
          ) : (
            <Icons.eye className='size-4' aria-hidden='true' />
          )}
          <span className='sr-only'>
            {showPassword ? 'Hide password' : 'Show password'}
          </span>
        </Button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
