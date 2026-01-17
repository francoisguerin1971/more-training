import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader } from './Card';

describe('Card Component', () => {
    it('renders children correctly', () => {
        render(
            <Card>
                <div data-testid="child">Test Content</div>
            </Card>
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<Card className="custom-class">Content</Card>);
        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders CardHeader with title and subtitle', () => {
        render(
            <CardHeader
                title="Main Title"
                subtitle="Description text"
            />
        );
        expect(screen.getByText('Main Title')).toBeInTheDocument();
        expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('renders CardHeader action element', () => {
        render(
            <CardHeader
                title="Title"
                action={<button data-testid="action-btn">Click me</button>}
            />
        );
        expect(screen.getByTestId('action-btn')).toBeInTheDocument();
    });
});
