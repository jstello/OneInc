# Product Requirements Document (PRD) - AI Writing Assistant

## 1. Introduction
   *   **Product Name:** AI Writing Assistant
   *   **Objective:** Build a single-page application (SPA) that uses a Large Language Model (LLM) to rephrase user input into different writing styles. The app should provide a clean user experience and demonstrate full-stack technologies and AI APIs.

## 2. Features

   ### 2.1. Core Functionality (Base Requirements)
      *   **User Input:** A text field for users to enter text.
      *   **Processing Trigger:** A "Process" button to initiate the rephrasing.
      *   **LLM Integration:** Backend sends user input to an LLM API (e.g., OpenAI, Claude).
      *   **Output Display:** Frontend displays rephrased versions of the input in different writing styles.
      *   **Writing Styles:**
          *   Professional
          *   Casual
          *   Polite
          *   Social-media
      *   **Concurrency Control:**
          *   User cannot initiate another request while one is in progress.
          *   A "Cancel" button to stop the current process.

   ### 2.2. Technical Requirements
      *   **Frontend:** Next.js (ReactJS framework).
      *   **Backend:** Python (FastAPI), Java, .NET, or Node.js.
      *   **UI/UX:** Clean, production-grade enterprise app feel.
      *   **Modern Features:** Utilize modern features of chosen frameworks/languages.
      *   **Architecture:** Well-structured and modular backend and frontend logic.
      *   **Testing:** Include unit and/or integration tests.
      *   **Containerization:** Backend is containerized and runs in a Linux-based Docker container.

   ### 2.3. Bonus (Recommended) Features
      *   **Streaming Output:** Display LLM response in real-time (word-by-word or sentence-by-sentence).
      *   **Separate Output Areas:** Display each writing style in its own dedicated text area.

## 3. Example Usage
   *   **Input:** "Hey guys, let's huddle about AI."
   *   **Output Example:**
      *   Professional: "Hello everyone, let's schedule a meeting to discuss AI."
      *   Casual: "Hey folks, let's catch up on AI stuff."
      *   Polite: "Hi all, would you be open to a quick meeting about AI?"
      *   Social-media: "Yo team! Quick sync on AI?++"
   *   **Bonus (Streamed) Example:**
      *   [wait] Professional:
      *   [wait] Professional: Hello everyone
      *   [wait] Professional: Hello everyone, let's schedule
      *   [wait] Professional: Hello everyone, let's schedule a meeting to discuss AI.

## 4. Submission Guidelines
   *   Provide a link to a GitHub repository or a downloadable archive.
   *   No binaries and packages.
   *   Nice to have: a brief README with setup/run instructions and any assumptions made.
   *   **Important Note:** Do not use AI while implementing the Test Task.
