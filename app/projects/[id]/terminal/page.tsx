import { getProjectData } from "@/lib/project-data";
import { ProjectPageLayout } from "@/components/project-page-layout";
import ProjectTerminalView from "@/components/project-terminal-view";

export default async function TerminalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { project } = await getProjectData(params);

  return (
    <ProjectPageLayout project={project}>
      <ProjectTerminalView
        project={project}
        sandbox={project.sandboxes[0]}
      />
    </ProjectPageLayout>
  );
}