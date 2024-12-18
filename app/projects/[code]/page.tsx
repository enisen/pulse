import ProjectPlanner from '@/components/ProjectPlanningApp'

export default async function ProjectDetailPage({
  params,
}: {
  params: { code: string }
}) {
  const { code } = await params
  return <ProjectPlanner projectCode={code} />
}