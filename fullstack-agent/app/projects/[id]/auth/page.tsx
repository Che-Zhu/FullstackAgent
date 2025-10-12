import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import AuthConfiguration from "@/components/auth-configuration";

export default async function AuthConfigurationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

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

  const sandbox = project.sandboxes[0];
  // Get the main application URL (port 3000)
  const projectUrl = sandbox?.publicUrl || `https://sandbox-${id}.dgkwlntjskms.usw.sealos.io`;

  return (
    <AuthConfiguration
      project={project}
      projectUrl={projectUrl}
      environmentVariables={project.environmentVariables}
    />
  );
}