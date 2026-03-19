import { createPortal } from 'react-dom'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

import type { GithubProject } from '../data/githubProjects'
import posthog from 'posthog-js'

// Reasonable “center panel” size for content.
const POP_W = 380
const POP_H = 260

type Vec2 = { x: number; y: number }

type FolderPopoverProps = {
  project: GithubProject
  origin: Vec2 // viewport coordinates (same coordinate system as getBoundingClientRect)
  onClose: () => void
}

export function FolderPopover({ project, origin, onClose }: FolderPopoverProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const closingRef = useRef(false)

  const card = useMemo(
    () => ({
      id: project.id,
      label: project.name,
      tag: project.tag,
      description: project.description,
      color: project.color,
      accent: project.accent,
      url: project.url,
    }),
    [project],
  )

  const close = useCallback(() => {
    posthog.capture('closed_popup', { property: "this card" })
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
      dependencies: [origin.x, origin.y, project.id],
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
          background:
            'linear-gradient(165deg, color-mix(in oklab, var(--surface-strong) 90%, white 10%), var(--surface))',
          border: '1px solid color-mix(in oklab, var(--line) 70%, transparent 30%)',
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(0,0,0,0.16)',
          backdropFilter: 'blur(12px) saturate(140%)',
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
              color: 'color-mix(in oklab, var(--sea-ink-soft) 92%, white 8%)',
              lineHeight: 1.6,
            }}
          >
            {card.description}
          </p>

          <div style={{ marginBottom: 14 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 999,
                border: `1px solid color-mix(in oklab, ${card.accent} 34%, var(--line))`,
                color: card.accent,
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {card.tag}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={close}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 9,
                border: `1.2px solid color-mix(in oklab, ${card.accent} 55%, var(--line))`,
                background: 'transparent',
                color: `color-mix(in oklab, ${card.accent} 70%, var(--sea-ink-soft) 30%)`,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 9,
                border: 'none',
                background: `linear-gradient(180deg, color-mix(in oklab, ${card.accent} 90%, white 10%), ${card.accent})`,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              Open repo &rarr;
            </a>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}

