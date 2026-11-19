'use client';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

export default function HumanInputFormPage() {
  const params = useParams();
  const token = params?.token as string;
  const [responseVal, setResponseVal] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Response submitted to workflow successfully');
  };

  return (
    <div className='w-full max-w-md p-4'>
      <Card className='shadow-lg border-border'>
        <CardHeader>
          <CardTitle>Human Input Required</CardTitle>
          <CardDescription>
            The executing workflow is paused waiting for your review or feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className='text-center py-6 space-y-2'>
              <div className='text-3xl'>✅</div>
              <p className='font-semibold text-foreground'>Thank you!</p>
              <p className='text-xs text-muted-foreground'>Your input has been submitted to the workflow.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-xs font-medium text-foreground'>Your Feedback / Input</label>
                <Input
                  placeholder='Enter input here...'
                  value={responseVal}
                  onChange={(e) => setResponseVal(e.target.value)}
                  required
                />
              </div>
              <div className='text-xs text-muted-foreground'>Session Token: {token}</div>
              <Button type='submit' className='w-full'>
                Submit Response
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
