import { createPortal } from 'react-dom'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

// Reasonable “center panel” size for content.
const POP_W = 380
const POP_H = 260

const TAGS = ['Design', 'Code', 'Data', 'Motion', 'API', 'UI'] as const
const COLORS = ['#e8f4ff', '#fff4e8', '#f4ffe8', '#ffe8f4', '#e8fff4', '#f0e8ff'] as const
const ACCENTS = ['#3b82f6', '#f97316', '#22c55e', '#ec4899', '#14b8a6', '#8b5cf6'] as const

type Vec2 = { x: number; y: number }

type FolderPopoverProps = {
  folderId: number
  origin: Vec2 // viewport coordinates (same coordinate system as getBoundingClientRect)
  onClose: () => void
}

function getCardForFolderId(folderId: number) {
  // Placeholder content deck; you can replace this with real folder metadata later.
  const mod = ((folderId % 72) + 72) % 72
  const paletteIndex = mod % 6
  return {
    id: mod,
    label: `Folder ${mod + 1}`,
    tag: TAGS[paletteIndex],
    color: COLORS[paletteIndex],
    accent: ACCENTS[paletteIndex],
  }
}

export function FolderPopover({ folderId, origin, onClose }: FolderPopoverProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const closingRef = useRef(false)

  const card = useMemo(() => getCardForFolderId(folderId), [folderId])

  const close = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true

    const panel = panelRef.current
    const backdrop = backdropRef.current
    if (!panel) {
      onClose()
      return
    }

    gsap.killTweensOf(panel)
    if (backdrop) gsap.killTweensOf(backdrop)

    const dirX = origin.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)
    const rotateZ =
      typeof window !== 'undefined'
        ? gsap.utils.clamp(dirX / (window.innerWidth / 2), -1, 1) * -5
        : 0

    const tl = gsap.timeline({
      onComplete: () => {
        onClose()
      },
    })

    if (backdrop) {
      tl.to(
        backdrop,
        {
          opacity: 0,
          duration: 0.18,
          ease: 'power1.in',
        },
        0,
      )
    }
    tl.to(
      panel,
      {
        scale: 0.08,
        opacity: 0,
        y: 10,
        rotateZ,
        duration: 0.22,
        ease: 'back.in(1.6)',
      },
      0,
    )
  }, [onClose, origin.x])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [close])

  useGSAP(
    () => {
      const panel = panelRef.current
      const backdrop = backdropRef.current
      if (!panel || !backdrop) return

      closingRef.current = false

      gsap.killTweensOf([panel, backdrop])

      // Measure while at its “rest” layout (scale: 1) so the origin math matches.
      const rect = panel.getBoundingClientRect()
      const originX = origin.x - rect.left
      const originY = origin.y - rect.top
      panel.style.transformOrigin = `${originX}px ${originY}px`

      const dirX = origin.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)
      const rotateZ =
        typeof window !== 'undefined'
          ? gsap.utils.clamp(dirX / (window.innerWidth / 2), -1, 1) * 6
          : 0

      gsap.set(backdrop, { opacity: 0 })
      // Start slightly “compressed” with a small tilt for a more alive feel.
      gsap.set(panel, { scale: 0.12, opacity: 0, y: 10, rotateZ })

      gsap.to(backdrop, {
        opacity: 1,
        duration: 0.18,
        ease: 'power1.out',
      })

      // Keep opacity in lockstep with the scale so it doesn't feel like a fade-only panel.
      const tl = gsap.timeline()
      tl.to(
        panel,
        {
          opacity: 1,
          y: 0,
          rotateZ: 0,
          duration: 0.28,
          ease: 'power2.out',
        },
        0,
      )
      tl.to(
        panel,
        {
          scale: 1,
          duration: 0.48,
          ease: 'back.out(1.9)',
        },
        0,
      )
    },
    {
      dependencies: [origin.x, origin.y, folderId],
      scope: panelRef,
    },
  )

  return createPortal(
    <>
      <div
        ref={backdropRef}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          close()
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(0,0,0,0.18)',
          opacity: 0,
        }}
      />

      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          translate: '-50% -50%',
          width: POP_W,
          willChange: 'transform, opacity',
          height: POP_H,
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.09)',
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          zIndex: 9999,
          overflow: 'hidden',
          opacity: 0,
        }}
      >
        <div
          style={{
            background: card.color,
            padding: '18px 20px 14px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: card.accent,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {card.id + 1}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#111',
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: card.accent,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                {card.tag}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px' }}>
          <p
            style={{
              margin: '0 0 14px',
              fontSize: 13,
              color: '#555',
              lineHeight: 1.6,
            }}
          >
            Popover is centered — but the <code style={{ background: '#f0f0f0', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>transform-origin</code>{' '}
            aims at the clicked folder so the bloom radiates from it.
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={close}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 9,
                border: `1.5px solid ${card.accent}`,
                background: 'transparent',
                color: card.accent,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={close}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 9,
                border: 'none',
                background: card.accent,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Open &rarr;
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}

