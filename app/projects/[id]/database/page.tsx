import { getProjectData } from "@/lib/project-data";
import { ProjectPageLayout } from "@/components/project-page-layout";
import DatabaseConfiguration from "@/components/database-configuration";

export default async function DatabaseConfigurationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { project } = await getProjectData(params);

  // If DATABASE_URL is not in environment variables, try to get it from other sources
  let dbUrlEnvVar = project.environmentVariables.find(env => env.key === "DATABASE_URL");
  const sandbox = project.sandboxes[0];
  let enrichedEnvVars = [...project.environmentVariables];

  if (!dbUrlEnvVar) {
    let databaseUrl = null;

    // First try to use the project's databaseUrl field
    if (project.databaseUrl) {
      databaseUrl = project.databaseUrl;
    }
    // Otherwise try to construct from sandbox info
    else if (sandbox && sandbox.dbHost && sandbox.dbUser && sandbox.dbPassword) {
      databaseUrl = `postgresql://${sandbox.dbUser}:${sandbox.dbPassword}@${sandbox.dbHost}:${sandbox.dbPort || 5432}/${sandbox.dbName || 'postgres'}?schema=public`;
    }

    // If we have a database URL from any source, add it to environment variables for display
    if (databaseUrl) {
      enrichedEnvVars.push({
        id: 'temp-db-url',
        key: 'DATABASE_URL',
        value: databaseUrl,
        category: 'database',
        isSecret: true,
        projectId: project.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return (
    <ProjectPageLayout project={project}>
      <DatabaseConfiguration
        project={project}
        environmentVariables={enrichedEnvVars}
      />
    </ProjectPageLayout>
  );
}