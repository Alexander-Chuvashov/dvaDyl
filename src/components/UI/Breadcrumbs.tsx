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
        <nav className="flex flex-wrap items-center gap-1 mb-4 overflow-x-auto text-xs sm:text-sm text-secondary/60 scrollbar-hide">
            <Link
                to="/"
                className="flex items-center gap-1 transition-colors hover:text-gold shrink-0"
            >
                <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Главная</span>
            </Link>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                    {item.path ? (
                        <Link
                            to={item.path}
                            className="hover:text-gold transition-colors truncate max-w-[100px] sm:max-w-[200px]"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-primary font-medium truncate max-w-[120px] sm:max-w-[200px]">
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
