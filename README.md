# SmartHire

SmartHire is an AI-assisted recruitment platform that brings resume screening, technical assessments, and interviews into a single workflow.

The project was built to explore how AI can be used to assist recruiters during candidate screening and evaluation.

## Features

### For Candidates

* **Resume Screening** — Upload a resume and check it against ATS-style criteria.
* **Technical Assessment** — Attempt technical and coding questions.
* **Interview** — Participate in an online interview session with browser-based monitoring.
* **Progress Tracking** — Track progress through the recruitment stages.

### For Recruiters

* **Candidate Management** — View and manage candidates.
* **Interview Management** — Schedule and conduct interview sessions.
* **Analytics** — View candidate and recruitment performance.
* **Evaluation** — Review assessment and interview results.

## How It Works

```text
Candidate
    │
    ▼
Resume Upload
    │
    ▼
ATS Screening
    │
    ▼
Technical Assessment
    │
    ▼
Interview
    │
    ▼
AI-assisted Evaluation
    │
    ▼
Recruiter Dashboard
```

## Architecture

```text
                         SmartHire
                            │
                 ┌──────────┴──────────┐
                 │                     │
            Candidate                Recruiter
                 │                     │
        ┌────────┼────────┐       ┌────┼─────┐
        │        │        │       │    │     │
      Resume   Test   Interview  Candidates Analytics
        │        │        │       │    │
        └────────┼────────┘       └────┼─────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                     Application Logic
                            │
                  ┌─────────┴─────────┐
                  │                   │
             AI Services        Integrations
                  │
                  ▼
             Evaluation
```

### Main Project Structure

```text
SmartHire2/
│
├── Components/          # Reusable UI components
├── Entities/            # Application entities/models
├── Pages/               # Main application screens
├── config/              # Application configuration
├── integrations/        # External service integrations
├── src/                 # React entry point and styles
├── utils/               # Shared utility functions
│
├── index.html
├── Layout.jsx
├── package.json
├── simple-server.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Tech Stack

**Frontend**

* React
* Vite
* Tailwind CSS
* React Router

**AI / ML**

* OpenAI API
* TensorFlow.js

**UI & Visualization**

* Radix UI
* Lucide React
* Recharts
* Monaco Editor

**Other**

* JavaScript
* Node.js
* npm

## Getting Started

### Prerequisites

* Node.js 18+
* npm
* Modern web browser
* Camera and microphone access for interview features

### Installation

Clone the repository:

```bash
git clone https://github.com/asthabisoi28/SmartHire2.git
cd SmartHire2
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root and add the required API configuration:

```env
OPENAI_API_KEY=your_api_key_here
```

Start the development server:

```bash
npm run dev
```

Then open the local URL displayed in the terminal.

> Keep `.env` out of version control. Never commit API keys or other credentials.

## Recruitment Workflow

SmartHire follows a multi-stage recruitment workflow:

**1. Resume Screening**

The candidate uploads a resume which is analyzed against ATS-style criteria.

**2. Technical Assessment**

Candidates complete technical questions and coding tasks.

**3. Interview**

Candidates participate in an online interview session with browser-based monitoring features.

**4. Evaluation**

Assessment and interview information is used to help recruiters evaluate candidates.

## Current Scope

SmartHire is currently a prototype focused on demonstrating the end-to-end recruitment workflow and AI-assisted evaluation.

The project can be extended with persistent database storage, stronger authentication, scalable backend services, and production deployment.

## Future Improvements

* Persistent database integration
* Role-based authentication
* Improved candidate ranking
* More detailed interview analytics
* Real-time interview communication
* Cloud deployment
* Advanced AI-assisted question generation

## Author

**Astha Bisoi**

[GitHub](https://github.com/asthabisoi28) · [LinkedIn](https://www.linkedin.com/in/astha-bisoi/)
