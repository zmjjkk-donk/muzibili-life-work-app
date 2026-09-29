import { fireEvent, render, screen, within } from '@testing-library/react'
import { App } from '../App'
import { describe, expect, it } from 'vitest'

describe('应用骨架和导航', () => {
  it('启动后显示首页和完整导航', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '首页总览' })).toBeInTheDocument()
    const navigation = within(screen.getByRole('navigation'))
    expect(navigation.getByRole('button', { name: /今日计划/ })).toBeInTheDocument()
    expect(navigation.getByRole('button', { name: /自媒体/ })).toBeInTheDocument()
    expect(navigation.getByRole('button', { name: /开发工作/ })).toBeInTheDocument()
    expect(navigation.getByRole('button', { name: /咨询工作/ })).toBeInTheDocument()
    expect(navigation.getByRole('button', { name: /健身计划/ })).toBeInTheDocument()
    expect(navigation.getByRole('button', { name: /饮食计划/ })).toBeInTheDocument()
    expect(navigation.getByRole('button', { name: /游戏娱乐/ })).toBeInTheDocument()
    expect(navigation.getByRole('button', { name: /数据与设置/ })).toBeInTheDocument()
  })

  it('可以在页面之间切换并打开快速添加', async () => {
    render(<App />)
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button', { name: /今日计划/ }))
    expect(screen.getByRole('heading', { name: '今日计划' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /快速添加/ }))
    expect(screen.getByRole('dialog', { name: '快速添加' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /自媒体选题/ })).toBeInTheDocument()
  })
})
