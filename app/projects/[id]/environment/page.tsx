import { getProjectData } from "@/lib/project-data";
import { ProjectPageLayout } from "@/components/project-page-layout";
import EnvironmentVariablesView from "@/components/environment-variables-view";

export default async function EnvironmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { project } = await getProjectData(params);

  return (
    <ProjectPageLayout project={project}>
      <EnvironmentVariablesView project={project} />
    </ProjectPageLayout>
  );
}