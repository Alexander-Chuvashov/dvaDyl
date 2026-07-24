import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    children: React.ReactNode;
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number; // задержка перед появлением (мс)
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
    children,
    text,
    position = 'top',
    delay = 300,
    className = '',
}) => {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const childRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);

    const showTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (childRef.current) {
                const rect = childRef.current.getBoundingClientRect();
                let x = rect.left + rect.width / 2;
                let y = rect.top;
                if (position === 'top') y = rect.top - 8;
                else if (position === 'bottom') y = rect.bottom + 8;
                else if (position === 'left') {
                    x = rect.left - 8;
                    y = rect.top + rect.height / 2;
                } else if (position === 'right') {
                    x = rect.right + 8;
                    y = rect.top + rect.height / 2;
                }
                setCoords({ x, y });
                setVisible(true);
            }
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <>
            <div
                ref={childRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                className={`inline-block ${className}`}
            >
                {children}
            </div>
            {visible &&
                createPortal(
                    <div
                        className="fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md shadow-lg pointer-events-none whitespace-nowrap"
                        style={{
                            left: coords.x,
                            top: coords.y,
                            transform: 'translate(-50%, -100%)',
                            ...(position === 'bottom' && {
                                transform: 'translate(-50%, 8px)',
                            }),
                            ...(position === 'left' && {
                                transform: 'translate(-100%, -50%)',
                            }),
                            ...(position === 'right' && {
                                transform: 'translate(8px, -50%)',
                            }),
                        }}
                    >
                        {text}
                        <div
                            className="absolute w-2 h-2 rotate-45 bg-gray-800"
                            style={{
                                bottom: '-4px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                ...(position === 'bottom' && {
                                    top: '-4px',
                                    bottom: 'auto',
                                }),
                                ...(position === 'left' && {
                                    top: '50%',
                                    left: 'auto',
                                    right: '-4px',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                }),
                                ...(position === 'right' && {
                                    top: '50%',
                                    left: '-4px',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                }),
                            }}
                        />
                    </div>,
                    document.body,
                )}
        </>
    );
};

export default Tooltip;
