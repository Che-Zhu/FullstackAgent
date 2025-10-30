'use client';

import { Search, Loader2 } from 'lucide-react';
import { GitHubRepository } from './types';
import { RepositoryItem } from './repository-item';

interface RepositoryListProps {
  repositories: GitHubRepository[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onConnect: (repoFullName: string) => void;
  connectingRepo: string | null;
  loading: boolean;
}

export function RepositoryList({
  repositories,
  searchQuery,
  onSearchChange,
  onConnect,
  connectingRepo,
  loading,
}: RepositoryListProps) {
  return (
    <>
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-transparent w-full px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Repository List */}
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        ) : repositories.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground">No repositories found</div>
        ) : (
          repositories.map((repo) => (
            <RepositoryItem
              key={repo.fullName}
              repository={repo}
              onConnect={onConnect}
              isConnecting={connectingRepo === repo.fullName}
            />
          ))
        )}
      </div>
    </>
  );
}
