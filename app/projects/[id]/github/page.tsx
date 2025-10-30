import { getProjectData } from '@/lib/project-data';
import { ProjectPageLayout } from '@/components/project-page-layout';
import GitHubConfiguration from '@/components/github-configuration';

export default async function GitHubRepositoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { project } = await getProjectData(params);

  return (
    <ProjectPageLayout project={project}>
      <GitHubConfiguration project={project} />
    </ProjectPageLayout>
  );
}
