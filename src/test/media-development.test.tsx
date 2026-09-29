import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppProvider } from '../store/AppContext'
import { MediaPage } from '../pages/MediaPage'
import { DevelopmentPage } from '../pages/DevelopmentPage'

describe('自媒体和开发工作模块', () => {
  it('可以创建自媒体内容并进入内容看板', () => {
    render(<AppProvider><MediaPage /></AppProvider>)
    fireEvent.click(screen.getByRole('button', { name: /新增内容/ }))
    fireEvent.change(screen.getByLabelText('内容标题'), { target: { value: '本周复盘' } })
    fireEvent.click(screen.getByRole('button', { name: '保存内容' }))
    expect(screen.getByText('本周复盘')).toBeInTheDocument()
    expect(screen.getAllByText('灵感').length).toBeGreaterThan(0)
  })

  it('可以创建项目并在项目内创建开发任务', () => {
    render(<AppProvider><DevelopmentPage /></AppProvider>)
    fireEvent.click(screen.getByRole('button', { name: '＋ 新增项目' }))
    fireEvent.change(screen.getByLabelText('项目名称'), { target: { value: '个人工作台' } })
    fireEvent.click(screen.getByRole('button', { name: '保存项目' }))
    expect(screen.getAllByText('个人工作台').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: '＋ 新增任务' }))
    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '整理数据模型' } })
    fireEvent.click(screen.getByRole('button', { name: '保存任务' }))
    expect(screen.getByText('整理数据模型')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '＋ 添加里程碑' }))
    fireEvent.change(screen.getByLabelText('里程碑名称'), { target: { value: '完成第一版' } })
    fireEvent.click(screen.getByRole('button', { name: '保存里程碑' }))
    expect(screen.getByText('完成第一版')).toBeInTheDocument()
  })
})
