import { Badge } from '@/components/ui/badge';
import type { AppMode } from '@/services/apps/types';

interface AppModeBadgeProps {
  mode: AppMode;
  className?: string;
}

const modeConfig: Record<AppMode, { label: string; className: string }> = {
  chat: {
    label: 'Chatbot',
    className: 'bg-primary/10 text-primary border-primary/20'
  },
  'agent-chat': {
    label: 'Agent',
    className: 'bg-accent text-accent-foreground border-border'
  },
  completion: {
    label: 'Text Generator',
    className: 'bg-secondary text-secondary-foreground border-border'
  },
  workflow: {
    label: 'Workflow',
    className: 'bg-muted text-foreground border-border'
  },
  'advanced-chat': {
    label: 'Chatflow',
    className: 'bg-primary/20 text-primary border-primary/30'
  }
};

export function AppModeBadge({ mode, className }: AppModeBadgeProps) {
  const config = modeConfig[mode] || {
    label: mode,
    className: 'bg-muted text-muted-foreground'
  };

  return (
    <Badge variant='outline' className={`font-medium capitalize text-xs ${config.className} ${className || ''}`}>
      {config.label}
    </Badge>
  );
}
