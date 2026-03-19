import { forwardRef, useId } from 'react'

type LiquidGlassProps<TAs extends React.ElementType = 'div'> = {
  as?: TAs
  hoverable?: boolean
  /**
   * Adds a subtle turbulence/displacement “liquid” layer on top of the blurred glass.
   * You still get the real background-peek-through via the existing `.glass-frost` CSS.
   */
  distort?: boolean
  className?: string
  children?: React.ReactNode
} & Omit<
  React.ComponentPropsWithoutRef<TAs>,
  'as' | 'className' | 'children' | 'hoverable' | 'distort'
>

function normalizeId(value: string) {
  // SVG id attributes are more forgiving than CSS `url(#...)`, but keep it safe.
  return value.replace(/[^a-zA-Z0-9_-]/g, '-')
}

export const LiquidGlass = forwardRef(function LiquidGlassInner<TAs extends React.ElementType = 'div'>(
  props: LiquidGlassProps<TAs>,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const {
    as,
    hoverable = false,
    distort = true,
    className,
    children,
    ...rest
  } = props

  const Comp = (as ?? 'div') as React.ElementType

  const reactId = useId()
  const filterId = normalizeId(`liquidGlassFilter-${reactId}`)
  const gradientId = normalizeId(`liquidGlassGradient-${reactId}`)

  return (
    <Comp
      ref={ref}
      className={[
        'glass-frost',
        hoverable ? 'glass-frost-hover' : '',
        // Make sure our distortion layer is clipped to the surface.
        'relative overflow-hidden isolation-isolate',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {distort && (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        >
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" seed="2" result="turb" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="turb"
                scale="14"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>

            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.22)" />
              <stop offset="48%" stopColor="rgba(79, 184, 178, 0.18)" />
              <stop offset="100%" stopColor="rgba(47, 106, 74, 0.16)" />
            </linearGradient>
          </defs>

          {/* A displaced highlight layer to mimic “liquid” frosted glass */}
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill={`url(#${gradientId})`}
            filter={`url(#${filterId})`}
            opacity="0.4"
            style={{ mixBlendMode: 'overlay' }}
          />
        </svg>
      )}

      {children}
    </Comp>
  )
})

