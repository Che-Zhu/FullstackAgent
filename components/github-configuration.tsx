'use client';

import { useState, useEffect } from 'react';
import { Project } from '@prisma/client';
import {
  Github,
  GitBranch,
  ExternalLink,
  Search,
  Lock,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

interface GitHubAccount {
  login: string;
  type: 'User' | 'Organization';
  avatarUrl: string;
  name: string;
}

interface GitHubRepository {
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  updatedAt: string;
  pushedAt: string;
  owner: {
    login: string;
    type: string;
  };
}

interface GitHubConfigurationProps {
  project: Project;
}

// Utility function: Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than 7 days: show relative time
  if (diffInSeconds < 7 * 24 * 60 * 60) {
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  // Otherwise: show month and day
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

// Utility function: Format connection date
function formatConnectionDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

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
    fetchRepositories();
  }, []);

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
      <div className="p-6 max-w-5xl space-y-6">
        <GitHubConfigStatus
          status={isRepoConnected ? 'connected' : 'not-connected'}
          project={project}
          onDisconnect={handleDisconnect}
          connectingRepo={connectingRepo}
          repositories={repositories}
          accounts={accounts}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          showAccountDropdown={showAccountDropdown}
          setShowAccountDropdown={setShowAccountDropdown}
          onConnect={handleConnect}
        />
      </div>
    </div>
  );
}

const GitHubConfigStatus = ({
  status,
  project,
  onDisconnect,
  connectingRepo,
  repositories,
  accounts,
  loading,
  searchQuery,
  setSearchQuery,
  selectedAccount,
  setSelectedAccount,
  showAccountDropdown,
  setShowAccountDropdown,
  onConnect,
}: {
  status: 'connected' | 'not-connected' | 'error';
  project: Project;
  onDisconnect: () => void;
  connectingRepo: string | null;
  repositories?: GitHubRepository[];
  accounts?: GitHubAccount[];
  loading?: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedAccount?: string;
  setSelectedAccount?: (account: string) => void;
  showAccountDropdown?: boolean;
  setShowAccountDropdown?: (show: boolean) => void;
  onConnect?: (repoFullName: string) => void;
}) => {
  if (status === 'connected') {
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
              disabled={connectingRepo !== null}
            >
              {connectingRepo ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </div>
        </div>
      </div>
    );
  } else if (status === 'not-connected') {
    const filteredRepositories =
      repositories?.filter((repo) => {
        const matchesSearch =
          repo.fullName.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
          (repo.description &&
            repo.description.toLowerCase().includes(searchQuery?.toLowerCase() || ''));
        const matchesAccount = selectedAccount === 'all' || repo.owner.login === selectedAccount;
        return matchesSearch && matchesAccount;
      }) || [];

    return (
      <div className="bg-card border border-border rounded-sm">
        {/* Account Selector */}
        <div className="border-b border-border p-4 relative">
          <button
            onClick={() => setShowAccountDropdown?.(!showAccountDropdown)}
            className="flex items-center justify-between w-full text-left hover:bg-secondary/50 rounded-sm px-3 py-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5" />
              <span className="font-medium">{selectedAccount || 'All Repositories'}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Dropdown Menu */}
          {showAccountDropdown && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-card border border-border rounded-sm shadow-lg z-10">
              <button
                onClick={() => {
                  setSelectedAccount?.('all');
                  setShowAccountDropdown?.(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left border-b border-border"
              >
                <Github className="h-5 w-5" />
                <span className="font-medium">All Repositories</span>
              </button>
              {accounts?.map((account) => (
                <button
                  key={account.login}
                  onClick={() => {
                    setSelectedAccount?.(account.login);
                    setShowAccountDropdown?.(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={account.avatarUrl} alt={account.login} />
                    <AvatarFallback>{account.login[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{account.login}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
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
          ) : filteredRepositories.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              No repositories found
            </div>
          ) : (
            filteredRepositories.map((repo) => (
              <div
                key={repo.fullName}
                className="px-4 py-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-secondary">
                        <Github className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {repo.fullName}
                        </span>
                        {repo.private && (
                          <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-muted-foreground text-sm flex-shrink-0">
                          · {formatRelativeTime(repo.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="default"
                    className="ml-4 flex-shrink-0 bg-foreground text-background hover:bg-foreground/90"
                    onClick={() => onConnect?.(repo.fullName)}
                    disabled={connectingRepo === repo.fullName}
                  >
                    {connectingRepo === repo.fullName ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  } else if (status === 'error') {
    return (
      <div className="bg-card border border-border rounded-sm">
        <div className="p-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-sm p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-destructive mb-1">
                  Unable to load GitHub account
                </div>
                <div className="text-xs text-destructive/90 mb-3">
                  We could not connect to your GitHub account. Please try reconnecting.
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <Github className="h-4 w-4" />
                  Reconnect GitHub Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
