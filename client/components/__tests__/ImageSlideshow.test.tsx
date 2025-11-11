import { render, screen, waitFor } from '@testing-library/react'
import { ImageSlideshow } from '../ImageSlideshow'

describe('ImageSlideshow', () => {
  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ]

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('renders all images', () => {
    render(<ImageSlideshow images={mockImages} />)
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(mockImages.length)
  })

  it('displays first image initially', () => {
    render(<ImageSlideshow images={mockImages} />)
    const firstImage = screen.getByAltText('Slide 1')
    expect(firstImage).toHaveClass('opacity-100')
  })

  it('cycles through images after interval', async () => {
    render(<ImageSlideshow images={mockImages} />)

    const firstImage = screen.getByAltText('Slide 1')
    const secondImage = screen.getByAltText('Slide 2')

    expect(firstImage).toHaveClass('opacity-100')
    expect(secondImage).toHaveClass('opacity-0')

    jest.advanceTimersByTime(3000)

    await waitFor(() => {
      expect(secondImage).toHaveClass('opacity-100')
    })
  })

  it('handles empty images array', () => {
    render(<ImageSlideshow images={[]} />)
    const images = screen.queryAllByRole('img')
    expect(images).toHaveLength(0)
  })
})
