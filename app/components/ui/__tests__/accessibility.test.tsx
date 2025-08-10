import React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button, PrimaryButton, IconButton } from '../Button'
import { Card, GlassCard, CardHeader, CardContent } from '../Card'
import { GradientText } from '../GradientText'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../Modal'
import { Settings } from 'lucide-react'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  describe('Button Components', () => {
    it('Button should have no accessibility violations', async () => {
      const { container } = render(
        <Button>Click me</Button>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('PrimaryButton should have no accessibility violations', async () => {
      const { container } = render(
        <PrimaryButton>Primary Action</PrimaryButton>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('IconButton with aria-label should have no accessibility violations', async () => {
      const { container } = render(
        <IconButton icon={Settings} aria-label="Settings" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Disabled button should have no accessibility violations', async () => {
      const { container } = render(
        <Button disabled>Disabled Button</Button>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Loading button should have no accessibility violations', async () => {
      const { container } = render(
        <Button isLoading>Loading</Button>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Card Components', () => {
    it('Card should have no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader title="Card Title" subtitle="Card subtitle" />
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
        </Card>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('GlassCard should have no accessibility violations', async () => {
      const { container } = render(
        <GlassCard>
          <p>Glass card content</p>
        </GlassCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('GradientText Component', () => {
    it('GradientText as span should have no accessibility violations', async () => {
      const { container } = render(
        <p>This is <GradientText>gradient text</GradientText> in a paragraph</p>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('GradientText as heading should have no accessibility violations', async () => {
      const { container } = render(
        <GradientText as="h1">Gradient Heading</GradientText>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Modal Component', () => {
    it('Modal with title should have no accessibility violations', async () => {
      const { container } = render(
        <Modal 
          isOpen={true} 
          onClose={() => {}}
          title="Modal Title"
          subtitle="Modal subtitle"
        >
          <p>Modal content</p>
        </Modal>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Modal with structured content should have no accessibility violations', async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}}>
          <ModalHeader title="Structured Modal" onClose={() => {}} />
          <ModalBody>
            <p>Body content</p>
          </ModalBody>
          <ModalFooter>
            <Button>Cancel</Button>
            <PrimaryButton>Confirm</PrimaryButton>
          </ModalFooter>
        </Modal>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Form Components', () => {
    it('Form with buttons should have no accessibility violations', async () => {
      const { container } = render(
        <form>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
          
          <label htmlFor="password">Password</label>
          <input id="password" type="password" />
          
          <Button type="submit">Submit</Button>
          <Button type="reset" variant="secondary">Reset</Button>
        </form>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Complex Compositions', () => {
    it('Card with interactive elements should have no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader 
            title="Interactive Card"
            action={<IconButton icon={Settings} aria-label="Card settings" />}
          />
          <CardContent>
            <p>Card with various interactive elements</p>
            <div className="flex gap-2">
              <PrimaryButton>Primary</PrimaryButton>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </CardContent>
        </Card>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Modal with form should have no accessibility violations', async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Form Modal">
          <form>
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" type="text" required />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required />
            </div>
            <ModalFooter>
              <Button type="button" variant="secondary">Cancel</Button>
              <PrimaryButton type="submit">Save</PrimaryButton>
            </ModalFooter>
          </form>
        </Modal>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})