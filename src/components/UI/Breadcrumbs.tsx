// src/components/UI/Breadcrumbs.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="flex flex-wrap items-center gap-1 mb-4 text-sm text-dark/60">
            <Link
                to="/"
                className="flex items-center gap-1 transition-colors hover:text-terracotta"
            >
                <Home className="w-4 h-4" />
                <span>Главная</span>
            </Link>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="w-4 h-4" />
                    {item.path ? (
                        <Link
                            to={item.path}
                            className="transition-colors hover:text-terracotta"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-dark">
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
