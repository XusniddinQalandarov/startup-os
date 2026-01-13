'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Task, TaskStatus } from '@/types'

import { cache } from 'react'

export const getTasks = cache(async function getTasks(startupId: string): Promise<Task[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('startup_id', startupId)
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data.map(row => ({
    id: row.id,
    startupId: row.startup_id,
    title: row.title,
    description: row.description || '',
    status: row.status as TaskStatus,
    estimateHours: row.estimate_hours || 0,
    skillTag: row.skill_tag || 'backend',
    position: row.position || 0,
    createdAt: row.created_at,
  }))
})

export async function createTask(startupId: string, task: Omit<Task, 'id' | 'startupId' | 'createdAt'>): Promise<Task | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      startup_id: startupId,
      title: task.title,
      description: task.description,
      status: task.status,
      estimate_hours: task.estimateHours,
      skill_tag: task.skillTag,
      position: task.position,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error)
    return null
  }

  revalidatePath(`/dashboard/${startupId}/tasks`)
  
  return {
    id: data.id,
    startupId: data.startup_id,
    title: data.title,
    description: data.description || '',
    status: data.status as TaskStatus,
    estimateHours: data.estimate_hours || 0,
    skillTag: data.skill_tag || 'backend',
    position: data.position || 0,
    createdAt: data.created_at,
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  const supabase = await createClient()
  
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.estimateHours !== undefined) updateData.estimate_hours = updates.estimateHours
  if (updates.skillTag !== undefined) updateData.skill_tag = updates.skillTag
  if (updates.position !== undefined) updateData.position = updates.position

  await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', taskId)
}

export async function deleteTask(taskId: string): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
}

export async function bulkCreateTasks(startupId: string, tasks: Omit<Task, 'id' | 'startupId' | 'createdAt'>[]): Promise<void> {
  const supabase = await createClient()
  
  const taskRows = tasks.map((task, index) => ({
    startup_id: startupId,
    title: task.title,
    description: task.description,
    status: task.status,
    estimate_hours: task.estimateHours,
    skill_tag: task.skillTag,
    position: index,
  }))

  await supabase.from('tasks').insert(taskRows)
}
