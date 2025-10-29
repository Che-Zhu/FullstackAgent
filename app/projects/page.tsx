import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Folder, ExternalLink, Circle, Clock, GitBranch, FolderGit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function ProjectsPage() {
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect('/login');
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const projects = user
    ? await prisma.project.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Projects</h1>
            <p className="text-sm text-muted-foreground">Manage your AI-powered applications</p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </header>

      {/* Projects Grid */}
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"></div>

        {projects.length === 0 ? (
          <Card className="bg-[#252526] border-[#3e3e42]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="h-12 w-12 text-gray-500 mb-3" />
              <h2 className="text-lg font-medium text-white mb-1">No projects yet</h2>
              <p className="text-sm text-gray-400 mb-5">Create your first AI-powered application</p>
              <Link href="/projects/new">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                <div className="bg-card border border-border rounded-sm p-4 transition-all hover:border-primary/50 hover:bg-secondary/50 h-full">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FolderGit2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <h3 className="font-mono text-sm font-medium text-foreground truncate">
                        {project.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <StatusIndicator status={project.status} />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-3">
                    {project.description ? project.description : 'No description yet'}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(project.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const { color, pulseColor, label } = getStatusInfo(status);

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <Circle className={cn('h-2 w-2', color)} fill="currentColor" />
        {(status === 'INITIALIZING' || status === 'DEPLOYING') && (
          <Circle
            className={cn('h-2 w-2 absolute top-0 left-0 animate-ping', pulseColor)}
            fill="currentColor"
          />
        )}
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'READY':
    case 'DEPLOYED':
      return {
        color: 'text-chart-2',
        pulseColor: '',
        label: 'Ready',
      };
    case 'INITIALIZING':
      return {
        color: 'text-yellow-500',
        pulseColor: 'text-yellow-500 opacity-75',
        label: 'Initializing',
      };
    case 'DEPLOYING':
      return {
        color: 'text-yellow-500',
        pulseColor: 'text-yellow-500 opacity-75',
        label: 'Deploying',
      };
    case 'ERROR':
      return {
        color: 'text-red-500',
        pulseColor: '',
        label: 'Error',
      };
    default:
      return {
        color: 'text-gray-500',
        pulseColor: '',
        label: 'Stopped',
      };
  }
}
