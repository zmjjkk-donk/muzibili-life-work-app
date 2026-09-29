import { useMemo, useState } from 'react'
import { AppProvider, useApp } from './store/AppContext'
import { PageHeader } from './components/PageHeader'
import { StatusBadge } from './components/StatusBadge'
import { Modal } from './components/Modal'
import { DashboardPage } from './pages/DashboardPage'
import { TodayPlansPage } from './pages/TodayPlansPage'
import { MediaPage } from './pages/MediaPage'
import { DevelopmentPage } from './pages/DevelopmentPage'
import { ConsultingPage } from './pages/ConsultingPage'
import { FitnessPage } from './pages/FitnessPage'
import { DietPage } from './pages/DietPage'
import { EntertainmentPage } from './pages/EntertainmentPage'
import { SettingsPage } from './pages/SettingsPage'
import type { AppData } from './types'

export const navItems = [
  { id: 'dashboard', label: '首页总览', icon: '⌂' },
  { id: 'plans', label: '今日计划', icon: '✓' },
  { id: 'media', label: '自媒体', icon: '✦' },
  { id: 'development', label: '开发工作', icon: '⌘' },
  { id: 'consulting', label: '咨询工作', icon: '◌' },
  { id: 'fitness', label: '健身计划', icon: '♢' },
  { id: 'diet', label: '饮食计划', icon: '◒' },
  { id: 'entertainment', label: '游戏娱乐', icon: '◉' },
  { id: 'settings', label: '数据与设置', icon: '⚙' },
] as const

const titles = Object.fromEntries(navItems.map((item) => [item.id, item.label]))

function AppShell() {
  const [active, setActive] = useState('dashboard')
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data, fileName, saveStatus, lastSavedAt, error, clearError, connectFile } = useApp()

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return []
    const candidates: { module: string; label: string; id: string; text: string }[] = [
      ...data.todayPlans.map((item) => ({ module: 'plans', label: item.title, id: item.id, text: `${item.title} ${item.description}` })),
      ...data.quickMemos.map((item) => ({ module: 'dashboard', label: item.content, id: item.id, text: item.content })),
      ...data.mediaContents.map((item) => ({ module: 'media', label: item.title, id: item.id, text: `${item.title} ${item.body} ${item.notes}` })),
      ...data.developmentProjects.map((item) => ({ module: 'development', label: item.name, id: item.id, text: `${item.name} ${item.description}` })),
      ...data.developmentTasks.map((item) => ({ module: 'development', label: item.title, id: item.id, text: `${item.title} ${item.description} ${item.technicalNotes}` })),
      ...data.consultingClients.map((item) => ({ module: 'consulting', label: item.name, id: item.id, text: `${item.name} ${item.notes}` })),
      ...data.consultingCases.map((item) => ({ module: 'consulting', label: item.title, id: item.id, text: `${item.title} ${item.problem} ${item.conclusion}` })),
      ...data.fitnessPlans.map((item) => ({ module: 'fitness', label: item.type, id: item.id, text: `${item.type} ${item.description}` })),
      ...data.dietPlans.map((item) => ({ module: 'diet', label: item.food, id: item.id, text: `${item.food} ${item.notes}` })),
      ...data.entertainmentItems.map((item) => ({ module: 'entertainment', label: item.name, id: item.id, text: `${item.name} ${item.notes}` })),
    ]
    return candidates.filter((item) => item.text.toLowerCase().includes(query)).slice(0, 8)
  }, [data, search])

  const goTo = (id: string) => { setActive(id); setSearch('') }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">WL</div><div><strong>工作生活台</strong><span>个人本地工作台</span></div></div>
      <nav aria-label="主导航">
        <div className="nav-label">工作空间</div>
        {navItems.slice(0, 8).map((item) => <button key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => goTo(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span></button>)}
        <div className="nav-label nav-label-bottom">系统</div>
        <button className={`nav-item ${active === 'settings' ? 'active' : ''}`} onClick={() => goTo('settings')}><span className="nav-icon">⚙</span><span>数据与设置</span></button>
      </nav>
      <div className="sidebar-foot">
        <div className="file-chip"><span className={`save-dot ${saveStatus}`} /> <div><strong>{fileName ?? '尚未连接数据文件'}</strong><small>{saveStatus === 'saved' && lastSavedAt ? `已保存 ${new Date(lastSavedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : saveStatus === 'saving' ? '正在保存…' : '请选择或新建文件'}</small></div></div>
        {!fileName && <button className="text-button" onClick={() => void connectFile(false)}>打开数据文件</button>}
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="breadcrumbs"><span>我的工作生活</span><b>/</b><strong>{titles[active]}</strong></div>
        <div className="topbar-actions">
          <div className="search-wrap"><span>⌕</span><input aria-label="搜索" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索计划、项目和记录…" />{searchResults.length > 0 && <div className="search-results">{searchResults.map((result) => <button key={`${result.module}-${result.id}`} onClick={() => goTo(result.module)}><small>{titles[result.module]}</small><span>{result.label}</span></button>)}</div>}</div>
          <button className="button primary" onClick={() => setQuickAddOpen(true)}>＋ 快速添加</button>
        </div>
      </header>
      {error && <div className="global-error" role="alert"><span>{error}</span><button onClick={clearError}>×</button></div>}
      <div className="content-area">
        {active === 'dashboard' && <DashboardPage onNavigate={goTo} />}
        {active === 'plans' && <TodayPlansPage />}
        {active === 'media' && <MediaPage />}
        {active === 'development' && <DevelopmentPage />}
        {active === 'consulting' && <ConsultingPage />}
        {active === 'fitness' && <FitnessPage />}
        {active === 'diet' && <DietPage />}
        {active === 'entertainment' && <EntertainmentPage />}
        {active === 'settings' && <SettingsPage />}
      </div>
    </main>
    {quickAddOpen && <QuickAddModal onClose={() => setQuickAddOpen(false)} onNavigate={goTo} />}
  </div>
}

function QuickAddModal({ onClose, onNavigate }: { onClose: () => void; onNavigate: (id: string) => void }) {
  const options = [
    ['plans', '今日计划', '安排今天要做的事情'],
    ['dashboard', '快速备忘', '先记下来，之后再整理'],
    ['media', '自媒体选题', '记录一个内容想法'],
    ['development', '开发任务', '记录项目中的任务或问题'],
    ['consulting', '咨询记录', '记录一次咨询或跟进'],
    ['fitness', '健身记录', '安排训练或记录完成情况'],
    ['diet', '饮食记录', '记录今天的一餐'],
    ['entertainment', '游戏记录', '记录正在玩的内容'],
  ]
  return <Modal title="快速添加" onClose={onClose}><div className="quick-add-grid">{options.map(([id, title, description]) => <button key={id} className="quick-add-option" onClick={() => { onClose(); onNavigate(id) }}><strong>{title}</strong><span>{description}</span></button>)}</div></Modal>
}

export function App() { return <AppProvider><AppShell /></AppProvider> }

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return <><PageHeader title={title} subtitle={description} /><div className="placeholder-card"><StatusBadge tone="info">开发中</StatusBadge><h2>{title}工作区</h2><p>该页面的业务数据和交互将在对应开发阶段完成。</p></div></>
}
