import ProjectPlanner from '@/components/ProjectPlanningApp'

export default function ProjectDetailPage({
  params,
}: {
  params: { code: string }
}) {
  const { code } = params
  return <ProjectPlanner projectCode={code} />
}