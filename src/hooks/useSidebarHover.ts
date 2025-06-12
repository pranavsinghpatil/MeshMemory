import { useState, useEffect, useRef } from 'react';

interface UseSidebarHoverOptions {
  expandDelay?: number;
  collapseDelay?: number;
  initialState?: boolean;
}

export function useSidebarHover({
  expandDelay = 200,
  collapseDelay = 500,
  initialState = false
}: UseSidebarHoverOptions = {}) {
  const [isExpanded, setIsExpanded] = useState(initialState);
  const expandTimerRef = useRef<NodeJS.Timeout | null>(null);
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // Clear any pending collapse timer
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    // Set expand timer
    if (!isExpanded && !expandTimerRef.current) {
      expandTimerRef.current = setTimeout(() => {
        setIsExpanded(true);
        expandTimerRef.current = null;
      }, expandDelay);
    }
  };

  const handleMouseLeave = () => {
    // Clear any pending expand timer
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }

    // Set collapse timer
    if (isExpanded && !collapseTimerRef.current) {
      collapseTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
        collapseTimerRef.current = null;
      }, collapseDelay);
    }
  };

  // Force expand/collapse
  const expand = () => {
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    setIsExpanded(true);
  };

  const collapse = () => {
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    setIsExpanded(false);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current);
      }
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  return {
    isExpanded,
    handleMouseEnter,
    handleMouseLeave,
    expand,
    collapse
  };
}