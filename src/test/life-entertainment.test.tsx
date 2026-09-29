import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppProvider } from '../store/AppContext'
import { ConsultingPage } from '../pages/ConsultingPage'
import { FitnessPage } from '../pages/FitnessPage'
import { DietPage } from '../pages/DietPage'
import { EntertainmentPage } from '../pages/EntertainmentPage'

describe('咨询、健身、饮食和娱乐模块', () => {
  it('可以创建客户和咨询事项', () => {
    render(<AppProvider><ConsultingPage /></AppProvider>)
    fireEvent.click(screen.getByRole('button', { name: '＋ 新增客户' }))
    fireEvent.change(screen.getByLabelText('客户名称'), { target: { value: '测试客户' } })
    fireEvent.click(screen.getByRole('button', { name: '保存客户' }))
    expect(screen.getAllByText('测试客户').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: '＋ 新增咨询事项' }))
    fireEvent.change(screen.getByLabelText('咨询事项标题'), { target: { value: '需求梳理' } })
    fireEvent.click(screen.getByRole('button', { name: '保存事项' }))
    expect(screen.getByText('需求梳理')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '＋ 添加沟通' }))
    fireEvent.change(screen.getByLabelText('沟通内容'), { target: { value: '确认了下一步方案' } })
    fireEvent.click(screen.getByRole('button', { name: '保存沟通' }))
    expect(screen.getByText('确认了下一步方案')).toBeInTheDocument()
  })

  it('可以安排健身训练', () => {
    render(<AppProvider><FitnessPage /></AppProvider>)
    fireEvent.click(screen.getByRole('button', { name: '＋ 安排训练' }))
    fireEvent.change(screen.getByLabelText('训练类型'), { target: { value: '上肢力量' } })
    fireEvent.click(screen.getByRole('button', { name: '保存训练' }))
    expect(screen.getByText('上肢力量')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '＋ 添加记录' }))
    fireEvent.change(screen.getByLabelText('动作名称'), { target: { value: '卧推' } })
    fireEvent.click(screen.getByRole('button', { name: '保存记录' }))
    expect(screen.getByText(/卧推 3×10/)).toBeInTheDocument()
  })

  it('可以添加餐次并改变执行状态', () => {
    render(<AppProvider><DietPage /></AppProvider>)
    fireEvent.click(screen.getAllByRole('button', { name: '＋ 添加餐次' })[0])
    fireEvent.change(screen.getByLabelText('食物名称'), { target: { value: '燕麦和鸡蛋' } })
    fireEvent.click(screen.getByRole('button', { name: '保存餐次' }))
    expect(screen.getByText('燕麦和鸡蛋')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: '燕麦和鸡蛋执行状态' }), { target: { value: 'eaten' } })
    expect(screen.getByRole('combobox', { name: '燕麦和鸡蛋执行状态' })).toHaveValue('eaten')
  })

  it('可以添加娱乐内容并切换状态', () => {
    render(<AppProvider><EntertainmentPage /></AppProvider>)
    fireEvent.click(screen.getByRole('button', { name: /添加内容/ }))
    fireEvent.change(screen.getByLabelText('娱乐内容名称'), { target: { value: '测试游戏' } })
    fireEvent.click(screen.getByRole('button', { name: '保存内容' }))
    expect(screen.getByText('测试游戏')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: '测试游戏状态' }), { target: { value: 'playing' } })
    expect(screen.getByRole('combobox', { name: '测试游戏状态' })).toHaveValue('playing')
  })
})
