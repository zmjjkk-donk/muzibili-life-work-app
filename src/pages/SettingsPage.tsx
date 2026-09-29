import { useRef } from 'react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useApp } from '../store/AppContext'

export function SettingsPage() {
  const { data, fileName, fileHandle, saveStatus, lastSavedAt, error, browserSupportsFileAccess, connectFile, exportBackup, restoreBackup, updateData } = useApp()
  const restoreInput = useRef<HTMLInputElement>(null)
  const totalRecords = Object.entries(data).filter(([key]) => !['schemaVersion', 'metadata', 'settings'].includes(key)).reduce((sum, [, value]) => sum + (Array.isArray(value) ? value.length : 0), 0)
  const handleRestore = async (file: File) => {
    if (!window.confirm('恢复备份会替换当前内存中的数据，确定继续吗？')) return
    await restoreBackup(file)
  }
  return <>
    <PageHeader title="数据与设置" subtitle="确保数据文件连接正常，定期导出一份备份。" />
    <div className="settings-grid">
      <section className="section-card settings-main"><div className="section-card-head"><div><h2>数据文件</h2><span className="muted">当前 App 使用的独立文件</span></div><StatusBadge tone={fileHandle ? 'success' : 'warning'}>{fileHandle ? '已连接' : '未连接'}</StatusBadge></div><div className="file-status-card"><div className="file-status-icon">⌁</div><div><strong>{fileName ?? '还没有连接数据文件'}</strong><p>{fileHandle ? '修改内容后会自动保存到这个文件。' : '先打开已有文件，或创建一个新的数据文件。'}</p></div></div><div className="settings-actions"><button className="button primary" onClick={() => void connectFile(false)}>打开数据文件</button><button className="button secondary" onClick={() => void connectFile(true)}>新建数据文件</button></div>{!browserSupportsFileAccess && <div className="settings-note warning">当前浏览器未提供自动文件访问能力，请使用 Chrome 或 Edge。手动导出和恢复仍可使用。</div>}<div className="save-status-row"><span>最近自动保存</span><strong>{saveStatus === 'saving' ? '正在保存…' : saveStatus === 'error' ? '保存失败' : lastSavedAt ? new Date(lastSavedAt).toLocaleString('zh-CN') : '尚未保存'}</strong></div></section>
      <section className="section-card"><div className="section-card-head"><div><h2>备份与恢复</h2><span className="muted">完整保存所有模块数据</span></div></div><div className="backup-actions"><button className="backup-action" onClick={exportBackup}><span>↓</span><div><strong>导出备份</strong><small>下载一份完整 JSON 备份</small></div></button><button className="backup-action" onClick={() => restoreInput.current?.click()}><span>↑</span><div><strong>恢复备份</strong><small>选择之前导出的备份文件</small></div></button><input aria-label="恢复备份文件" ref={restoreInput} type="file" accept="application/json,.json" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleRestore(file); event.currentTarget.value = '' }} /></div><div className="settings-note">恢复前会检查文件版本和内容结构，不兼容或损坏的文件不会覆盖当前数据。</div></section>
      <section className="section-card"><div className="section-card-head"><div><h2>显示设置</h2><span className="muted">让工作台更符合你的习惯</span></div></div><div className="setting-row"><div><strong>主题</strong><small>当前页面的显示风格</small></div><select value={data.settings.theme} onChange={(event) => updateData((current) => ({ ...current, settings: { ...current.settings, theme: event.target.value as 'light' | 'dark' } }))}><option value="light">浅色</option><option value="dark">深色</option></select></div><div className="setting-row"><div><strong>数据记录</strong><small>当前文件内共有 {totalRecords} 条记录</small></div><StatusBadge tone="info">版本 {data.schemaVersion}</StatusBadge></div></section>
    </div>
    {error && <div className="settings-note warning" style={{ marginTop: 14 }}>最近一次操作提示：{error}</div>}
  </>
}
