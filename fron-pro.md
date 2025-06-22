# MeshMemory Frontend Generation Prompt

## Project Overview
Design and implement a modern, engaging frontend for **MeshMemory**, a collaborative chat and analytics platform. The frontend must connect directly to the backend REST API endpoints, support real-time features, and deliver a seamless experience across all core pages. The UI must strictly adhere to the specified rebranding, color palettes, and accessibility standards.

---

## Backend Connectivity
- **API Integration:**
  - Use RESTful API calls (e.g., `fetch`, `axios`) to connect to backend endpoints for authentication, chat, analytics, workspace, and settings.
  - All sidebar and navbar actions must trigger corresponding backend calls or navigation.
  - Handle authentication tokens (JWT or session) securely in all requests.
  - Use WebSockets (if available) for real-time chat/message updates.

- **Connective Elements:**
  - **User Auth:** Login, signup, and session management must sync with backend user endpoints.
  - **Chat/Groups:** Fetch, create, join, and manage chat groups and conversations via backend APIs.
  - **Analytics:** Pull analytics data from backend analytics endpoints.
  - **Settings:** Read and persist user and workspace settings to backend.
  - **Sidebar/Nav:** Navigation items must reflect backend state (e.g., unread counts, group memberships).

---

## Color Palette
- **Dark Theme:**
  - Background: `#333446`
  - Accent: `#7F8CAA`
  - Secondary: `#B8CFCE`
  - Foreground/Text: `#EAEFEF`
- **Light Theme:**
  - Background: `#E7EFC7`
  - Accent: `#AEC8A4`
  - Secondary: `#8A784E`
  - Foreground/Text: `#3B3B1A`
- Support instant dark/light mode switching throughout the app.

---

## Sidebar Elements
The sidebar must be visually distinct, collapsible, and support the following navigation items:
- **Dashboard** (Home)
- **Chats** (All conversations)
- **Chat Groups** (List & manage groups)
- **Thread Groups** (List & manage thread groups)
- **Analytics** (User/workspace analytics)
- **Search** (Enhanced and basic search)
- **Settings** (User & workspace settings)
- **Help** (Help/FAQ)
- **Future Features** (Roadmap, coming soon)
- **Team Workspace** (Team management)

Sidebar items must:
- Show active state and badges (e.g., unread counts)
- Support grouping and collapse/expand
- Use tooltips when collapsed
- Trigger backend calls or navigation as appropriate

---

## Navbar Elements
- Prominent branding ("MeshMemory"), logo, and page title
- Search bar (global and context-aware)
- Theme toggle (dark/light)
- User menu (profile, logout, etc.)
- Responsive hamburger menu for mobile

---

## Pages to Implement (Each & Every Page)

### 1. **LandingPage**
- Welcome, onboarding, and call-to-action for signup/login
- Branding, feature highlights, and quick tour

### 2. **Dashboard**
- User workspace overview
- Recent activity, pinned chats, quick actions

### 3. **ChatsPage**
- List all conversations
- Start new chat, search/filter, show unread indicators

### 4. **ChatGroupsPage**
- List all chat groups, join/create group, show member avatars

### 5. **ChatGroupDetailPage**
- Conversation view for a specific group
- Show messages, members, group actions

### 6. **ThreadGroupsPage**
- List all thread groups, join/create, show participation

### 7. **ThreadGroupDetailPage**
- Threaded conversation view for a specific group

### 8. **ConversationView**
- Detailed chat view for a single conversation
- Real-time message updates, attachments, reactions

### 9. **AnalyticsPage**
- User/workspace analytics dashboard
- Charts, usage stats, mood analysis, etc.

### 10. **EnhancedSearchPage**
- Advanced search with filters, highlights, and backend-powered results

### 11. **SearchPage**
- Basic search interface for messages, users, groups

### 12. **SettingsPage**
- User and workspace settings
- Profile, notifications, integrations, experimental features

### 13. **HelpPage**
- FAQ, help articles, support contact

### 14. **FutureFeatures**
- Roadmap, upcoming features, experimental toggles

### 15. **TeamWorkspacePage**
- Team management, invites, roles, permissions

---

## UI/UX Requirements
- Responsive and mobile-first design
- Smooth transitions for sidebar/nav and page changes
- Consistent use of color palette and branding
- Accessibility: proper contrast, keyboard navigation, ARIA labels
- Show loading states, error handling, and empty states
- Engaging, modern, and minimalistic visual style

---

## Prompt Example
> "Generate a complete, modern React + TypeScript frontend for MeshMemory, featuring all pages listed above. The UI must connect to the backend REST API for all data and actions, use the specified color palette for dark/light mode, and implement a collapsible sidebar and prominent navbar as described. Each page must be implemented and fully functional, with real backend connectivity, state management, and responsive/adaptive design. Sidebar/nav actions must trigger backend calls or navigation. All code should be accessible, maintainable, and production-ready."

---

**Use this prompt to generate a fully connected, beautiful, and engaging frontend for MeshMemory!**
