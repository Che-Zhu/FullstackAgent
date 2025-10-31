import { getProjectData } from "@/lib/project-data";
import { ProjectPageLayout } from "@/components/project-page-layout";
import AuthConfiguration from "@/components/auth-configuration";

export default async function AuthConfigurationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { project } = await getProjectData(params);
  const { id } = await params;

  const sandbox = project.sandboxes[0];
  // Get the main application URL (port 3000)
  const projectUrl = sandbox?.publicUrl || `https://sandbox-${id}.dgkwlntjskms.usw.sealos.io`;

  return (
    <ProjectPageLayout project={project}>
      <AuthConfiguration
        project={project}
        projectUrl={projectUrl}
        environmentVariables={project.environmentVariables}
      />
    </ProjectPageLayout>
  );
}