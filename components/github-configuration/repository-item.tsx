'use client';

import { Github, Lock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GitHubRepository } from './types';
import { formatRelativeTime } from './utils';

interface RepositoryItemProps {
  repository: GitHubRepository;
  onConnect: (repoFullName: string) => void;
  isConnecting: boolean;
}

export function RepositoryItem({ repository, onConnect, isConnecting }: RepositoryItemProps) {
  return (
    <div className="px-4 py-4 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-secondary">
              <Github className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">{repository.fullName}</span>
              {repository.private && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
              <span className="text-muted-foreground text-sm shrink-0">
                · {formatRelativeTime(repository.updatedAt)}
              </span>
            </div>
          </div>
        </div>
        <Button
          size="default"
          className="ml-4 shrink-0 bg-foreground text-background hover:bg-foreground/90"
          onClick={() => onConnect(repository.fullName)}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </Button>
      </div>
    </div>
  );
}
