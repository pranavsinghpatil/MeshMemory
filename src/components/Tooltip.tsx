import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 500,
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    // Only show tooltip if content exists
    if (!content) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + scrollX + triggerRect.width / 2;
        y = triggerRect.top + scrollY - 8;
        break;
      case 'bottom':
        x = triggerRect.left + scrollX + triggerRect.width / 2;
        y = triggerRect.bottom + scrollY + 8;
        break;
      case 'left':
        x = triggerRect.left + scrollX - 8;
        y = triggerRect.top + scrollY + triggerRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + scrollX + 8;
        y = triggerRect.top + scrollY + triggerRect.height / 2;
        break;
    }

    setTooltipPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible && content) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible, position, content]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipClasses = () => {
    const baseClasses = 'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg pointer-events-none transition-opacity duration-200';
    
    const positionClasses = {
      top: 'transform -translate-x-1/2 -translate-y-full',
      bottom: 'transform -translate-x-1/2',
      left: 'transform -translate-x-full -translate-y-1/2',
      right: 'transform -translate-y-1/2'
    };

    return `${baseClasses} ${positionClasses[position]} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45';
    
    const arrowPositions = {
      top: 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2',
      left: 'left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2',
      right: 'right-full top-1/2 transform -translate-y-1/2 translate-x-1/2'
    };

    return `${baseClasses} ${arrowPositions[position]}`;
  };

  const tooltip = isVisible && content && (
    <div
      ref={tooltipRef}
      className={getTooltipClasses()}
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
      }}
    >
      {content}
      <div className={getArrowClasses()}></div>
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={className}
      >
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
}