import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders loading spinner', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('ANALYZING IMAGE')).toBeInTheDocument()
  })

  it('displays processing message', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText(/Processing your image with computer vision/i)).toBeInTheDocument()
  })

  it('renders spinner icon', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
