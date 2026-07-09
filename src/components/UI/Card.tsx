// src/components/UI/Card.tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div className={cn('card p-6', className)} {...props}>
            {children}
        </div>
    );
};

export default Card;
