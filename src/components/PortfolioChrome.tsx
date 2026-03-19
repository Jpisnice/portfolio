import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useMemo, useRef, useState } from 'react'

import { LiquidGlass } from './LiquidGlass'

function MagnifierIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16.2 16.2 21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M6.5 10.5V18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M6.5 7.3v.1"
        stroke="currentColor"
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      <path
        d="M11 18v-4.2c0-2.2 2.8-2.4 2.8 0V18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 10.5V18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M4 4h16v16H4z"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.15"
      />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M9 19c-4 1.5-4-2-5-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 19v-3.2c0-.9.3-1.5.8-2-2.6-.3-5.4-1.3-5.4-5.8 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3 .1.9-.2 1.9-.3 2.9-.3 1 0 2 .1 2.9.3 2.1-.4 3-.1 3-.1.6 1.6.2 2.8.1 3.1.7.8 1.1 1.8 1.1 3 0 4.5-2.8 5.5-5.4 5.8.5.5.8 1.2.8 2V19"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M4.5 7.5h15v10h-15z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5.2 8.2 12 13l6.8-4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3.5v2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 18.3v2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3.5 12h2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18.3 12h2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m6 6 1.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m16.4 16.4 1.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m18 6-1.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.6 16.4 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M20 14.5a8.5 8.5 0 1 1-10.5-10.4 7 7 0 1 0 10.5 10.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
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
    document.documentElement.setAttribute('data-theme', nextTheme)
    localStorage.setItem('theme', nextTheme)
    setTheme(nextTheme)
  }

  const socials = useMemo(
    () => [
      {
        key: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/your-handle',
        icon: <LinkedInIcon />,
      },
      {
        key: 'github',
        label: 'GitHub',
        href: 'https://github.com/your-handle',
        icon: <GithubIcon />,
      },
      {
        key: 'email',
        label: 'Email',
        href: 'mailto:your-email@example.com',
        icon: <EmailIcon />,
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
              <MagnifierIcon />
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
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
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

