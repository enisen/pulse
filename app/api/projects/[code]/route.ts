// app/api/projects/[code]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest, props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  try {
    const code = params.code
    const filePath = path.join(process.cwd(), 'public', 'projects', `${code}.json`)
    const jsonData = await fs.readFile(filePath, 'utf-8')
    return NextResponse.json(JSON.parse(jsonData))
  } catch (error) {
    return NextResponse.json({ error: 'Project not found. Error message:' + error }, { status: 404 })
  }
}