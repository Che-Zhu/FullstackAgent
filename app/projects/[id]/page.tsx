import { getProjectData } from "@/lib/project-data";
import { ProjectPageLayout } from "@/components/project-page-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Terminal, ArrowRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { project } = await getProjectData(params);
  const sandbox = project.sandboxes[0];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "READY":
      case "DEPLOYED":
        return { color: "text-green-500", bgColor: "bg-green-500/10", label: "Ready" };
      case "INITIALIZING":
        return { color: "text-yellow-500", bgColor: "bg-yellow-500/10", label: "Initializing" };
      case "DEPLOYING":
        return { color: "text-yellow-500", bgColor: "bg-yellow-500/10", label: "Deploying" };
      case "ERROR":
        return { color: "text-red-500", bgColor: "bg-red-500/10", label: "Error" };
      default:
        return { color: "text-gray-500", bgColor: "bg-gray-500/10", label: "Stopped" };
    }
  };

  const statusInfo = getStatusInfo(project.status);

  return (
    <ProjectPageLayout project={project}>
      <div className="h-full flex flex-col bg-[#1e1e1e]">
        {/* Header */}
        <div className="border-b border-[#3e3e42] bg-[#252526]">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">{project.name}</h1>
                <p className="text-sm text-gray-400 mt-1">
                  {project.description || "No description"}
                </p>
              </div>
              <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", statusInfo.bgColor)}>
                <Circle className={cn("h-2 w-2", statusInfo.color)} fill="currentColor" />
                <span className={cn("text-xs font-medium", statusInfo.color)}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#252526] border border-[#3e3e42] rounded-lg p-8 text-center">
              <Terminal className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                Ready to start coding?
              </h2>
              <p className="text-gray-400 mb-6">
                Open the web terminal to access Claude Code CLI and start building your application
              </p>
              <Link href={`/projects/${project.id}/terminal`}>
                <Button className="bg-[#0e639c] hover:bg-[#1177bb] text-white flex items-center gap-2 mx-auto">
                  <Terminal className="h-4 w-4" />
                  Start Coding
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Sandbox Info */}
            {sandbox && (
              <div className="mt-6 bg-[#252526] border border-[#3e3e42] rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Sandbox Information</h3>
                <div className="space-y-2 text-sm">
                  {sandbox.publicUrl && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Application URL:</span>
                      <a
                        href={sandbox.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-mono"
                      >
                        {sandbox.publicUrl.replace("https://", "")}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-gray-300">{sandbox.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProjectPageLayout>
  );
}
