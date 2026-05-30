import SaaSModulePage from "@/components/SaaSModulePage";

type Props = { params: Promise<{ module: string }> };

const allowed = new Set(["promote-business", "collect-reviews", "ai-calendar", "ai-spreadsheets", "outreach", "task-manager", "document-collaboration"]);

export default async function Page({ params }: Props) {
  const { module } = await params;
  const moduleKey = allowed.has(module) ? module : "promote-business";
  return <SaaSModulePage moduleKey={moduleKey as any} />;
}
