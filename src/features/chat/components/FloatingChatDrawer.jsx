import React, { useState, useEffect, useRef } from 'react'
import { Drawer, Tooltip } from 'antd'
import { MessageFilled } from '@ant-design/icons'
import UniversalLiveChat from './UniversalLiveChat'

export default function FloatingChatDrawer() {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef(null)
  const dragStartRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0, moved: false })

  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    setIsDragging(true)
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
      moved: false,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      const deltaX = e.clientX - dragStartRef.current.startX
      const deltaY = e.clientY - dragStartRef.current.startY

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragStartRef.current.moved = true
      }

      setPosition({
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY,
      })
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const handleClick = () => {
    if (!dragStartRef.current.moved) {
      setOpen(true)
    }
  }

  return (
    <>
      <style>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .animate-subtle-float {
          animation: subtleFloat 2.8s ease-in-out infinite;
        }
      `}</style>

      {/* Floating & Draggable launcher button at bottom-right of viewport */}
      <div
        ref={dragRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          touchAction: 'none',
        }}
        className="fixed bottom-6 right-6 z-50 select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <Tooltip title="Open Real-time Live Chat (Drag to reposition)" placement="left">
          <button
            type="button"
            onClick={handleClick}
            className={`w-14 h-14 rounded-full bg-gradient-to-tr from-[#8C4BFF] via-[#702BE0] to-[#30D2BE] text-white shadow-2xl hover:shadow-[0_12px_28px_rgba(140,75,255,0.6)] hover:scale-105 active:scale-95 transition-shadow duration-300 flex items-center justify-center text-2xl border-2 border-white/30 group relative ${
              isDragging ? '' : 'animate-subtle-float'
            }`}
          >
            <MessageFilled className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </button>
        </Tooltip>
      </div>

      {/* Slide-in Live Chat Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-extrabold text-sm text-slate-800 dark:text-white">ZealthOS Live Chat Widget</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8C4BFF]/10 text-[#8C4BFF] font-bold">
              Real-time Active
            </span>
          </div>
        }
        placement="right"
        size={780}
        onClose={() => setOpen(false)}
        open={open}
        styles={{ body: { padding: 0, overflow: 'hidden' } }}
        className="dark:bg-slate-900"
      >
        {open && <UniversalLiveChat isDrawer={true} />}
      </Drawer>
    </>
  )
}

