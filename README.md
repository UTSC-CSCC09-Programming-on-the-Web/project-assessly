# Assessly

## Team

| Name        | Email                        | UTORid   |
| ----------- | ---------------------------- | -------- |
| Ahmad Hakim | ahmad.hakim@mail.utoronto.ca | hakimahm |
| Ansh Aneel  | ansh.aneel@mail.utoronto.ca  | aneelans |

## Website
https://assessly.website 

## Project Description

**Assessly** will let hiring teams set up custom developer assessments and let candidates complete them, capturing their screen activity and AI tool usage as they tackle a given task. A built-in voice assistant reads the prompt aloud and answers questions on demand, ensuring candidates stay focused while maintaining a clear record of their thought process. Recruiters can tailor each assessment’s criteria to match their needs, and companies subscribe to monthly tiered plans based on the number of assessments and candidates they require. After each session, hiring managers simply log into a dashboard to see a candidate’s summary of performance, making it easy to identify the most productive, AI-savvy developers.

## Tech Stack

- **Frontend**: Vue.js
- **Backend**: Express
- **Database**: PostgreSQL

## Additional Requirement

**Real-time interaction:** The candidate’s screen is shared with the agent as they work. At the same time, the voice agent listens and responds immediately whenever the candidate asks a question, creating a seamless, live conversation during the assessment.

## Milestones

### 🔹 Alpha Version

- **User Authentication & Authorization**  
  Implement sign-in/sign-up functionality using OAuth 2.0.

- **Recruiter Dashboard**  
  Authenticated recruiters can create, manage, and share assessments.

- **Assessment Overview**  
  Recruiters can view invited candidates for each assessment.

- **Candidate Experience**  
  Candidates can complete their assigned assessments with voice assistant support.

> 🔸 _Note: No payment system in this phase. Recruiters access features upon sign-in._

### 🔹 Beta Version

- **Payment System**  
  Recruiters must subscribe to a monthly plan to access the platform.

- **AI-Based Assessment Metrics (Phase 1)**  
  The AI agent scores candidates on:
    - Task completion time
    - External tool usage (e.g., Stack Overflow, LLM prompts, Docs)

- **Assessment Analytics Dashboard**  
  Recruiters can view completed assessments and metric-based scores for each candidate.

### 🔹 Final Version

- **Expanded Assessment Metrics**  
  Additional evaluation criteria:
    - Code correctness
    - Communication clarity

- **UI Enhancements**  
  Final refinements to the platform interface.

- **Comprehensive Testing**  
  Security and usability testing.
