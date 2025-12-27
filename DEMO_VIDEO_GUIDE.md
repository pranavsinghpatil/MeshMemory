# 🎬 MeshMemory Demo Video Production Guide

## Video Specifications
- **Duration**: 5-7 minutes
- **Format**: 1920x1080 (1080p), 60fps
- **Style**: Screen recording + voiceover
- **Music**: Subtle tech/ambient background (royalty-free)
- **Platform**: YouTube, Twitter/X, Product Hunt

---

## 🎯 Video Objectives

1. **Hook viewers** in the first 10 seconds
2. **Demonstrate core value** (never lose information)
3. **Show actual product** in action (not mockups)
4. **Create urgency** to try it themselves
5. **Drive traffic** to GitHub and live demo

---

## 📝 Full Script with Timestamps

### 00:00 - 00:15 | COLD OPEN (The Hook)
**Visual**: Black screen → Quick cuts of:
- Browser with 50+ tabs open
- Notes scattered across Notion, Evernote, Google Docs
- Person frantically searching "that article I read last month"
- Frustrated expression

**Voiceover**:
> "Your brain can't remember everything. Your notes are everywhere. And when you need that ONE piece of information... it's gone."

**On-Screen Text**: 
- "Information Overload"
- "Scattered Notes"
- "Lost Knowledge"

---

### 00:15 - 00:30 | THE SOLUTION
**Visual**: 
- Fade to black
- MeshMemory logo animation
- Transition to dashboard with beautiful knowledge graph

**Voiceover**:
> "What if you had an AI second brain that never forgets, automatically connects your ideas, and retrieves exactly what you need—when you need it?"

**On-Screen Text**: 
- "MeshMemory"
- "Your AI Second Brain"

---

### 00:30 - 01:00 | INTRODUCTION
**Visual**: 
- Picture-in-picture: You in corner
- Main screen: Dashboard overview
- Pan across the interface

**Voiceover**:
> "Hey, I'm Pranav, and I built MeshMemory because I was tired of losing track of articles, research papers, code snippets, and ideas.
>
> MeshMemory is a local-first AI system that ingests everything you read, automatically creates a knowledge graph of connections, and lets you chat with your entire memory using natural language."

**On-Screen Text**: 
- "@pranavsinghpatil"
- "Open Source"
- "Local-First"
- "Privacy Focused"

---

### 01:00 - 02:30 | DEMO #1: MULTI-MODAL INGESTION

#### 01:00 - 01:30 | Text Note
**Visual**: 
- Click on "Neural Input" section
- Type a quick note about RAG systems

**Voiceover**:
> "Let me show you how it works. First, ingestion. I can add a quick thought..."

**Actions**:
- Type: "RAG systems combine retrieval with generation. They search a vector database before generating responses. This reduces hallucinations and grounds AI answers in real data."
- Click "Ingest Memory"
- Show toast notification
- Graph updates with new node appearing

**On-Screen Text**: 
- "1. Add Anything"
- "Text, Links, Files"

#### 01:30 - 01:50 | PDF Upload
**Visual**: 
- Switch to "File" tab
- Drag-and-drop a research paper PDF

**Voiceover**:
> "...or upload entire documents. This PDF gets automatically chunked, embedded, and connected."

**Actions**:
- Upload PDF (e.g., "Attention Is All You Need" paper)
- Show processing animation
- Multiple nodes appear in graph
- Zoom into cluster

**On-Screen Text**: 
- "Automatic Chunking"
- "Semantic Embedding"

#### 01:50 - 02:10 | YouTube URL
**Visual**: 
- Switch to "YouTube" tab
- Paste a tech tutorial URL

**Voiceover**:
> "YouTube videos? No problem. It extracts the transcript and adds it to my memory."

**Actions**:
- Paste: "https://youtube.com/watch?v=..." (any AI/tech video)
- Click ingest
- Show transcript being processed
- New nodes added to graph

**On-Screen Text**: 
- "Transcript Extraction"
- "Video → Searchable Text"

#### 02:10 - 02:30 | Webpage URL
**Visual**: 
- Switch to "Web" tab
- Paste an article URL

**Voiceover**:
> "And web articles get scraped, cleaned, and stored. Everything becomes part of my searchable second brain."

**Actions**:
- Paste: "https://example.com/article"
- Shows content being ingested
- Graph continues to grow

**On-Screen Text**: 
- "Web Scraping"
- "Auto-Linking"

---

### 02:30 - 03:30 | DEMO #2: KNOWLEDGE GRAPH VISUALIZATION

**Visual**: 
- Zoom out to show full graph
- Enable physics simulation
- Nodes floating and connecting
- Zoom into a cluster

**Voiceover**:
> "Now here's where it gets interesting. Everything I add gets visualized in this interactive knowledge graph. Each node is a memory. Each line is a semantic connection.
>
> See this cluster? These are all my notes about machine learning. And this one over here? Research papers on RAG systems. The AI found these connections automatically—I didn't tag anything."

**Actions**:
- Click on a node to show preview popup
- Hover over links to highlight connected nodes
- Drag nodes around
- Show threshold slider in action (Settings → Graph Threshold)
- Adjust from 0.5 to 0.9 and show links appearing/disappearing

**On-Screen Text**: 
- "Automatic Semantic Linking"
- "Visual Knowledge Clusters"
- "Adjustable Connection Threshold"

---

### 03:30 - 04:30 | DEMO #3: AI CHAT & RETRIEVAL

**Visual**: 
- Navigate to Chat page
- Show chat interface

**Voiceover**:
> "But the real magic happens when I ask questions. Instead of scrolling through notes, I just ask."

#### Example Query 1:
**Actions**:
- Type: "What are RAG systems and how do they work?"
- Show retrieval happening (graph highlights relevant nodes)
- AI generates response with sources cited
- Sources link back to original notes/PDFs

**Voiceover**:
> "Notice how it retrieves context from multiple sources—my note, the research paper, and the YouTube video—and synthesizes them into one answer. And I can see exactly where it got the information."

**On-Screen Text**: 
- "Graph-Based Retrieval"
- "Multi-Source Answers"
- "Cited Sources"

#### Example Query 2:
**Actions**:
- Clear chat
- Type: "Show me code snippets for vector databases"
- AI retrieves and displays code from ingested documents

**Voiceover**:
> "I can also ask for specific things, like code snippets. Everything I've ever saved is instantly accessible."

---

### 04:30 - 05:00 | ADVANCED FEATURES

**Visual**: 
- Navigate to Settings page
- Show mode toggle (Local vs Cloud)

**Voiceover**:
> "MeshMemory runs 100% locally with Ollama and Weaviate. Your data never leaves your machine. But if you want faster responses, you can switch to cloud mode with Google Gemini—your choice."

**Actions**:
- Toggle between Local and Cloud inference
- Show graph threshold slider again
- Briefly show Gemini API key input

**On-Screen Text**: 
- "Local-First Architecture"
- "Cloud Mode (Optional)"
- "Full Privacy Control"

---

### 05:00 - 05:30 | CLAUDE DESKTOP MCP INTEGRATION

**Visual**: 
- Switch to Claude Desktop app
- Show MeshMemory MCP integration

**Voiceover**:
> "And here's the coolest part. With MCP integration, Claude Desktop can access my entire MeshMemory brain. So now, Claude doesn't just know what it was trained on—it knows what *I* know."

**Actions**:
- Ask Claude: "What did I learn about RAG systems?"
- Claude uses MCP to query MeshMemory
- Returns answer with context from user's personal notes

**On-Screen Text**: 
- "Claude Desktop Integration"
- "Personal AI + Personal Memory"

---

### 05:30 - 06:00 | CALL TO ACTION

**Visual**: 
- Fade to clean screen with key links
- MeshMemory logo + GitHub stars counter
- Live demo link
- Social handles

**Voiceover**:
> "MeshMemory is completely free, open-source, and yours to customize. If you're tired of losing track of what you learn, try it out. Link to the live demo and GitHub repo are in the description.
>
> And if you build something cool with it, let me know. I'd love to see it.
>
> Thanks for watching!"

**On-Screen Text**: 
```
🔗 Try the Live Demo
   meshmemory.yoursite.com

⭐ Star on GitHub
   github.com/yourusername/MeshMemory

🐦 Follow for Updates
   @pranavsinghpatil

#AI #OpenSource #PKM #BuildInPublic
```

**End Card (5 seconds)**:
- Subscribe button animation
- "More AI Tools & Tutorials" text
- Thumbnail of next video

---

## 🎨 Visual Production Notes

### Screen Recording Setup
- **Tool**: OBS Studio or Screen Studio (Mac)
- **Resolution**: 1920x1080, 60fps
- **Cursor**: Enable cursor highlighting
- **Audio**: Record system audio + microphone separately
- **Hide**: Personal data, API keys (blur or mask)

### Camera (Optional)
- **Position**: Bottom-right corner (picture-in-picture)
- **Size**: 20% of screen
- **When to show**:
  - Introduction (00:30-01:00)
  - Transitions between sections
  - Call to action (05:30-06:00)
- **When to hide**: During demos (focus on screen)

### Editing Checklist
- [ ] Cut dead air and pauses
- [ ] Add background music (low volume, ~20%)
- [ ] Add on-screen text annotations
- [ ] Color grade for consistency
- [ ] Add zoom-ins for important moments
- [ ] Insert smooth transitions (cross-dissolve, 0.5s)
- [ ] Include captions/subtitles (accessibility + SEO)
- [ ] Add end card with CTAs

### Music Suggestions (Royalty-Free)
- **YouTube Audio Library**: "Technology," "Ambient," "Electronic"
- **Epidemic Sound**: Modern tech tracks
- **Artlist**: Futuristic/AI themes
- **Volume**: Keep at 15-20% of voiceover level

---

## 🎙️ Voiceover Recording Tips

### Equipment
- **Microphone**: USB condenser mic (Blue Yeti, Rode NT-USB)
- **Environment**: Quiet room, minimal echo
- **Software**: Audacity, Adobe Audition, or Descript

### Recording Settings
- **Sample Rate**: 48kHz
- **Bit Depth**: 24-bit
- **Format**: WAV (lossless)

### Vocal Delivery
- **Pace**: Moderate (not too fast)
- **Energy**: Enthusiastic but not overly hyped
- **Tone**: Helpful friend sharing a cool tool
- **Pauses**: Use strategic pauses before key points
- **Emphasis**: Stress words like "automatically," "never forgets," "your choice"

### Post-Processing
- [ ] Remove background noise (noise gate)
- [ ] Normalize levels (-3dB peak)
- [ ] Add light compression (3:1 ratio)
- [ ] Apply de-esser for sibilance
- [ ] EQ boost (slight high-shelf at 8kHz for clarity)

---

## 📊 YouTube Optimization

### Title Options
1. "I Built an AI Second Brain That Never Forgets (Open Source)"
2. "MeshMemory: Local-First AI Knowledge Graph + RAG System"
3. "Your Personal AI Second Brain (Better Than Notion AI)"
4. "Build Your Own AI Memory with Vector Databases & RAG"

**Winner**: #1 (curiosity + benefit + credibility)

### Description Template
```
I built MeshMemory, an AI second brain that:
✅ Never loses information
✅ Automatically connects ideas
✅ Works 100% locally (privacy-first)
✅ Integrates with Claude Desktop

In this video, I show you how it works and how you can build your own.

⏱️ TIMESTAMPS
00:00 - The Problem
00:15 - Introducing MeshMemory
01:00 - Multi-Modal Ingestion Demo
02:30 - Knowledge Graph Visualization
03:30 - AI Chat & Retrieval
04:30 - Local vs Cloud Modes
05:00 - Claude Desktop MCP Integration
05:30 - Try It Yourself

🔗 LINKS
Live Demo: https://meshmemory.yoursite.com
GitHub: https://github.com/yourusername/MeshMemory
Documentation: https://docs.meshmemory.dev
Twitter/X: https://twitter.com/pranavsinghpatil

🛠️ TECH STACK
- Weaviate (Vector Database)
- Ollama (Local LLM)
- Google Gemini (Cloud LLM)
- Next.js (Frontend)
- FastAPI (Backend)
- Model Context Protocol (MCP)

#AI #MachineLearning #RAG #OpenSource #PersonalKnowledgeManagement #VectorDatabase #KnowledgeGraph #BuildInPublic #SelfHosted #Privacy
```

### Tags
- AI
- Artificial Intelligence
- Second Brain
- RAG
- Retrieval Augmented Generation
- Vector Database
- Knowledge Graph
- Weaviate
- Ollama
- Open Source
- Self Hosted
- Personal Knowledge Management
- PKM
- Productivity
- Note Taking
- Machine Learning

### Thumbnail Design
**Elements**:
- Your face (excited expression)
- MeshMemory knowledge graph (glowing, colorful)
- Large text: "AI SECOND BRAIN"
- Subtext: "Never Forget Again"
- Open-source badge / GitHub logo

**Colors**: Dark background + bright blue/purple graph + high contrast text

**Tools**: Canva, Figma, or Photoshop

---

## 📅 Release Strategy

### Pre-Release (1 Week Before)
- [ ] Tease on Twitter/X: "Recorded something exciting this week..."
- [ ] Share screenshot of editing timeline
- [ ] Poll followers: "What feature would you want in an AI second brain?"

### Release Day
**Time**: Tuesday or Wednesday, 9 AM PST (best for YouTube algorithm)

**Checklist**:
- [ ] Upload video to YouTube (unlisted first)
- [ ] Add cards and end screens
- [ ] Schedule publication
- [ ] Prepare tweet thread
- [ ] Notify email list (if any)

**Social Media Blitz**:
- Twitter/X: Thread with key clips as GIFs
- LinkedIn: Professional post with link
- Reddit: r/selfhosted, r/MachineLearning
- Hacker News: Comment with video link in relevant discussions
- Discord/Slack: Share in AI/dev communities

### Post-Release (First 48 Hours)
- [ ] Respond to EVERY comment
- [ ] Pin top comment with links
- [ ] Share viewer testimonials
- [ ] Create short clips for TikTok/Reels (30-60s)

---

## 🎥 B-Roll & Supplemental Footage

### Suggested B-Roll Shots
1. **Typing on keyboard** (hands only, aesthetic)
2. **Graph animation** (nodes connecting in slow-motion)
3. **Code on screen** (scrolling through backend logic)
4. **Terminal output** (Ollama/Weaviate starting up)
5. **File uploads** (drag-drop animation)

### Stock Footage Sources (Free)
- **Pexels**: Tech backgrounds, neural networks
- **Pixabay**: Abstract data visualizations
- **Coverr**: Modern tech B-roll

---

## ✅ Pre-Recording Checklist

### Environment
- [ ] Clean desktop (hide personal files)
- [ ] Close unnecessary apps
- [ ] Turn off notifications (Do Not Disturb mode)
- [ ] Ensure good lighting (if using camera)
- [ ] Test microphone levels

### MeshMemory Setup
- [ ] Database has interesting, real data
- [ ] Graph is visually appealing (colorful clusters)
- [ ] Example queries planned and tested
- [ ] API keys configured (but hidden on screen)
- [ ] Demo files/URLs ready
- [ ] Settings pre-configured for smooth transitions

### Recording Software
- [ ] OBS configured (correct resolution, fps)
- [ ] Audio inputs selected
- [ ] Storage space checked (at least 10GB free)
- [ ] Backup recording plan (second device)

---

## 🚀 Post-Production Workflow

1. **Import Footage** → Organize in folders (A-Roll, B-Roll, Audio)
2. **Rough Cut** → Assemble clips in sequence, trim fat
3. **Audio Sync** → Align voiceover with video
4. **Add Music** → Background track, fade in/out
5. **Color Grade** → Slight contrast/saturation boost
6. **Add Text** → Annotations, timestamps, key points
7. **Transitions** → Smooth cross-dissolves
8. **Sound Design** → Subtle whooshes for transitions
9. **Captions** → Auto-generate, then manually correct
10. **Export** → H.264, 1080p, 60fps, high bitrate

---

## 📈 Success Metrics

### YouTube
- **Week 1**: 1,000+ views
- **Month 1**: 5,000+ views
- **Engagement**: 5%+ CTR, 50%+ avg watch time

### Traffic
- **GitHub**: 200+ new stars
- **Demo Site**: 500+ visitors
- **Social**: 100+ shares/retweets

### Qualitative
- Comments asking "How can I build this?"
- Feature requests in GitHub issues
- Other creators reaching out to collaborate

---

**Ready to record? You've got this! 🎬**

**Pro Tip**: Record your A-roll (voiceover) first, then record the screen demos. This makes editing WAY easier, as you can match visuals to your narration.
