import { AdminReviewPage } from "@/components/admin-review-page";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resourceReviewSelect } from "@/repositories/resources";

export default async function AdminReviewRoute() {
  await requireAdmin();
  const resources = await prisma.resource.findMany({
    where: { reviewStatus: { in: ["pending", "approved", "rejected", "flagged"] } },
    select: resourceReviewSelect,
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return <AdminReviewPage initialResources={resources.map((resource) => ({ ...resource, createdAt: resource.createdAt.toISOString(), reviewedAt: resource.reviewedAt?.toISOString() ?? null }))} />;
}
