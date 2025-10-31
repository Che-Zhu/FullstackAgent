'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GitHubConfigurationProps, GitHubAccount, GitHubRepository } from './types';
import { ConnectedView } from './connected-view';
import { NotConnectedView } from './not-connected-view';
import { ErrorView } from './error-view';

export default function GitHubConfiguration({ project }: GitHubConfigurationProps) {
  const router = useRouter();
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [accounts, setAccounts] = useState<GitHubAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [connectingRepo, setConnectingRepo] = useState<string | null>(null);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const isRepoConnected = !!project.githubRepo;

  // Fetch repositories on mount
  useEffect(() => {
    if (!isRepoConnected) {
      fetchRepositories();
    }
  }, [isRepoConnected]);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/github/repositories');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch repositories');
      }

      const data = await response.json();
      setRepositories(data.repositories);
      setAccounts(data.accounts);
    } catch (error: any) {
      console.error('Error fetching repositories:', error);
      toast.error(error.message || 'Failed to fetch GitHub repositories');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (repoFullName: string) => {
    try {
      setConnectingRepo(repoFullName);
      const response = await fetch(`/api/projects/${project.id}/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoName: repoFullName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to connect repository');
      }

      toast.success('Repository connected successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Error connecting repository:', error);
      toast.error(error.message || 'Failed to connect repository');
    } finally {
      setConnectingRepo(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      setConnectingRepo(project.githubRepo || 'disconnect');
      const response = await fetch(`/api/projects/${project.id}/github`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disconnect repository');
      }

      toast.success('Repository disconnected successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Error disconnecting repository:', error);
      toast.error(error.message || 'Failed to disconnect repository');
    } finally {
      setConnectingRepo(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Connected Git Repository</h1>
          <p className="text-sm text-muted-foreground">
            Seamlessly create Deployments for any commits pushed to your Git repository.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {isRepoConnected ? (
          <ConnectedView
            project={project}
            onDisconnect={handleDisconnect}
            isDisconnecting={connectingRepo !== null}
          />
        ) : (
          <NotConnectedView
            repositories={repositories}
            accounts={accounts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedAccount={selectedAccount}
            onSelectAccount={setSelectedAccount}
            showAccountDropdown={showAccountDropdown}
            onToggleAccountDropdown={() => setShowAccountDropdown(!showAccountDropdown)}
            onConnect={handleConnect}
            connectingRepo={connectingRepo}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
