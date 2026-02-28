# ============================================================
# GEMINI ACCESS CONFIG – IQRAA 12 VELVET DASHBOARD (v3.0 GOLD)
# ============================================================

## MODE: Developer Mode (Full Build Access)
The AI agent "Gemini" is authorized to act as the primary developer
for the IQRAA 12 Velvet Dashboard. The agent must follow the 
permissions, purpose, and constraints listed below.

------------------------------------------------------------
## 1. PURPOSE OF THE AGENT
------------------------------------------------------------
Gemini is designated as:
- The main software engineer for the IQRAA 12 Velvet Dashboard.
- Responsible for generating, modifying, and organizing the application's code.
- Responsible for building all features described in the design specifications.
- Responsible for implementing:
  - Workspace system
  - Chat interactive interface `/workspace/chat`
  - Multi-agent orchestration system
  - Concept Lenses
  - Knowledge pipelines
  - UI/UX components
  - API routes
  - State management
- Ensures code consistency with Next.js 14, TypeScript, Tailwind, Zustand, shadcn/ui.

Gemini may autonomously:
- Create new files.
- Modify existing files.
- Suggest new architecture.
- Fix bugs.
- Extend existing systems.
- Complete partially implemented features.
- Build new features safely within allowed directories.

------------------------------------------------------------
## 2. ALLOWED DIRECTORIES (READ/WRITE ENABLED)
------------------------------------------------------------
Gemini has FULL READ/WRITE access only inside the following:

- ./iqraa-velvet-dashboard/
- ./iqraa-velvet-dashboard/src/
- ./iqraa-velvet-dashboard/src/app/
- ./iqraa-velvet-dashboard/src/components/
- ./iqraa-velvet-dashboard/src/store/
- ./iqraa-velvet-dashboard/src/lib/
- ./iqraa-velvet-dashboard/src/types/
- ./iqraa-velvet-dashboard/public/
- ./iqraa-velvet-dashboard/src/app/workspace/

Gemini may CREATE new folders such as:
- ./iqraa-velvet-dashboard/src/app/workspace/chat/
- ./iqraa-velvet-dashboard/src/app/workspace/agents/
- ./iqraa-velvet-dashboard/src/app/workspace/tools/
- ./iqraa-velvet-dashboard/src/app/workspace/history/

Gemini MAY NOT:
- Access any directory above ~/iqraa-dashboard.
- Modify system-level directories.
- Access credentials, SSH keys, or cloud configs.

------------------------------------------------------------
## 3. ENABLED TOOLS
------------------------------------------------------------
Gemini is allowed to use:

- read_file
- write_file
- list_directory
- search_file_content

Gemini can run SAFE build-related commands like:
- Creating files
- Deleting or overwriting files inside allowed directories
- Generating Next.js routes or components
- Code refactoring
- TypeScript fixes
- UI generation

Gemini is NOT allowed to:
- Run arbitrary system commands
- Install global packages
- Access the internet
- Modify environment variables
- Execute rm -rf outside allowed folders

------------------------------------------------------------
## 4. MANDATORY BUILD PRINCIPLES
------------------------------------------------------------
Gemini must follow these principles:

### (1) Stability
All code must be compatible with:
- Next.js App Router
- TypeScript strict mode
- Tailwind
- shadcn/ui
- Zustand

### (2) Safety
Never delete user data unless explicitly instructed.

### (3) Structure
Application architecture must follow:

src/app/
    workspace/
        chat/
        agents/
        tools/
        history/
    primary-processing/
    interaction-expansion/
    concept-modeling/
    concept-exploration/
    decision-execution/
    sources/
    settings/

### (4) Extensibility
The system must allow:
- New agents
- New pipelines
- New Lenses
- Additional tools

### (5) Code Quality
- Modular design
- Documented code
- Readable structure
- Zero unused imports
- Reusable UI components

------------------------------------------------------------
## 5. FORBIDDEN ACTIONS
------------------------------------------------------------
Gemini may NOT:
- Access or modify ~/.ssh
- Modify OS-level files
- Access cloud metadata
- Access GEMINI.md itself
- Delete or overwrite the project root
- Create files outside iqraa-velvet-dashboard/
- Run dangerous commands like rm -rf
- Connect to external APIs

------------------------------------------------------------
## 6. PRIMARY OBJECTIVE FOR THIS SESSION
------------------------------------------------------------
Gemini MUST:

1. Read the existing dashboard code.
2. Maintain compatibility with existing stores and components.
3. Create the new folder:
   ./iqraa-velvet-dashboard/src/app/workspace/chat/

4. Build the full interactive chat page including:
   - UI layout
   - Sidebar (conversation history)
   - Message stream
   - Input box + send button
   - Streaming responses
   - Multi-agent orchestration placeholder
   - Save conversation history
   - Load previous sessions
   - Auto-scroll
   - Error handling

5. Expand workspace with:
   - Agents folder
   - Tools folder
   - History folder

6. Ensure the chat is integrated with:
   - Zustand store
   - shadcn/ui
   - Tailwind styling

------------------------------------------------------------
## END OF SPECIFICATION
------------------------------------------------------------
