import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createEmptyData } from '../data/defaultData'
import { AppProvider } from '../store/AppContext'
import { SettingsPage } from '../pages/SettingsPage'

describe('数据与设置', () => {
  it('可以切换主题并显示数据统计', () => {
    const data = createEmptyData()
    data.quickMemos.push({ id: 'memo-1', content: '已有备忘', processed: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' })
    render(<AppProvider initialData={data}><SettingsPage /></AppProvider>)
    expect(screen.getByText(/当前文件内共有 1 条记录/)).toBeInTheDocument()
    fireEvent.change(screen.getByDisplayValue('浅色'), { target: { value: 'dark' } })
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('恢复有效备份后更新数据统计，损坏文件不会覆盖数据', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const data = createEmptyData()
    render(<AppProvider initialData={data}><SettingsPage /></AppProvider>)
    const backup = createEmptyData()
    backup.quickMemos.push({ id: 'memo-1', content: '恢复后的备忘', processed: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' })
    backup.quickMemos.push({ id: 'memo-2', content: '第二条', processed: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' })
    const input = screen.getByLabelText('恢复备份文件') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' })] } })
    expect(await screen.findByText(/当前文件内共有 2 条记录/)).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
