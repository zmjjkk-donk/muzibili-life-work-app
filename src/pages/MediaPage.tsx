import { useState } from 'react'
import { Drawer } from '../components/Drawer'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useApp } from '../store/AppContext'
import type { MediaContent, MediaStage } from '../types'
import { isoNow, makeId } from '../utils/records'

const stages: { id: MediaStage; label: string; tone: 'neutral' | 'info' | 'warning' | 'success' }[] = [
  { id: 'idea', label: '灵感', tone: 'neutral' }, { id: 'preparing', label: '准备中', tone: 'info' }, { id: 'making', label: '制作中', tone: 'warning' }, { id: 'ready', label: '待发布', tone: 'warning' }, { id: 'published', label: '已发布', tone: 'success' },
]
const blank = { title: '', type: '文章', platform: '', stage: 'idea' as MediaStage, plannedPublishAt: '', body: '', notes: '', publishUrl: '' }

export function MediaPage() {
  const { data, updateData } = useApp()
  const [editing, setEditing] = useState<MediaContent | null>(null)
  const [form, setForm] = useState(blank)
  const [dragging, setDragging] = useState<string | null>(null)
  const openNew = () => { setEditing({ id: '', createdAt: '', updatedAt: '', ...blank }); setForm(blank) }
  const openEdit = (item: MediaContent) => { setEditing(item); setForm({ title: item.title, type: item.type, platform: item.platform, stage: item.stage, plannedPublishAt: item.plannedPublishAt ?? '', body: item.body, notes: item.notes, publishUrl: item.publishUrl ?? '' }) }
  const save = () => {
    if (!form.title.trim()) return
    const now = isoNow()
    updateData((current) => editing?.id ? ({ ...current, mediaContents: current.mediaContents.map((item) => item.id === editing.id ? { ...item, ...form, updatedAt: now } : item) }) : ({ ...current, mediaContents: [...current.mediaContents, { ...form, id: makeId('media'), createdAt: now, updatedAt: now }] }))
    setEditing(null)
  }
  const moveStage = (id: string, stage: MediaStage) => updateData((current) => ({ ...current, mediaContents: current.mediaContents.map((item) => item.id === id ? { ...item, stage, updatedAt: isoNow() } : item) }))
  const deleteItem = (id: string) => { if (window.confirm('确定删除这条内容吗？')) updateData((current) => ({ ...current, mediaContents: current.mediaContents.filter((item) => item.id !== id) })) }

  return <>
    <PageHeader title="自媒体" subtitle="从一个想法开始，把内容推到发布完成。" action={<button className="button primary" onClick={openNew}>＋ 新增内容</button>} />
    <div className="module-toolbar"><div className="module-stat"><strong>{data.mediaContents.length}</strong><span>全部内容</span></div><div className="module-stat"><strong>{data.mediaContents.filter((item) => item.stage === 'ready').length}</strong><span>待发布</span></div><div className="module-stat"><strong>{data.mediaContents.filter((item) => item.stage === 'published').length}</strong><span>已发布</span></div></div>
    <div className="kanban-board">{stages.map((stage) => <section className="kanban-column" key={stage.id} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragging) moveStage(dragging, stage.id); setDragging(null) }}><div className="kanban-head"><div><h2>{stage.label}</h2><span>{data.mediaContents.filter((item) => item.stage === stage.id).length} 条</span></div><StatusBadge tone={stage.tone}>{stage.id === 'ready' ? '可发布' : stage.label}</StatusBadge></div><div className="kanban-items">{data.mediaContents.filter((item) => item.stage === stage.id).map((item) => <article key={item.id} className="content-card" draggable onDragStart={() => setDragging(item.id)} onClick={() => openEdit(item)}><div className="content-card-top"><span>{item.type}</span><button aria-label={`删除${item.title}`} onClick={(event) => { event.stopPropagation(); deleteItem(item.id) }}>×</button></div><h3>{item.title}</h3><p>{item.platform || '未设置平台'}</p>{item.plannedPublishAt && <small>计划 {new Date(item.plannedPublishAt).toLocaleDateString('zh-CN')}</small>}</article>)}</div>{data.mediaContents.filter((item) => item.stage === stage.id).length === 0 && <div className="kanban-empty">拖入内容或新增一条</div>}</section>)}</div>
    {editing && <Drawer title={editing.id ? '编辑内容' : '新增内容'} onClose={() => setEditing(null)}><div className="form-grid"><div className="field"><label>内容标题 *</label><input aria-label="内容标题" autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="例如：一周开发复盘" /></div><div className="form-row"><div className="field"><label>内容类型</label><input value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} /></div><div className="field"><label>发布平台</label><input value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value })} placeholder="例如：公众号" /></div></div><div className="form-row"><div className="field"><label>内容阶段</label><select value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value as MediaStage })}>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></div><div className="field"><label>计划发布时间</label><input type="datetime-local" value={form.plannedPublishAt} onChange={(event) => setForm({ ...form, plannedPublishAt: event.target.value })} /></div></div><div className="field"><label>脚本或正文</label><textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></div><div className="field"><label>备注</label><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div><div className="field"><label>发布链接</label><input value={form.publishUrl} onChange={(event) => setForm({ ...form, publishUrl: event.target.value })} /></div><div className="form-actions"><button className="button secondary" onClick={() => setEditing(null)}>取消</button><button className="button primary" disabled={!form.title.trim()} onClick={save}>保存内容</button></div></div></Drawer>}
    {data.mediaContents.length === 0 && <div className="section-card" style={{ marginTop: 16 }}><EmptyState title="还没有内容" description="把一个灵感记下来，开始你的内容流程。" action={<button className="button primary" onClick={openNew}>新增第一条内容</button>} /></div>}
  </>
}
