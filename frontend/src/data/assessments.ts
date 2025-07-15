import type { Assessment } from '@/types/assessment'

export const assessments: Assessment[] = [
  {
    id: 1,
    slug: 'introducing-acme-ai',
    title: 'Introducing Acme.ai',
    publishedAt: '2024-08-29',
    summary: 'Introducing Acme.ai, a cutting-edge AI solution for modern businesses.',
    author: 'dillionverma',
    image: '/introducing.png',
    type: 'Technical content',
    status: 'Done',
    target: '18',
    limit: '5',
    reviewer: 'Eddie Lake',
    content: `
We're excited to unveil **Acme.ai**, an innovative AI-powered platform designed to transform your business operations and skyrocket productivity. 🚀

## The Challenge We're Addressing

In today's AI-driven world, businesses face several hurdles:

- Overwhelming data analysis
- Inefficient decision-making processes
- Difficulty in predicting market trends

Acme.ai tackles these challenges head-on, offering a sophisticated AI solution that simplifies complex business processes.

## Our Mission

1. **Accelerate Decision-Making**: By leveraging AI to analyze vast datasets, we help you make informed decisions faster.
2. **Enhance Forecasting**: Our advanced predictive models provide accurate insights into future trends.
3. **Optimize Operations**: With AI-driven recommendations, streamline your business processes effortlessly.

## Core Capabilities

- **AI-Powered Dashboard**: Get real-time, AI-interpreted insights at a glance
- **Predictive Analytics**: Forecast trends and make data-driven decisions
- **Natural Language Processing**: Interact with your data using simple language queries
- **Automated Reporting**: Generate comprehensive reports with a single click
- **Customizable AI Models**: Tailor the AI to your specific industry needs

## Why Acme.ai Stands Out

> "Acme.ai has revolutionized our strategic planning. It's like having a crystal ball for our business!" - John Smith, CFO of FutureTech

Our AI solution isn't just a tool; it's your competitive edge. Here's how we compare:

| Feature                  | Acme.ai | Traditional BI Tools |
| ------------------------ | ------- | -------------------- |
| AI-Powered Insights      | ✅      | ❌                   |
| Predictive Capabilities  | ✅      | ❌                   |
| Natural Language Queries | ✅      | ❌                   |

## Embarking on Your AI Journey

Getting started with Acme.ai is seamless:

1. Sign up for a demo
2. Integrate your data sources
3. Start unlocking AI-driven insights
    `
  },
  {
    id: 2,
    slug: 'technical-approach',
    title: 'Technical Approach',
    publishedAt: '2024-08-25',
    summary: 'Comprehensive technical approach and architecture overview for modern assessment systems.',
    author: 'jamik',
    image: '/technical-approach.png',
    type: 'Narrative',
    status: 'Done',
    target: '27',
    limit: '23',
    reviewer: 'Jamik Tashpulatov',
    content: `
# Technical Approach

## System Architecture Overview

Our assessment platform leverages a modern, scalable architecture designed to handle high-volume assessment processing while maintaining performance and reliability.

### Frontend Architecture

- **Vue.js 3**: Progressive framework with Composition API
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework

### Backend Architecture

- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **PostgreSQL**: Primary database for structured data
- **Redis**: Caching and session management

### Deployment Strategy

Our platform utilizes containerized deployment with:

- **Docker**: Containerization
- **Kubernetes**: Orchestration
- **AWS**: Cloud infrastructure
- **CI/CD**: Automated testing and deployment

## Security Measures

- End-to-end encryption
- OAuth 2.0 authentication
- Role-based access control
- Regular security audits
    `
  },
  {
    id: 3,
    slug: 'user-interface-design',
    title: 'User Interface Design',
    publishedAt: '2024-08-20',
    summary: 'Modern UI/UX design principles and accessibility guidelines for assessment platforms.',
    author: 'sarah_chen',
    image: '/ui-design.png',
    type: 'Visual',
    status: 'In Process',
    target: '19',
    limit: '25',
    reviewer: 'Leila Ahmadi',
    content: `
# User Interface Design Guidelines

## Design Philosophy

Our design approach prioritizes accessibility, usability, and modern aesthetics to create an intuitive assessment experience.

### Design Principles

1. **Accessibility First**: WCAG 2.1 AA compliance
2. **Mobile Responsive**: Mobile-first design approach
3. **Clean & Minimal**: Reduce cognitive load
4. **Consistent**: Unified design system

### Color Palette

- Primary: #42b883 (Vue Green)
- Secondary: #2c3e50 (Dark Blue)
- Accent: #e74c3c (Red)
- Neutral: #f8f9fa (Light Gray)

### Typography

- Headings: Inter, system-ui
- Body: system-ui, sans-serif
- Code: 'Fira Code', monospace

## Component Library

We use a custom component library built on top of modern design tokens:

- **Buttons**: Multiple variants and states
- **Forms**: Accessible form controls
- **Cards**: Flexible content containers
- **Navigation**: Intuitive navigation patterns
    `
  },
  {
    id: 4,
    slug: 'assessment-methodology',
    title: 'Assessment Methodology',
    publishedAt: '2024-08-15',
    summary: 'Comprehensive assessment methodology and evaluation frameworks for educational institutions.',
    author: 'maya_johnson',
    image: '/methodology.png',
    type: 'Research',
    status: 'Done',
    target: '15',
    limit: '22',
    reviewer: 'Maya Johnson',
    content: `
# Assessment Methodology

## Overview

Our assessment methodology combines traditional evaluation techniques with modern digital approaches to provide comprehensive and fair assessments.

### Core Principles

1. **Validity**: Assessments measure what they claim to measure
2. **Reliability**: Consistent results across different conditions
3. **Fairness**: Equal opportunity for all participants
4. **Transparency**: Clear criteria and expectations

### Assessment Types

#### Formative Assessments
- Real-time feedback during learning
- Progress tracking
- Adaptive questioning

#### Summative Assessments  
- End-of-module evaluations
- Comprehensive examinations
- Certification assessments

#### Diagnostic Assessments
- Skill gap analysis
- Learning style identification
- Prerequisite knowledge verification

### Technology Integration

Our platform integrates various technologies:

- **AI-Powered Grading**: Automated scoring with human oversight
- **Analytics Dashboard**: Real-time performance insights
- **Adaptive Learning**: Personalized assessment paths
- **Accessibility Tools**: Support for diverse learning needs

### Quality Assurance

- Peer review process
- Statistical analysis of results
- Regular methodology updates
- Stakeholder feedback integration
    `
  },
  {
    id: 5,
    slug: 'data-security-compliance',
    title: 'Data Security & Compliance',
    publishedAt: '2024-08-10',
    summary: 'Comprehensive data security measures and compliance frameworks for educational data protection.',
    author: 'carlos_rodriguez',
    image: '/security.png',
    type: 'Legal',
    status: 'In Process',
    target: '31',
    limit: '27',
    reviewer: 'Sarah Chen',
    content: `
# Data Security & Compliance

## Security Framework

Our platform implements enterprise-grade security measures to protect sensitive assessment data and user information.

### Data Protection

#### Encryption
- **At Rest**: AES-256 encryption for stored data
- **In Transit**: TLS 1.3 for all communications
- **End-to-End**: Encrypted assessment submissions

#### Access Controls
- Multi-factor authentication (MFA)
- Role-based permissions
- Session management
- IP whitelisting for administrative access

### Compliance Standards

#### Educational Privacy
- **FERPA**: Family Educational Rights and Privacy Act compliance
- **COPPA**: Children's Online Privacy Protection Act adherence
- **GDPR**: General Data Protection Regulation compliance for EU users

#### Industry Standards
- **SOC 2 Type II**: Annual security audits
- **ISO 27001**: Information security management
- **NIST Framework**: Cybersecurity best practices

### Data Governance

#### Data Lifecycle Management
1. **Collection**: Minimal data collection principle
2. **Storage**: Secure, encrypted storage with retention policies
3. **Processing**: Lawful basis and purpose limitation
4. **Sharing**: Controlled data sharing with explicit consent
5. **Deletion**: Secure data deletion when no longer needed

#### Incident Response
- 24/7 security monitoring
- Automated threat detection
- Incident response procedures
- Regular security training for staff

### Privacy by Design

Our platform incorporates privacy considerations from the ground up:

- Data minimization
- Purpose limitation
- Transparency and user control
- Regular privacy impact assessments
    `
  }
] 