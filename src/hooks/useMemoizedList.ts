import { useMemo } from 'react';

export function useMemoizedList<T>(
  items: T[],
  keyExtractor: (item: T) => string | number,
  dependencies: any[] = []
) {
  return useMemo(() => {
    return items.map((item, index) => ({
      ...item,
      _key: keyExtractor(item),
      _index: index
    }));
  }, [items, keyExtractor, ...dependencies]);
}

export function useMemoizedSearch<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  dependencies: any[] = []
) {
  return useMemo(() => {
    if (!searchTerm.trim()) return items;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowercaseSearch);
        }
        return false;
      });
    });
  }, [items, searchTerm, searchFields, ...dependencies]);
}

export function useMemoizedSort<T>(
  items: T[],
  sortKey: keyof T,
  sortDirection: 'asc' | 'desc' = 'asc',
  dependencies: any[] = []
) {
  return useMemo(() => {
    return [...items].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortKey, sortDirection, ...dependencies]);
}