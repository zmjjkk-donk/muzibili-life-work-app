import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppData, SaveStatus } from '../types'
import { createEmptyData, stampData } from '../data/defaultData'
import {
  chooseDataFile,
  exportBackup as downloadBackup,
  parseBackupFile,
  readDataFile,
  rememberFileHandle,
  restoreFileHandle,
  supportsFileSystemAccess,
  writeDataFile,
  type LocalFileHandle,
} from '../services/storage'

interface AppContextValue {
  data: AppData
  fileHandle: LocalFileHandle | null
  fileName: string | null
  saveStatus: SaveStatus
  lastSavedAt: string | null
  error: string | null
  browserSupportsFileAccess: boolean
  updateData: (updater: (data: AppData) => AppData) => void
  connectFile: (create?: boolean) => Promise<boolean>
  saveNow: () => Promise<boolean>
  exportBackup: () => void
  restoreBackup: (file: File) => Promise<boolean>
  clearError: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children, initialData }: { children: ReactNode; initialData?: AppData }) {
  const [data, setData] = useState<AppData>(() => initialData ?? createEmptyData())
  const [fileHandle, setFileHandle] = useState<LocalFileHandle | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const browserSupportsFileAccess = supportsFileSystemAccess()

  const updateData = useCallback((updater: (current: AppData) => AppData) => {
    setData((current) => stampData(updater(current)))
    setDirty(true)
    setSaveStatus('idle')
  }, [])

  const saveNow = useCallback(async () => {
    if (!fileHandle) return false
    setSaveStatus('saving')
    try {
      const next = stampData(data)
      await writeDataFile(fileHandle, next)
      setData(next)
      setDirty(false)
      setLastSavedAt(new Date().toISOString())
      setSaveStatus('saved')
      setError(null)
      return true
    } catch (cause) {
      setSaveStatus('error')
      setError(cause instanceof Error ? cause.message : '保存失败，请重新选择数据文件')
      return false
    }
  }, [data, fileHandle])

  useEffect(() => {
    if (!dirty || !fileHandle) return
    const timer = window.setTimeout(() => { void saveNow() }, 300)
    return () => window.clearTimeout(timer)
  }, [dirty, fileHandle, saveNow])

  useEffect(() => {
    void (async () => {
      const savedHandle = await restoreFileHandle()
      if (!savedHandle) return
      try {
        const restored = await readDataFile(savedHandle)
        setData(restored)
        setFileHandle(savedHandle)
        setFileName(savedHandle.name ?? '工作生活数据文件')
        setSaveStatus('saved')
        setLastSavedAt(restored.metadata.updatedAt)
      } catch {
        setError('上次数据文件无法读取，请重新选择或创建文件')
      }
    })()
  }, [])

  const connectFile = useCallback(async (create = false) => {
    setError(null)
    try {
      const selected = await chooseDataFile(create)
      if (!selected) {
        setError('当前浏览器不支持自动文件访问，请使用 Chrome 或 Edge')
        return false
      }
      let next = createEmptyData()
      if (!create) next = await readDataFile(selected)
      setData(next)
      setFileHandle(selected)
      setFileName(selected.name ?? '工作生活数据文件')
      await rememberFileHandle(selected)
      if (create) await writeDataFile(selected, next)
      setDirty(false)
      setSaveStatus('saved')
      setLastSavedAt(new Date().toISOString())
      return true
    } catch (cause) {
      setSaveStatus('error')
      setError(cause instanceof Error ? cause.message : '无法读取数据文件')
      return false
    }
  }, [])

  const exportBackup = useCallback(() => downloadBackup(data), [data])

  const restoreBackup = useCallback(async (file: File) => {
    try {
      const restored = await parseBackupFile(file)
      setData(restored)
      setDirty(true)
      setError(null)
      setSaveStatus('idle')
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '备份文件无效')
      return false
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme
  }, [data.settings.theme])

  const value = useMemo<AppContextValue>(() => ({
    data, fileHandle, fileName, saveStatus, lastSavedAt, error,
    browserSupportsFileAccess, updateData, connectFile, saveNow, exportBackup, restoreBackup,
    clearError: () => setError(null),
  }), [data, fileHandle, fileName, saveStatus, lastSavedAt, error, browserSupportsFileAccess, updateData, connectFile, saveNow, exportBackup, restoreBackup])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp 必须在 AppProvider 内使用')
  return context
}
