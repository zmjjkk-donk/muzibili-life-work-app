import type { AppData } from '../types'
import { createEmptyData } from '../data/defaultData'

export interface Writable {
  write(data: string): Promise<void>
  close(): Promise<void>
}

export interface LocalFileHandle {
  name?: string
  getFile(): Promise<File>
  createWritable(): Promise<Writable>
}

const DB_NAME = 'work-life-app'
const STORE_NAME = 'handles'
const HANDLE_KEY = 'data-file'

export function supportsFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window
}

export async function chooseDataFile(create = false): Promise<LocalFileHandle | null> {
  const picker = create ? (window as Window & { showSaveFilePicker?: Function }).showSaveFilePicker : (window as Window & { showOpenFilePicker?: Function }).showOpenFilePicker
  if (!picker) return null
  const options = create
    ? { suggestedName: 'work-life-data.json', types: [{ description: 'JSON data', accept: { 'application/json': ['.json'] } }] }
    : { multiple: false, types: [{ description: 'JSON data', accept: { 'application/json': ['.json'] } }] }
  const selected = await picker(options)
  if (create) return selected as LocalFileHandle
  return (selected as LocalFileHandle[])[0] ?? null
}

export async function readDataFile(handle: LocalFileHandle): Promise<AppData> {
  const file = await handle.getFile()
  if (file.size === 0) return createEmptyData()
  const parsed: unknown = JSON.parse(await file.text())
  return validateAppData(parsed)
}

export async function writeDataFile(handle: LocalFileHandle, data: AppData): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(JSON.stringify(data, null, 2))
  await writable.close()
}

export function validateAppData(value: unknown): AppData {
  if (!value || typeof value !== 'object') throw new Error('数据文件不是有效的对象')
  const candidate = value as Partial<AppData>
  if (candidate.schemaVersion !== 1) throw new Error('不支持的数据文件版本')
  const arrays: (keyof AppData)[] = [
    'todayPlans', 'quickMemos', 'mediaContents', 'developmentProjects', 'developmentTasks',
    'developmentMilestones', 'consultingClients', 'consultingCases', 'consultingCommunications',
    'fitnessPlans', 'fitnessLogs', 'bodyMetrics', 'dietPlans', 'shoppingItems', 'entertainmentItems',
  ]
  for (const key of arrays) {
    if (!Array.isArray(candidate[key])) throw new Error(`数据文件缺少字段：${String(key)}`)
  }
  if (!candidate.metadata || !candidate.settings) throw new Error('数据文件缺少元数据或设置')
  return candidate as AppData
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('当前浏览器不支持 IndexedDB'))
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('无法打开本地存储'))
  })
}

export async function rememberFileHandle(handle: LocalFileHandle): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function restoreFileHandle(): Promise<LocalFileHandle | null> {
  try {
    const db = await openDb()
    const result = await new Promise<LocalFileHandle | null>((resolve, reject) => {
      const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(HANDLE_KEY)
      request.onsuccess = () => resolve((request.result as LocalFileHandle | undefined) ?? null)
      request.onerror = () => reject(request.error)
    })
    db.close()
    return result
  } catch {
    return null
  }
}

export function exportBackup(data: AppData, fileName = `work-life-backup-${new Date().toISOString().slice(0, 10)}.json`): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function parseBackupFile(file: File): Promise<AppData> {
  return validateAppData(JSON.parse(await file.text()))
}
