import type { ReactNode } from 'react'

export function Drawer({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
      <div className="drawer-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="关闭">×</button></div>
      <div className="drawer-body">{children}</div>
    </aside>
  </div>
}
