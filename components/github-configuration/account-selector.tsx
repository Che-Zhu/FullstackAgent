'use client';

import { Github, ChevronDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { GitHubAccount } from './types';

interface AccountSelectorProps {
  accounts: GitHubAccount[];
  selectedAccount: string;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onSelectAccount: (account: string) => void;
}

export function AccountSelector({
  accounts,
  selectedAccount,
  showDropdown,
  onToggleDropdown,
  onSelectAccount,
}: AccountSelectorProps) {
  return (
    <div className="border-b border-border p-4 relative">
      <button
        onClick={onToggleDropdown}
        className="flex items-center justify-between w-full text-left hover:bg-secondary/50 rounded-sm px-3 py-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Github className="h-5 w-5" />
          <span className="font-medium">{selectedAccount || 'All Repositories'}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-card border border-border rounded-sm shadow-lg z-10">
          <button
            onClick={() => {
              onSelectAccount('all');
              onToggleDropdown();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left border-b border-border"
          >
            <Github className="h-5 w-5" />
            <span className="font-medium">All Repositories</span>
          </button>
          {accounts.map((account) => (
            <button
              key={account.login}
              onClick={() => {
                onSelectAccount(account.login);
                onToggleDropdown();
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
  );
}
