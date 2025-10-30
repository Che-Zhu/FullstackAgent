'use client';

import { Github, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Project } from '@prisma/client';
import { formatConnectionDate } from './utils';

interface ConnectedViewProps {
  project: Project;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}

export function ConnectedView({ project, onDisconnect, isDisconnecting }: ConnectedViewProps) {
  return (
    <div className="bg-card border border-border rounded-sm">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <Github className="h-6 w-6" />
            <AvatarFallback>GH</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <a
              href={`https://github.com/${project.githubRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:underline"
            >
              {project.githubRepo}
              <ExternalLink className="h-4 w-4" />
            </a>
            <div className="text-sm text-muted-foreground mt-1">
              Connected {formatConnectionDate(project.updatedAt.toString())}
            </div>
          </div>
          <Button
            variant="outline"
            size="default"
            className="text-foreground"
            onClick={onDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </div>
      </div>
    </div>
  );
}
