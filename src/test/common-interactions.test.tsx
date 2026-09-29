import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../App'

describe('通用交互', () => {
  it('快速添加可以进入对应业务模块', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /快速添加/ }))
    fireEvent.click(screen.getByRole('button', { name: /自媒体选题/ }))
    expect(screen.getByRole('heading', { name: '自媒体' })).toBeInTheDocument()
  })

  it('导航区域和页面标题保持一致', () => {
    render(<App />)
    const navigation = within(screen.getByRole('navigation'))
    fireEvent.click(navigation.getByRole('button', { name: /饮食计划/ }))
    expect(screen.getByRole('heading', { name: '饮食计划' })).toBeInTheDocument()
  })
})
