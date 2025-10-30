import { Project, Sandbox, Environment } from "@prisma/client";
import ProjectSecondarySidebar from "@/components/project-secondary-sidebar";

interface ProjectPageLayoutProps {
  project: Project & {
    sandboxes: Sandbox[];
    environmentVariables: Environment[];
  };
  children: React.ReactNode;
}

/**
 * Shared layout component for all project pages
 * Provides consistent structure with sidebar and main content area
 *
 * This replaces the old layout.tsx approach to avoid data duplication
 * and allows data to be passed via props instead of Context
 */
export function ProjectPageLayout({
  project,
  children
}: ProjectPageLayoutProps) {
  return (
    <div className="h-screen flex bg-[#1e1e1e] text-white overflow-hidden">
      {/* Project Settings Sidebar */}
      <ProjectSecondarySidebar
        project={project}
        sandboxes={project.sandboxes}
        envVars={project.environmentVariables}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
