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
}

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
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
  isActive,
  isExpanded,
  isGroupExpanded = false,
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
            isActive
              ? 'bg-indigo-500/30 text-white active'
              : isDisabled
              ? 'text-indigo-300/50 dark:text-indigo-300/50 cursor-not-allowed'
              : 'text-white hover:bg-indigo-500/30 hover:text-white'
          } ${!sidebarExpanded ? 'justify-center' : ''} ${indentClass}`}
        >
          <Icon className={`${!sidebarExpanded ? '' : 'mr-3'} h-5 w-5 ${isActive ? 'text-white' : 'text-indigo-200'}`} />
          {sidebarExpanded && (
            <span className="flex-1">{item.name}</span>
          )}
          {sidebarExpanded && isDisabled && (
            <span className="ml-auto text-xs bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full">
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
              text-white hover:bg-indigo-500/30 hover:text-white
              ${!sidebarExpanded ? 'justify-center' : ''} ${indentClass}`}
          >
            <Icon className={`${!sidebarExpanded ? '' : 'mr-3'} h-5 w-5 text-indigo-200`} />
            {sidebarExpanded && (
              <>
                <span className="flex-1">{item.name}</span>
                {hasChildren && (
                  <ChevronDown 
                    className={`h-4 w-4 text-indigo-200 transition-transform duration-200 ${
                      isGroupExpanded ? '' : 'transform -rotate-90'
                    }`} 
                  />
                )}
              </>
            )}
          </button>
        </Tooltip>
        
        {sidebarExpanded && hasChildren && (
          <div className={`nav-group ${isGroupExpanded ? 'nav-group-expanded' : 'nav-group-collapsed'}`}>
            <div className="ml-2 pl-3 border-l border-indigo-500/30 space-y-1 py-1">
              {item.children && item.children.map((child, index) => (
                <SidebarNavItem
                  key={`${child.name}-${index}`}
                  item={child}
                  isActive={isActive && child.href ? currentPathname === child.href : false}
                  isExpanded={isExpanded}
                  isGuest={isGuest}
                  currentPathname={currentPathname}
                  depth={depth + 1}
                  toggleGroup={toggleGroup}
                  sidebarExpanded={sidebarExpanded}
                  isDisabled={isDisabled || (isGuest && child.pro)}
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
            isActive
              ? 'bg-indigo-500/30 text-white active'
              : isDisabled
              ? 'text-indigo-300/50 dark:text-indigo-300/50 cursor-not-allowed'
              : 'text-white hover:bg-indigo-500/30 hover:text-white'
          } ${!sidebarExpanded ? 'justify-center' : ''} ${indentClass}`}
          disabled={isDisabled}
        >
          <Icon className={`${!sidebarExpanded ? '' : 'mr-3'} h-5 w-5 ${isActive ? 'text-white' : 'text-indigo-200'}`} />
          {sidebarExpanded && (
            <span className="flex-1">{item.name}</span>
          )}
          {sidebarExpanded && item.badge && (
            <span className="ml-auto px-2 py-0.5 text-xs bg-green-500/30 text-green-100 rounded-full">
              {item.badge}
            </span>
          )}
          {sidebarExpanded && isDisabled && (
            <span className="ml-auto text-xs bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full">
              Pro
            </span>
          )}
        </button>
      </Tooltip>
    );
  }
}