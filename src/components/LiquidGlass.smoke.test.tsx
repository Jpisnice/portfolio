import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'

import { LiquidGlass } from './LiquidGlass'

describe('LiquidGlass', () => {
  it('renders a button without crashing', () => {
    const html = renderToString(
      <LiquidGlass as="button" type="button" hoverable distort={false}>
        Click
      </LiquidGlass>,
    )

    expect(html).toContain('glass-frost')
  })
})

