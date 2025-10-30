import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

/**
 * Get authenticated project data
 * Checks authentication and fetches project data with all related information
 * This function is shared across all project pages to avoid duplicate queries
 *
 * @param params - The route params containing project id
 * @returns Object containing session and project data
 * @throws redirect() to /login if not authenticated
 * @throws notFound() if project doesn't exist or user doesn't have access
 */
export async function getProjectData(params: Promise<{ id: string }>) {
  // 1. Check authentication
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // 2. Get project ID from params
  const { id } = await params;

  // 3. Fetch project data with authorization check
  const project = await prisma.project.findFirst({
    where: {
      id: id,
      userId: session.user.id,
    },
    include: {
      sandboxes: true,
      environmentVariables: true,
    },
  });

  if (!project) {
    notFound();
  }

  return { session, project };
}
