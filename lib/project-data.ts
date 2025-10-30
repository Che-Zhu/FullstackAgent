import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

/**
 * Fetch project data with all related information
 * This function is shared across all project pages to avoid duplicate queries
 *
 * @param projectId - The project ID
 * @param userId - The authenticated user ID
 * @returns Project with sandboxes and environment variables
 * @throws notFound() if project doesn't exist or user doesn't have access
 */
export async function getProjectData(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: userId,
    },
    include: {
      sandboxes: true,
      environmentVariables: true,
    },
  });

  if (!project) {
    notFound();
  }

  return project;
}
