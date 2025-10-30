'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Database,
  Key,
  Shield,
  CreditCard,
  Github,
  Package,
  Terminal,
  Settings,
} from 'lucide-react';
import { Project, Sandbox, Environment } from '@prisma/client';

interface ProjectSecondarySidebarProps {
  project: Project;
  sandboxes: Sandbox[];
  envVars: Environment[];
}

export default function ProjectSecondarySidebar({
  project,
  sandboxes,
  envVars,
}: ProjectSecondarySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleSectionClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    router.push(href);
  };

  const topSections = [
    {
      id: 'terminal',
      label: 'Web Terminal',
      icon: Terminal,
      href: `/projects/${project.id}/terminal`,
    },
    { id: 'database', label: 'Database', icon: Database, href: `/projects/${project.id}/database` },
  ];

  const configSections = [
    {
      id: 'environment',
      label: 'Environment Variables',
      icon: Package,
      href: `/projects/${project.id}/environment`,
    },
    {
      id: 'secrets',
      label: 'Secret Configuration',
      icon: Key,
      href: `/projects/${project.id}/secrets`,
    },
    { id: 'auth', label: 'Auth Configuration', icon: Shield, href: `/projects/${project.id}/auth` },
    {
      id: 'payment',
      label: 'Payment Configuration',
      icon: CreditCard,
      href: `/projects/${project.id}/payment`,
    },
  ];

  const bottomSections = [
    {
      id: 'github',
      label: 'GitHub Repository',
      icon: Github,
      href: `/projects/${project.id}/github`,
    },
  ];

  // Check if any config section is active
  const isConfigActive = configSections.some((section) => pathname === section.href);

  return (
    <div
      className={cn(
        'bg-card border-r border-border flex flex-col transition-all duration-200 w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Link
          href="/projects"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-medium text-foreground">
            Project {project.name}
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 p-2 overflow-y-auto space-y-1">
        {/* Top sections */}
        {topSections.map((section) => {
          const Icon = section.icon;
          const isActive = pathname === section.href;

          return (
            <a
              key={section.id}
              href={section.href}
              onClick={(e) => handleSectionClick(e, section.href)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-sm transition-colors'
              )}
            >
              <Icon className="h-4 w-4 mr-2" />
              <span>{section.label}</span>
            </a>
          );
        })}

        {/* Configuration Group */}
        <div className="space-y-1">
          <button
            onClick={() => setIsConfigExpanded(!isConfigExpanded)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-sm transition-colors'
            )}
          >
            <ChevronDown
              className={cn('h-4 w-4 transition-transform duration-200', !isConfigExpanded && '-rotate-90')}
            />
            <Settings className="h-4 w-4 mr-2" />
            <span>Configuration</span>
          </button>

          <div
            className={cn(
              'overflow-hidden transition-all duration-200 ease-in-out',
              isConfigExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="space-y-1">
              {configSections.map((section) => {
                const Icon = section.icon;
                const isActive = pathname === section.href;

                return (
                  <a
                    key={section.id}
                    href={section.href}
                    onClick={(e) => handleSectionClick(e, section.href)}
                    className={cn(
                      'flex items-center pl-9 gap-2 pr-3 py-2 text-sm text-foreground hover:bg-secondary rounded-sm transition-colors'
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span>{section.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom sections */}
        {bottomSections.map((section) => {
          const Icon = section.icon;
          const isActive = pathname === section.href;

          return (
            <a
              key={section.id}
              href={section.href}
              onClick={(e) => handleSectionClick(e, section.href)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-sm transition-colors'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{section.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
