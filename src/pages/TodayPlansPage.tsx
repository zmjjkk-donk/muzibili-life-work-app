import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Drawer } from '../components/Drawer'
import { EmptyState } from '../components/EmptyState'
import { StatusBadge } from '../components/StatusBadge'
import { useApp } from '../store/AppContext'
import type { Priority, TodayPlan } from '../types'
import { formatDate, isoNow, makeId, todayKey } from '../utils/records'

const blankForm = { title: '', description: '', time: '', priority: 'normal' as Priority, category: '工作', status: 'todo' as TodayPlan['status'] }

export function TodayPlansPage() {
  const { data, updateData } = useApp()
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [editing, setEditing] = useState<TodayPlan | null>(null)
  const [form, setForm] = useState(blankForm)
  const plans = useMemo(() => data.todayPlans.filter((item) => item.date === selectedDate).sort((a, b) => a.order - b.order), [data.todayPlans, selectedDate])
  const doneCount = plans.filter((item) => item.status === 'done').length

  const openNew = () => { setEditing({ id: '', createdAt: '', updatedAt: '', title: '', description: '', date: selectedDate, time: '', priority: 'normal', category: '工作', status: 'todo', order: plans.length }); setForm(blankForm) }
  const openEdit = (plan: TodayPlan) => { setEditing(plan); setForm({ title: plan.title, description: plan.description, time: plan.time ?? '', priority: plan.priority, category: plan.category, status: plan.status }) }
  const savePlan = () => {
    if (!form.title.trim()) return
    const now = isoNow()
    updateData((current) => {
      if (editing?.id) return { ...current, todayPlans: current.todayPlans.map((item) => item.id === editing.id ? { ...item, ...form, updatedAt: now } : item) }
      return { ...current, todayPlans: [...current.todayPlans, { ...form, id: makeId('plan'), date: selectedDate, createdAt: now, updatedAt: now, order: plans.length }] }
    })
    setEditing(null)
  }
  const deletePlan = (id: string) => { if (!window.confirm('确定删除这条计划吗？')) return; updateData((current) => ({ ...current, todayPlans: current.todayPlans.filter((item) => item.id !== id) })) }
  const toggleDone = (id: string) => updateData((current) => ({ ...current, todayPlans: current.todayPlans.map((item) => item.id === id ? { ...item, status: item.status === 'done' ? 'todo' : 'done', updatedAt: isoNow() } : item) }))
  const shiftDate = (amount: number) => { const date = new Date(`${selectedDate}T00:00:00`); date.setDate(date.getDate() + amount); setSelectedDate(todayKey(date)) }

  return <>
    <PageHeader title="今日计划" subtitle="把想做的事排到日历里，再一件件完成。" action={<button className="button primary" onClick={openNew}>＋ 新增计划</button>} />
    <div className="date-toolbar section-card"><button className="icon-button" onClick={() => shiftDate(-1)} aria-label="前一天">‹</button><div className="date-center"><strong>{formatDate(selectedDate)}</strong><button className="text-link" onClick={() => setSelectedDate(todayKey())}>回到今天</button></div><button className="icon-button" onClick={() => shiftDate(1)} aria-label="后一天">›</button><input aria-label="选择日期" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></div>
    <div className="plan-overview"><div><span className="eyebrow">DAILY PLAN</span><h2>{selectedDate === todayKey() ? '今天' : formatDate(selectedDate)} 的安排</h2><p>{plans.length === 0 ? '还没有计划，先添加一项最重要的事情。' : `已完成 ${doneCount} / ${plans.length} 项`}</p></div><div className="mini-progress"><div><span style={{ width: `${plans.length ? doneCount / plans.length * 100 : 0}%` }} /></div><strong>{plans.length ? Math.round(doneCount / plans.length * 100) : 0}%</strong></div></div>
    <section className="plan-list-section">{plans.length === 0 ? <div className="section-card"><EmptyState title="这一天还没有计划" description="把要做的事情写下来，之后会更轻松。" action={<button className="button primary" onClick={openNew}>新增第一项</button>} /></div> : <div className="plan-list">{plans.map((plan) => <article key={plan.id} className={`plan-card ${plan.status === 'done' ? 'is-done' : ''}`}><button className="check-button large" aria-label={`完成${plan.title}`} onClick={() => toggleDone(plan.id)}>{plan.status === 'done' ? '✓' : ''}</button><div className="plan-main"><div className="plan-meta"><span>{plan.time || '未设置时间'}</span><span>·</span><span>{plan.category || '未分类'}</span><StatusBadge tone={plan.priority === 'high' ? 'danger' : plan.priority === 'low' ? 'neutral' : 'info'}>{plan.priority === 'high' ? '高优先级' : plan.priority === 'low' ? '低优先级' : '普通'}</StatusBadge></div><h3>{plan.title}</h3>{plan.description && <p>{plan.description}</p>}</div><div className="plan-actions"><StatusBadge tone={plan.status === 'done' ? 'success' : plan.status === 'delayed' ? 'warning' : plan.status === 'cancelled' ? 'danger' : 'neutral'}>{plan.status === 'done' ? '已完成' : plan.status === 'delayed' ? '已延期' : plan.status === 'cancelled' ? '已取消' : plan.status === 'doing' ? '进行中' : '待处理'}</StatusBadge><button className="icon-button" onClick={() => openEdit(plan)} aria-label={`编辑${plan.title}`}>⋯</button><button className="icon-button danger-text" onClick={() => deletePlan(plan.id)} aria-label={`删除${plan.title}`}>×</button></div></article>)}</div>}</section>
    {editing && <Drawer title={editing.id ? '编辑计划' : '新增计划'} onClose={() => setEditing(null)}><div className="form-grid"><div className="field"><label>事项标题 *</label><input aria-label="事项标题 *" autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="例如：完成项目接口" /></div><div className="form-row"><div className="field"><label>时间</label><input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></div><div className="field"><label>分类</label><input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></div></div><div className="form-row"><div className="field"><label>优先级</label><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })}><option value="high">高</option><option value="normal">普通</option><option value="low">低</option></select></div>{editing.id && <div className="field"><label>状态</label><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TodayPlan['status'] })}><option value="todo">待处理</option><option value="doing">进行中</option><option value="done">已完成</option><option value="delayed">延期</option><option value="cancelled">取消</option></select></div>}</div><div className="field"><label>详细说明</label><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="补充背景、下一步或完成标准" /></div><div className="form-actions"><button className="button secondary" onClick={() => setEditing(null)}>取消</button><button className="button primary" disabled={!form.title.trim()} onClick={savePlan}>保存计划</button></div></div></Drawer>}
  </>
}
