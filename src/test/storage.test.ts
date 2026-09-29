import { describe, expect, it } from 'vitest'
import { createEmptyData } from '../data/defaultData'
import { readDataFile, validateAppData, writeDataFile } from '../services/storage'

function fakeHandle(initial = '') {
  let contents = initial
  return {
    name: 'test-data.json',
    async getFile() { return new File([contents], 'test-data.json', { type: 'application/json' }) },
    async createWritable() {
      return {
        async write(value: string) { contents = value },
        async close() {},
      }
    },
    read() { return contents },
  }
}

describe('本地数据文件层', () => {
  it('创建空数据时包含所有模块集合和版本号', () => {
    const data = createEmptyData()
    expect(data.schemaVersion).toBe(1)
    expect(data.todayPlans).toEqual([])
    expect(data.mediaContents).toEqual([])
    expect(data.entertainmentItems).toEqual([])
    expect(data.settings.theme).toBe('light')
  })

  it('可以写入并重新读取完整数据文件', async () => {
    const handle = fakeHandle()
    const data = createEmptyData()
    data.quickMemos.push({ id: 'memo-1', content: '测试备忘', processed: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' })
    await writeDataFile(handle, data)
    const restored = await readDataFile(handle)
    expect(restored.quickMemos[0].content).toBe('测试备忘')
    expect(JSON.parse(handle.read()).schemaVersion).toBe(1)
  })

  it('拒绝损坏或不兼容的数据文件', () => {
    expect(() => validateAppData(null)).toThrow('不是有效的对象')
    expect(() => validateAppData({ schemaVersion: 2 })).toThrow('不支持的数据文件版本')
    expect(() => validateAppData({ schemaVersion: 1, metadata: {}, settings: {}, todayPlans: [] })).toThrow('缺少字段')
  })
})
