import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Tooltip from './Tooltip';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  isGroup?: boolean;
  groupId?: string;
  children?: NavItem[];
  action?: () => void;
  badge?: string;
  pro?: boolean;
  endpoint?: string;
}

interface SidebarNavItemProps {
  item: NavItem;
  active: boolean;
  expanded?: boolean;
  isGroupExpanded?: boolean;
  isDisabled?: boolean;
  isGuest: boolean;
  currentPathname: string;
  depth?: number;
  toggleGroup?: (groupId: string) => void;
  sidebarExpanded: boolean;
  onNavigate?: (item: NavItem) => void;
}

export default function SidebarNavItem({
  item,
  active,
  expanded: isGroupExpanded = false,
  isDisabled = false,
  isGuest,
  currentPathname,
  depth = 0,
  toggleGroup,
  sidebarExpanded,
  onNavigate
}: SidebarNavItemProps) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const indentClass = depth > 0 ? `pl-${(depth + 1) * 2}` : '';
  const navigate = useNavigate();
  
  // Determine if this is an action button, group header, or regular link
  if (item.action) {
    return (
      <Tooltip
        content={!sidebarExpanded ? item.name : ''}
        position="right"
        delay={300}
      >
        <button
          onClick={() => {
            if (!isDisabled && item.action) {
              item.action();
            }
          }}
          disabled={isDisabled}
          className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors sidebar-item ${
            active
              ? 'active text-[#3B3B1A] dark:text-[#EAEFEF] bg-[#E7EFC7]/50 dark:bg-[#333446]/70'
              : isDisabled
              ? 'text-[#8A784E]/50 dark:text-[#B8CFCE]/50 cursor-not-allowed'
              : 'text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7]/30 dark:hover:bg-[#333446]/50'
          } ${!sidebarExpanded ? 'justify-center' : ''} ${indentClass}`}
        >
          <Icon className={`${!sidebarExpanded ? '' : 'mr-3'} h-5 w-5 ${active ? 'text-[#3B3B1A] dark:text-[#EAEFEF]' : 'text-[#8A784E] dark:text-[#B8CFCE]'}`} />
          {sidebarExpanded && (
            <span className="flex-1">{item.name}</span>
          )}
          {sidebarExpanded && isDisabled && (
            <span className="ml-auto text-xs bg-[#AEC8A4]/30 dark:bg-[#333446]/50 text-[#8A784E] dark:text-[#B8CFCE] px-2 py-0.5 rounded-full">
              Pro
            </span>
          )}
        </button>
      </Tooltip>
    );
  } else if (item.isGroup) {
    return (
      <div>
        <Tooltip
          content={!sidebarExpanded ? item.name : ''}
          position="right"
          delay={300}
        >
          <button
            onClick={() => toggleGroup && item.groupId && toggleGroup(item.groupId)}
            className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors sidebar-item
              text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7]/30 dark:hover:bg-[#333446]/50
              ${!sidebarExpanded ? 'justify-center' : ''} ${indentClass}`}
          >
            <Icon className={`${!sidebarExpanded ? '' : 'mr-3'} h-5 w-5 text-[#8A784E] dark:text-[#B8CFCE]`} />
            {sidebarExpanded && (
              <>
                <span className="flex-1">{item.name}</span>
                {hasChildren && (
                  <ChevronDown 
                    className={`h-4 w-4 text-[#8A784E] dark:text-[#B8CFCE] transition-transform duration-200 ${
                      isGroupExpanded ? '' : 'transform -rotate-90'
                    }`} 
                  />
                )}
              </>
            )}
          </button>
        </Tooltip>
        
        {hasChildren && (
          <div className={`nav-group ${isGroupExpanded ? 'expanded' : 'nav-group-collapsed'} overflow-hidden transition-all duration-200`} 
               style={{ 
                 maxHeight: sidebarExpanded && isGroupExpanded ? `${(item.children?.length || 0) * 36}px` : '0px',
                 opacity: sidebarExpanded && isGroupExpanded ? 1 : 0 
               }}>
            <div className="ml-2 pl-3 border-l border-[#AEC8A4]/30 dark:border-[#7F8CAA]/30 space-y-1 py-1">
              {item.children && item.children.map((child, index) => (
                <SidebarNavItem
                  key={`${child.name}-${index}`}
                  item={child}
                  active={child.href ? currentPathname.startsWith(child.href) : false}
                  expanded={isGroupExpanded}
                  isGuest={isGuest}
                  currentPathname={currentPathname}
                  depth={depth + 1}
                  toggleGroup={toggleGroup}
                  sidebarExpanded={sidebarExpanded}
                  isDisabled={isDisabled || (isGuest && !!child.pro)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <Tooltip
        content={!sidebarExpanded ? item.name : ''}
        position="right"
        delay={300}
      >
        <button
          onClick={() => {
            if (!isDisabled) {
              if (item.href) {
                navigate(item.href);
              } else if (onNavigate) {
                onNavigate(item);
              }
            }
          }}
          className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors sidebar-item ${
            active
              ? 'active text-[#3B3B1A] dark:text-[#EAEFEF] bg-[#E7EFC7]/50 dark:bg-[#333446]/70'
              : isDisabled
              ? 'text-[#8A784E]/50 dark:text-[#B8CFCE]/50 cursor-not-allowed'
              : 'text-[#3B3B1A] dark:text-[#EAEFEF] hover:bg-[#E7EFC7]/30 dark:hover:bg-[#333446]/50'
          } ${!sidebarExpanded ? 'justify-center' : ''} ${indentClass}`}
          disabled={isDisabled}
        >
          <Icon className={`${!sidebarExpanded ? '' : 'mr-3'} h-5 w-5 ${active ? 'text-[#3B3B1A] dark:text-[#EAEFEF]' : 'text-[#8A784E] dark:text-[#B8CFCE]'}`} />
          {sidebarExpanded && (
            <span className="flex-1">{item.name}</span>
          )}
          {sidebarExpanded && item.badge && (
            <span className="ml-auto px-2 py-0.5 text-xs bg-[#E7EFC7]/30 dark:bg-[#333446]/40 text-[#3B3B1A] dark:text-[#EAEFEF] rounded-full">
              {item.badge}
            </span>
          )}
          {sidebarExpanded && isDisabled && (
            <span className="ml-auto text-xs bg-[#AEC8A4]/30 dark:bg-[#333446]/50 text-[#8A784E] dark:text-[#B8CFCE] px-2 py-0.5 rounded-full">
              Pro
            </span>
          )}
        </button>
      </Tooltip>
    );
  }
}