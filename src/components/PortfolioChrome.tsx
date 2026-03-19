import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useMemo, useRef, useState } from 'react'

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

export function PortfolioChrome() {
  const searchRef = useRef<HTMLDivElement | null>(null)
  const socialsRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [query, setQuery] = useState('')

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
        <div
          ref={searchRef}
          style={{ pointerEvents: 'auto' }}
          className="portfolio-search glass-frost"
        >
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
        </div>

        <div ref={socialsRef} className="portfolio-socials" style={{ pointerEvents: 'auto' }}>
          {socials.map((s) => (
            <a
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="portfolio-social-btn glass-frost glass-frost-hover"
              aria-label={s.label}
            >
              <span className="portfolio-social-icon" aria-hidden="true">
                {s.icon}
              </span>
              <span className="portfolio-social-label">{s.label}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}

