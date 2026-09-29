import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { EmptyState } from '../components/EmptyState'
import { useApp } from '../store/AppContext'
import { dateIsBeforeToday, isoNow, makeId, todayKey } from '../utils/records'

export function DashboardPage({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { data, updateData } = useApp()
  const [memo, setMemo] = useState('')
  const today = todayKey()
  const todayPlans = useMemo(() => data.todayPlans.filter((item) => item.date === today).sort((a, b) => a.order - b.order), [data.todayPlans, today])
  const doneCount = todayPlans.filter((item) => item.status === 'done').length
  const openMemos = data.quickMemos.filter((item) => !item.processed).slice(0, 5)
  const attention = [
    ...data.todayPlans.filter((item) => item.status === 'delayed' || (dateIsBeforeToday(item.date) && item.status !== 'done' && item.status !== 'cancelled')).map((item) => ({ id: item.id, module: 'plans', label: item.title, meta: '计划逾期' })),
    ...data.developmentTasks.filter((item) => item.status === 'blocked').map((item) => ({ id: item.id, module: 'development', label: item.title, meta: '开发阻塞' })),
    ...data.consultingCases.filter((item) => item.status === 'follow_up' && !!item.followUpDate && dateIsBeforeToday(item.followUpDate)).map((item) => ({ id: item.id, module: 'consulting', label: item.title, meta: '咨询跟进逾期' })),
  ].slice(0, 8)

  const addMemo = () => {
    const content = memo.trim()
    if (!content) return
    const now = isoNow()
    updateData((current) => ({ ...current, quickMemos: [{ id: makeId('memo'), content, processed: false, createdAt: now, updatedAt: now }, ...current.quickMemos] }))
    setMemo('')
  }

  const togglePlan = (id: string) => updateData((current) => ({ ...current, todayPlans: current.todayPlans.map((item) => item.id === id ? { ...item, status: item.status === 'done' ? 'todo' : 'done', updatedAt: isoNow() } : item) }))
  const markMemo = (id: string) => updateData((current) => ({ ...current, quickMemos: current.quickMemos.map((item) => item.id === id ? { ...item, processed: !item.processed, updatedAt: isoNow() } : item) }))

  return <>
    <PageHeader title="首页总览" subtitle={`${new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())}，先看看今天最重要的事。`} action={<button className="button primary" onClick={() => onNavigate('plans')}>查看今日计划</button>} />
    <div className="dashboard-top-grid">
      <section className="hero-card">
        <div className="hero-copy"><span className="eyebrow">TODAY'S FOCUS</span><h2>今天完成了 {doneCount} / {todayPlans.length} 件事</h2><p>{todayPlans.length === 0 ? '先安排一件今天最重要的事。' : doneCount === todayPlans.length ? '今天的计划全部完成了，做得不错。' : '按优先级推进，完成一件就轻松一点。'}</p></div>
        <div className="progress-ring" style={{ '--progress': `${todayPlans.length ? Math.round(doneCount / todayPlans.length * 100) : 0}%` } as React.CSSProperties}><strong>{todayPlans.length ? Math.round(doneCount / todayPlans.length * 100) : 0}%</strong><span>完成</span></div>
      </section>
      <section className="section-card memo-card"><div className="section-card-head"><div><h2>快速备忘</h2><span className="muted">先记下，再整理</span></div><button className="text-link" onClick={() => onNavigate('plans')}>整理计划 →</button></div><div className="memo-input"><input value={memo} onChange={(event) => setMemo(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addMemo() }} placeholder="写下一个想法…" /><button className="button primary" onClick={addMemo}>添加</button></div><div className="memo-list">{openMemos.length === 0 ? <span className="muted">还没有未处理的备忘。</span> : openMemos.map((item) => <label className="memo-row" key={item.id}><input type="checkbox" checked={item.processed} onChange={() => markMemo(item.id)} /><span>{item.content}</span></label>)}</div></section>
    </div>
    <div className="dashboard-grid">
      <section className="section-card"><div className="section-card-head"><div><h2>今日计划</h2><span className="muted">最重要的执行事项</span></div><button className="text-link" onClick={() => onNavigate('plans')}>全部计划 →</button></div>{todayPlans.length === 0 ? <EmptyState title="今天还没有计划" description="从一件最重要的事情开始。" /> : <div className="dashboard-plan-list">{todayPlans.slice(0, 6).map((plan) => <div className={`dashboard-plan-row ${plan.status === 'done' ? 'is-done' : ''}`} key={plan.id}><button className="check-button" aria-label={`完成${plan.title}`} onClick={() => togglePlan(plan.id)}>{plan.status === 'done' ? '✓' : ''}</button><div><strong>{plan.title}</strong><span>{plan.time || '今天'} · {plan.category || '未分类'}</span></div><StatusBadge tone={plan.priority === 'high' ? 'danger' : plan.status === 'done' ? 'success' : 'neutral'}>{plan.status === 'done' ? '已完成' : plan.priority === 'high' ? '高优先级' : '待处理'}</StatusBadge></div>)}</div>}</section>
      <section className="section-card"><div className="section-card-head"><div><h2>待处理事项</h2><span className="muted">需要你关注的地方</span></div><StatusBadge tone={attention.length ? 'warning' : 'success'}>{attention.length} 项</StatusBadge></div>{attention.length === 0 ? <EmptyState title="目前没有逾期或阻塞" description="可以安心继续推进今天的安排。" /> : <div className="attention-list">{attention.map((item) => <button key={`${item.module}-${item.id}`} onClick={() => onNavigate(item.module)}><span className="attention-dot" /><div><strong>{item.label}</strong><small>{item.meta}</small></div><span>→</span></button>)}</div>}</section>
    </div>
    <section className="module-summary-grid">
      <SummaryCard color="purple" title="自媒体" value={`${data.mediaContents.filter((item) => item.stage === 'ready').length} 条待发布`} description="看看哪些内容可以发出去了。" onClick={() => onNavigate('media')} />
      <SummaryCard color="cyan" title="开发工作" value={`${data.developmentProjects.filter((item) => item.status === 'active').length} 个进行中`} description={`${data.developmentTasks.filter((item) => item.status === 'blocked').length} 个阻塞任务`} onClick={() => onNavigate('development')} />
      <SummaryCard color="orange" title="咨询工作" value={`${data.consultingCases.filter((item) => item.status === 'follow_up').length} 个待跟进`} description="保持客户事项有下一步。" onClick={() => onNavigate('consulting')} />
      <SummaryCard color="green" title="健身计划" value={data.fitnessPlans.some((item) => item.date === today) ? '今天有训练' : '今天未安排'} description="记录训练，持续看到进步。" onClick={() => onNavigate('fitness')} />
      <SummaryCard color="yellow" title="饮食计划" value={`${data.dietPlans.filter((item) => item.date === today && item.status === 'planned').length} 餐待执行`} description="看看下一餐吃什么。" onClick={() => onNavigate('diet')} />
      <SummaryCard color="pink" title="游戏娱乐" value={`${data.entertainmentItems.filter((item) => item.status === 'playing').length} 个进行中`} description="留一点时间给喜欢的事。" onClick={() => onNavigate('entertainment')} />
    </section>
  </>
}

function SummaryCard({ color, title, value, description, onClick }: { color: string; title: string; value: string; description: string; onClick: () => void }) {
  return <button className={`summary-card summary-${color}`} onClick={onClick}><div className="summary-card-top"><span className="summary-dot" /><span>{title}</span><b>→</b></div><strong>{value}</strong><small>{description}</small></button>
}
