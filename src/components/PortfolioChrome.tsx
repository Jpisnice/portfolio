import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Github, Linkedin, Mail, Moon, Search, Sun } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { LiquidGlass } from './LiquidGlass'

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void) => { finished: Promise<void> }
}

export function PortfolioChrome() {
  const searchRef = useRef<HTMLDivElement | null>(null)
  const socialsRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const root = document.documentElement
    const storedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const nextTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : prefersDark ? 'dark' : 'light'

    root.setAttribute('data-theme', nextTheme)
    setTheme(nextTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    const applyTheme = () => {
      document.documentElement.setAttribute('data-theme', nextTheme)
      localStorage.setItem('theme', nextTheme)
      setTheme(nextTheme)
    }

    const docWithTransition = document as DocumentWithViewTransition
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && docWithTransition.startViewTransition) {
      docWithTransition.startViewTransition(applyTheme)
      return
    }

    applyTheme()
  }

  const socials = useMemo(
    () => [
      {
        key: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/your-handle',
        icon: <Linkedin size={18} strokeWidth={1.8} />,
      },
      {
        key: 'github',
        label: 'GitHub',
        href: 'https://github.com/your-handle',
        icon: <Github size={18} strokeWidth={1.8} />,
      },
      {
        key: 'email',
        label: 'Email',
        href: 'mailto:your-email@example.com',
        icon: <Mail size={18} strokeWidth={1.8} />,
      },
    ],
    [],
  )

  useGSAP(() => {
    const searchEl = searchRef.current
    const socialsEl = socialsRef.current
    if (!searchEl || !socialsEl) return

    gsap.set([searchEl, socialsEl], { opacity: 0 })

    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .to(searchEl, { opacity: 1, y: 0, duration: 0.55 }, 0)
      .fromTo(
        socialsEl,
        { opacity: 0, y: 10, x: 8, rotateZ: -1 },
        { opacity: 1, y: 0, x: 0, rotateZ: 0, duration: 0.52 },
        0.08,
      )
  }, [])

  return (
    <>
      {/* Keep interaction only on the actual UI surfaces */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 50,
        }}
        aria-hidden={false}
      >
        <LiquidGlass ref={searchRef} distort={false} as="div" style={{ pointerEvents: 'auto' }} className="portfolio-search">
          <div className="portfolio-search-inner">
            <span className="portfolio-search-icon" aria-hidden="true">
              <Search size={18} strokeWidth={1.8} />
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              aria-label="Search projects"
              className="portfolio-search-input"
            />
          </div>
        </LiquidGlass>

        <LiquidGlass
          as="button"
          type="button"
          className="portfolio-theme-toggle"
          style={{ pointerEvents: 'auto' }}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          hoverable
        >
          <span className="portfolio-theme-icon" aria-hidden="true">
            {theme === 'dark' ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
          </span>
        </LiquidGlass>

        <div ref={socialsRef} className="portfolio-socials" style={{ pointerEvents: 'auto' }}>
          {socials.map((s) => (
            <LiquidGlass
              as="a"
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="portfolio-social-btn"
              hoverable
              aria-label={s.label}
            >
              <span className="portfolio-social-icon" aria-hidden="true">
                {s.icon}
              </span>
              <span className="portfolio-social-label">{s.label}</span>
            </LiquidGlass>
          ))}
        </div>
      </div>
    </>
  )
}

