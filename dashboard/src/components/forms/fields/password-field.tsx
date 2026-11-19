'use client';

import * as React from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { PasswordInput } from '@/components/password-input';
import { Spinner } from '@/components/ui/spinner';
import { useFieldContext, useFieldInvalid, type BaseFieldProps } from '@/lib/form-context';

export function PasswordField({
  label,
  description,
  required,
  ...inputProps
}: BaseFieldProps & Omit<React.ComponentProps<typeof PasswordInput>, 'value' | 'onChange' | 'onBlur'>) {
  const field = useFieldContext<string | undefined>();
  const isInvalid = useFieldInvalid();
  const isValidating = field.state.meta.isValidating;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label}
        {required && ' *'}
      </FieldLabel>
      <div className='relative'>
        <PasswordInput
          id={field.name}
          name={field.name}
          value={field.state.value ?? ''}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${field.name}-error` : undefined}
          {...inputProps}
        />
        {isValidating && <Spinner className='absolute top-1/2 right-10 h-4 w-4 -translate-y-1/2' />}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />}
    </Field>
  );
}
