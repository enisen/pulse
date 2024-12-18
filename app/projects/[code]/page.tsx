// app/projects/[code]/page.tsx
import ProjectPlanner from '@/components/ProjectPlanningApp'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { code } = await params
  return <ProjectPlanner projectCode={code} />
}