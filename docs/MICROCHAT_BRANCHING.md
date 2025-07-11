# Microchat Branching: Feature Specification

## Overview

Microchat Branching enables users to create contextual sub-conversations from any point in a main chat thread. This feature allows users to explore tangential ideas, deep-dive into specific topics, or refine particular aspects of a conversation without losing the context or cluttering the main discussion.

## Core Concept

Rather than forcing users to choose between continuing a linear conversation or starting an entirely new one, Microchat Branching offers a middle path: **contextual branches** that inherit the full context of their parent conversation up to the branching point.

## Implementation Status

✅ **Backend**: Complete - Database schema, service methods, and API endpoints have been implemented
⬜ **Frontend**: Pending - UI components and interactions are still in development

## 🎯 Feature Components

### 1. Visual Thread Map

**Implementation:**
- Horizontal timeline UI element displaying the main chat flow
- Branch points visually marked with interactive nodes
- Clicking a node expands the corresponding microchat in a side pane
- Current position in conversation tree always visible

**Technical Requirements:**
- React component for timeline visualization
- State management for tracking active branch
- Smooth animations for branch expansion/collapse

**User Benefit:**
- Immediate orientation within complex conversation structures
- Visual understanding of conversation evolution
- Never lose track of which thread you're in

### 2. Branching Templates

**Implementation:**
- Context menu appears when text is selected in any message
- Predefined modes including:
  - **Deep-Dive**: Explore a concept in greater detail
  - **Refactor**: Rewrite or improve selected content
  - **Translate**: Convert to different language or format
  - **Summarize**: Create concise version of longer content
  - **Alternative Approach**: Explore different solutions

**Technical Requirements:**
- Custom context menu component
- Template library with predefined system prompts
- Text selection handler

**User Benefit:**
- Rapid branch creation with purpose-specific context
- Consistent branch experiences
- Reduced need to craft repetitive prompts

### 3. Branch Management

**Implementation:**
- Ephemeral vs. Pinned branches
- Promotion of branch content to main conversation
- Branch filtering and organization by type

**Technical Requirements:**
- Branch status tracking (ephemeral/pinned)
- Branch-to-main content promotion flow
- Branch metadata for filtering

**User Benefit:**
- Keep important branch content, discard temporary explorations
- Seamlessly integrate valuable branch insights into main conversation
- Organize branches by purpose and status

## Backend Implementation

The backend implementation for Microchat Branching has been completed and includes:

### 1. Database Schema

- Added `microchats` table with fields for branch metadata:
  - `is_branch` boolean flag
  - `parent_message_id` (UUID) - the message from which the branch was created
  - `parent_chat_id` (UUID) - the chat containing the parent message
  - `branch_type` - enum-like text field (deep-dive, refactor, translate, summarize, custom)
  - `branch_status` - ephemeral or pinned
  - `promoted_to_message_id` - UUID of message when branch is promoted to main chat

- Added `microchat_messages` table to store messages within microchats

- Implemented Row Level Security (RLS) policies for secure user-based access control

### 2. Service Layer

- Extended `DatabaseService` with methods to:
  - Create, retrieve, update, and delete microchats and messages
  - Search microchats
  - Retrieve branches by parent message or parent chat
  - Promote branch to main chat
  - Update branch status

- Enhanced `MicrochatService` to:
  - Support creation of branches with different branch types
  - Manage branch status transitions
  - Handle promotion of branch content to main chat
  - Generate appropriate prompts for each branch type

### 3. API Endpoints

New endpoints added to the `/microchats` route:

- `GET /microchats/branch-types` - List available branch types
- `POST /microchats` - Create microchat (enhanced to support branches)
- `POST /microchats/branch-status` - Update branch status
- `POST /microchats/promote` - Promote branch content to main chat
- `GET /microchats/branches/message/{parent_message_id}` - Get all branches for a specific message
- `GET /microchats/branches/chat/{parent_chat_id}` - Get all branches for a specific chat

### 4. Data Models

New Pydantic models added:

- `MicrochatCreate` - Enhanced with branch fields
- `MicrochatResponse` - Extended with branch metadata
- `UpdateBranchStatusRequest` - For changing branch status
- `PromoteBranchRequest` - For promoting branch content
- `BranchesResponse` - For listing branches

## Next Steps

1. **Frontend Integration**: 
   - Create UI components for branch visualization
   - Implement context menu for branch creation
   - Build branch management interface

2. **Testing**: 
   - Write unit and integration tests for branch functionality
   - Test edge cases and error handling

3. **Documentation**: 
   - Update API documentation
   - Create user guide for branch features

### 3. Snapshot & Sync

**Implementation:**
- Full context capture on branch creation (all messages + settings)
- Option to "Promote Insight" from branch back to main conversation
- Promoted content appears as collapsible message in main thread

**Technical Requirements:**
- Efficient context copying mechanism
- Message promotion API endpoint
- UI for insight promotion

**User Benefit:**
- Branch with complete context without duplicating entire conversation
- Bring valuable insights back to main discussion
- Maintain clean main thread with collapsible promoted content

### 4. Ephemeral vs. Pinned Branches

**Implementation:**
- Branches default to "ephemeral" status in a transient scratchpad
- "⭐ Save Branch" action elevates to permanent, named chat
- Saved branches get unique URLs and appear in chat history

**Technical Requirements:**
- Branch status field in database schema
- Branch saving/naming UI
- URL generation for saved branches

**User Benefit:**
- Freedom to explore ideas without cluttering chat history
- Easy preservation of valuable branch conversations
- Shareable branch URLs for collaboration

### 5. Cross-Branch References

**Implementation:**
- Automatic backlinks between related branches
- References appear as "See Branch #3 on deployment"
- Branch merging tool to combine two threads

**Technical Requirements:**
- Branch relationship tracking in database
- Automated reference detection algorithm
- Branch merging logic

**User Benefit:**
- Discover related explorations
- Navigate complex multi-branch conversations
- Consolidate related threads when needed

### 6. Branch Analytics & Search

**Implementation:**
- Usage metrics for branch creation and engagement
- Dashboard showing "Your top 3 branching themes"
- Search scope filters for "main," "branch," or "all"

**Technical Requirements:**
- Branch activity tracking
- Analytics processing for theme detection
- Enhanced search with scope parameters

**User Benefit:**
- Understand personal conversation patterns
- Easily find content across complex branch structures
- Filter search to relevant conversation segments

### 7. Collaboration Hooks

**Implementation:**
- Per-user branch creation in shared sessions
- Branch visibility controls (private/shared)
- Voting mechanism for branch promotion

**Technical Requirements:**
- User-specific branch ownership
- Branch visibility permissions
- Voting/rating system for branches

**User Benefit:**
- Personal exploration spaces within collaborative sessions
- Democratic process for incorporating branch insights
- Maintain focus in team settings while enabling exploration

## 🚫 Features Explicitly Out of Scope

To maintain focus and deliver a high-quality implementation, these features will not be included in the initial implementation:

1. **Multi-Source Import & Spaces**
   - Rationale: Let users start fresh with the new branching paradigm
   - Future: Add import capabilities after branching proves popular

2. **Workspaces, Groups, Tags**
   - Rationale: Branches serve as the primary organizational structure
   - Future: Consider additional organization if branch complexity increases

3. **Hybrid Chat Merges Across Sources**
   - Rationale: Focus purely on branching within a single live session
   - Future: Expand to cross-source merging once core branching is stable

4. **Advanced Semantic Search / Embeddings**
   - Rationale: Basic text search is sufficient for the initial implementation
   - Future: Add embedding-based search in Phase 2

5. **Third-Party Integrations**
   - Rationale: Keep scope to browser-based chat experience
   - Future: Add integrations once core UX is validated

## 🚀 Implementation Roadmap

### Phase 1: Data Model & Backend Foundation

1. **Database Schema Updates**
   - Extend Chats table with: `is_branch` (boolean), `parent_chat_id`, `parent_message_id`
   - Add branch_type field for template categorization
   - Create branch_references table for cross-linking

2. **Core Backend Endpoints**
   - `POST /chats/{parent_id}/branch` - Create new microchat from parent
   - `GET /chats/{id}/branches` - List all branches from a chat
   - `POST /chats/{branch_id}/promote` - Promote branch insight to main chat
   - `PATCH /chats/{branch_id}/status` - Update branch status (ephemeral/pinned)

### Phase 2: Frontend Implementation

1. **UI Components**
   - Thread timeline visualization component
   - Branch creation context menu
   - Side pane for branch viewing
   - Branch management controls

2. **State Management**
   - Branch tracking and navigation
   - Context preservation between main chat and branches
   - Branch status management

3. **User Interactions**
   - Text selection and branch template application
   - Branch navigation and switching
   - Insight promotion workflow

### Phase 3: Testing & Refinement

1. **UX Testing**
   - Recruit 5-10 users for branching usability tests
   - Measure time-to-insight and identify drop-off points
   - Collect qualitative feedback on branch creation workflow

2. **Performance Optimization**
   - Ensure efficient context copying
   - Optimize branch switching performance
   - Test with large conversation histories

3. **Iteration**
   - Refine visual elements based on feedback
   - Adjust branch template prompts for effectiveness
   - Polish transitions and interactions

### Phase 4: Analytics & Polish

1. **Branch Analytics Implementation**
   - Track branch creation and engagement metrics
   - Develop theme detection algorithm
   - Create branch analytics dashboard

2. **Final Polish**
   - Refine animations and transitions
   - Ensure accessibility compliance
   - Optimize mobile experience

3. **Documentation & Launch**
   - Create user documentation and tutorials
   - Prepare launch communications
   - Deploy to production

## Technical Considerations

### Performance
- Efficient context copying is critical to prevent memory issues
- Consider lazy-loading branch content for large conversations
- Optimize branch switching to feel instantaneous

### Storage
- Branch conversations will increase storage requirements
- Consider compression or reference-based storage for branch contexts
- Implement appropriate retention policies for ephemeral branches

### Security
- Ensure proper access controls for branches in shared conversations
- Validate branch promotion permissions
- Protect against potential abuse vectors in branch creation

## Success Metrics

1. **Adoption Rate**
   - Percentage of users who create at least one branch
   - Average branches created per conversation

2. **Engagement**
   - Time spent in branch conversations vs. main thread
   - Branch promotion rate (how often insights return to main)

3. **User Satisfaction**
   - Specific feedback on branching experience
   - Branch feature retention (do users who try it once continue to use it)

4. **Technical Performance**
   - Branch creation latency
   - Context switching performance
   - Storage efficiency

## Conclusion

Microchat Branching represents a paradigm shift in conversation management, moving from purely linear interactions to a rich, contextual exploration model. By implementing this feature, MeshMemory will provide users with a powerful tool for exploring ideas while maintaining conversational coherence.

The focused approach—deliberately excluding certain features to perfect the branching experience—will ensure a high-quality implementation that addresses the core user need: better conversation management and context exploration.
