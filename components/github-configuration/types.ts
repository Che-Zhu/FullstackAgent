import { Project } from '@prisma/client';

export interface GitHubAccount {
  login: string;
  type: 'User' | 'Organization';
  avatarUrl: string;
  name: string;
}

export interface GitHubRepository {
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

export interface GitHubConfigurationProps {
  project: Project;
}
