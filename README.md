# AI Chatbot Study

This repository contains two frontend experiments for a chatbot research study focused on disclosure mechanisms and user interaction patterns. The experiments are designed to test different approaches to presenting sponsored content and disclosure information in conversational AI interfaces.

This repo was created to support the study that was conducted by Dr. Uri Yosef Hacohen, Tel-Aviv University, reachable at https://en-law.tau.ac.il/profile/urihacohen and was funded by The Israel Science Foundation. The data collected during this study did not include any personally identifiable information and will be used only for the purpose of this study.

## 🧪 Experiments Overview

**Key Features**:
- Simple chat interface
- Multiple disclosure mechanisms
- User approval workflows
- Behavioral analytics
- OpenAI integration for LLM usage
- Prolific integration for research participants
- Qualtrics integration for presenting a survey at the end of the experiment

### 1. Initial Experiment (`experiments/initial-experiment/`)
**Focus**: Basic disclosure mechanisms and user interaction patterns, based on adversorial content.

**Conditions Tested**:
- `textOnly` - Plain text responses without links
- `textWithLinks` - Text responses with embedded links to source content
- `textWithLinksDisclosure` - Links with disclosure information
- `textWithLinksDisclosureChatDisclosure` - Enhanced disclosure with chat-level notifications
- `inChatMessageDisclosure` - Chat-level disclosure notifications
- `RequiresUserApproval` - Chat-level disclosure notifications that require user confirmation

### 2. Product Selection Experiment (`experiments/product-selection-experiment/`)
**Focus**: Product selection interfaces and enhanced user experience, based on native recommendations and sponsored content.

**Conditions Tested**:
- `textWithLinks` - Standard text with product links
- `textWithLinksDisclosure` - Links with disclosure information
- `chatDisclosure` - Chat-level disclosure notifications
- `chatConfirmation` - User confirmation workflows

## 🏗️ Architecture

This repository contains only the **frontend experiments**. The backend API is maintained in a separate repository:

**Backend Repository**: [https://github.com/guybecker/chatbot-project-backend](https://github.com/guybecker/chatbot-project-backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- npm or yarn
- Access to the backend API (see backend repository)

### Environment Setup

1. **Copy environment template**:
   ```bash
   cd experiments/product-selection-experiment  # or initial-experiment
   cp .env.example .env
   ```

2. **Configure environment variables** in `.env`:
   ```bash
   # Qualtrics Survey Configuration
   REACT_APP_QUALTRICS_SURVEY_URL=https://your-qualtrics-survey-url.com
   
   # Backend API Configuration  
   REACT_APP_API_URL=https://your-backend-api-url.com
   ```

### Running an Experiment

1. **Choose an experiment**:
   ```bash
   cd experiments/product-selection-experiment  # or initial-experiment
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - The app will connect to the backend API automatically

### Backend Setup

To run the complete system, you'll need to set up the backend:

1. **Clone the backend repository**:
   ```bash
   git clone https://github.com/guybecker/chatbot-project-backend.git
   cd chatbot-project-backend
   ```

2. **Follow the backend setup instructions** in that repository

3. **Configure environment variables** as needed

## 🔧 Configuration


### Prolific Integration

Both experiments support Prolific research platform integration through URL parameters:
- `PROLIFIC_PID` - Participant ID

## 📝 Contributing

This is a research project. If you're interested in contributing:

1. **Fork the repository**
2. **Create a feature branch** for your changes
3. **Test thoroughly** with the backend API
4. **Submit a pull request** with clear description of changes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For questions about this research project, please contact the research team or open an issue in this repository.

---

**Note**: This repository contains research experiments and may not be suitable for production use without additional security and privacy considerations.