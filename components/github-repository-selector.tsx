"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, X, Loader2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Account {
  login: string;
  type: 'User' | 'Organization';
  avatarUrl?: string;
  name?: string | null;
}

interface Repository {
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  owner: {
    login: string;
    type: string;
  };
}

interface GitHubRepositorySelectorProps {
  projectId: string;
  currentRepo: string | null;
}

export function GitHubRepositorySelector({
  projectId,
  currentRepo,
}: GitHubRepositorySelectorProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(currentRepo);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const isConnected = !!selectedRepo;

  // Filter repositories by selected account
  const filteredRepositories = useMemo(() => {
    if (!selectedAccount) return repositories;
    return repositories.filter(
      (repo) => repo.owner.login === selectedAccount
    );
  }, [repositories, selectedAccount]);

  // Fetch repositories on component mount
  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/github/repositories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch repositories");
      }

      setAccounts(data.accounts || []);
      setRepositories(data.repositories || []);

      // Default to personal account (first in accounts array)
      if (data.accounts && data.accounts.length > 0) {
        setSelectedAccount(data.accounts[0].login);
      }
    } catch (err: any) {
      console.error("Error fetching repositories:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (repoFullName: string) => {
    try {
      setConnecting(true);

      const response = await fetch(`/api/projects/${projectId}/github`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoName: repoFullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect repository");
      }

      setSelectedRepo(data.githubRepo);
      toast.success("Repository connected successfully!");
    } catch (err: any) {
      console.error("Error connecting repository:", err);
      toast.error(err.message || "Failed to connect repository");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);

      const response = await fetch(`/api/projects/${projectId}/github`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disconnect repository");
      }

      setSelectedRepo(null);
      toast.success("Repository disconnected successfully!");
    } catch (err: any) {
      console.error("Error disconnecting repository:", err);
      toast.error(err.message || "Failed to disconnect repository");
    } finally {
      setDisconnecting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-400">
          Loading repositories...
        </span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-[#1e1e1e] rounded border border-red-400/30">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div>
          <p className="text-sm font-medium text-red-400">
            Unable to load repositories
          </p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // No repositories state
  if (repositories.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-[#1e1e1e] rounded border border-[#3e3e42]">
        <AlertCircle className="h-5 w-5 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-300">
            No repositories found
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Create a repository on GitHub to get started
          </p>
        </div>
      </div>
    );
  }

  // Connected state
  if (isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded border border-[#3e3e42]">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-gray-300">
                Connected to GitHub
              </p>
              <a
                href={`https://github.com/${selectedRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
              >
                {selectedRepo}
              </a>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="px-3 py-1.5 text-sm text-red-400 border border-red-400/30 rounded hover:bg-red-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {disconnecting && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  // Not connected state - show dropdowns
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded border border-[#3e3e42]">
        <div className="flex items-center gap-3">
          <X className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-300">Not connected</p>
            <p className="text-xs text-gray-400 mt-1">
              Connect a GitHub repository to enable version control
            </p>
          </div>
        </div>
      </div>

      {/* Account Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Account
        </label>
        <Select
          value={selectedAccount || undefined}
          onValueChange={setSelectedAccount}
        >
          <SelectTrigger className="w-full bg-[#1e1e1e] border-[#3e3e42] text-gray-300">
            <SelectValue placeholder="Select account..." />
          </SelectTrigger>
          <SelectContent className="bg-[#252526] border-[#3e3e42]">
            {accounts.map((account) => (
              <SelectItem
                key={account.login}
                value={account.login}
                className="text-gray-300 focus:bg-[#1e1e1e] focus:text-gray-200"
              >
                <div className="flex items-center gap-2">
                  <span>{account.login}</span>
                  {account.type === 'Organization' && (
                    <span className="text-xs text-gray-400">(Org)</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400">
          {accounts.length} account{accounts.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Repository Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Select Repository
        </label>
        <Select
          onValueChange={handleConnect}
          disabled={connecting || !selectedAccount}
        >
          <SelectTrigger className="w-full bg-[#1e1e1e] border-[#3e3e42] text-gray-300">
            <SelectValue placeholder="Choose a repository..." />
          </SelectTrigger>
          <SelectContent className="bg-[#252526] border-[#3e3e42]">
            {filteredRepositories.length > 0 ? (
              filteredRepositories.map((repo) => (
                <SelectItem
                  key={repo.fullName}
                  value={repo.fullName}
                  className="text-gray-300 focus:bg-[#1e1e1e] focus:text-gray-200"
                >
                  {repo.fullName}
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-xs text-gray-400">
                No repositories found in {selectedAccount}
              </div>
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400">
          {filteredRepositories.length} repositor{filteredRepositories.length !== 1 ? 'ies' : 'y'} in {selectedAccount || 'selected account'}
        </p>
      </div>

      {connecting && (
        <div className="flex items-center gap-2 p-3 bg-blue-400/10 border border-blue-400/30 rounded">
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          <span className="text-sm text-blue-400">Connecting repository...</span>
        </div>
      )}
    </div>
  );
}
