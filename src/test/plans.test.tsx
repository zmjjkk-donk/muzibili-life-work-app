import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppProvider } from '../store/AppContext'
import { createEmptyData } from '../data/defaultData'
import { TodayPlansPage } from '../pages/TodayPlansPage'
import { DashboardPage } from '../pages/DashboardPage'
import { todayKey } from '../utils/records'

describe('今日计划和首页工作闭环', () => {
  it('可以新增计划并在列表中显示', () => {
    render(<AppProvider><TodayPlansPage /></AppProvider>)
    fireEvent.click(screen.getByRole('button', { name: /新增计划/ }))
    fireEvent.change(screen.getByLabelText('事项标题 *'), { target: { value: '完成测试任务' } })
    fireEvent.click(screen.getByRole('button', { name: '保存计划' }))
    expect(screen.getByText('完成测试任务')).toBeInTheDocument()
  })

  it('首页显示计划进度并可以完成计划', () => {
    const data = createEmptyData()
    const now = new Date().toISOString()
    data.todayPlans = [{ id: 'plan-1', title: '完成测试任务', description: '', date: todayKey(), priority: 'normal', category: '工作', status: 'todo', order: 0, createdAt: now, updatedAt: now }]
    render(<AppProvider initialData={data}><DashboardPage onNavigate={() => undefined} /></AppProvider>)
    expect(screen.getByText('今天完成了 0 / 1 件事')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '完成完成测试任务' }))
    expect(screen.getByText('今天完成了 1 / 1 件事')).toBeInTheDocument()
  })
})
