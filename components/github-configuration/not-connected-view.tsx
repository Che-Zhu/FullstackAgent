'use client';

import { GitHubAccount, GitHubRepository } from './types';
import { AccountSelector } from './account-selector';
import { RepositoryList } from './repository-list';

interface NotConnectedViewProps {
  repositories: GitHubRepository[];
  accounts: GitHubAccount[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedAccount: string;
  onSelectAccount: (account: string) => void;
  showAccountDropdown: boolean;
  onToggleAccountDropdown: () => void;
  onConnect: (repoFullName: string) => void;
  connectingRepo: string | null;
  loading: boolean;
}

export function NotConnectedView({
  repositories,
  accounts,
  searchQuery,
  onSearchChange,
  selectedAccount,
  onSelectAccount,
  showAccountDropdown,
  onToggleAccountDropdown,
  onConnect,
  connectingRepo,
  loading,
}: NotConnectedViewProps) {
  // Filter repositories
  const filteredRepositories = repositories.filter((repo) => {
    const matchesSearch =
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAccount = selectedAccount === 'all' || repo.owner.login === selectedAccount;
    return matchesSearch && matchesAccount;
  });

  return (
    <div className="bg-card border border-border rounded-sm">
      <AccountSelector
        accounts={accounts}
        selectedAccount={selectedAccount}
        showDropdown={showAccountDropdown}
        onToggleDropdown={onToggleAccountDropdown}
        onSelectAccount={onSelectAccount}
      />

      <RepositoryList
        repositories={filteredRepositories}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onConnect={onConnect}
        connectingRepo={connectingRepo}
        loading={loading}
      />
    </div>
  );
}
