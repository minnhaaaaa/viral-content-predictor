# Viral Content Predictor
This project analyses short form content the same way a neuroscientist would, modelling how the human brain responds to audio and visual stimuli and returns a quantitative prediction of engagement and actionable edit recommendations.

## Backend Setup Steps
Make sure python3 is installed in your distribution.

The following are the step by step installation process to get the backend server running.
1. Clone the repository to your computer
2. Create a virtual environment
`python3 -m venv myenv`
3. Activate the environment
4. To prevent dependency compilation failures, upgrade `pip`, `setuptools` and `wheels` first.
`pip install --upgrade pip setuptools wheel`
6. Install the dependencies
`pip install -r requirements.txt`

## Frontend Setup Steps
The frontend is built using **Next.js**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**. 
Make sure the following is installed:
* [Node.js](https://nodejs.org/) (v18.x or higher recommended)
* `npm` (comes packaged with Node) or your preferred package manager (`pnpm`, `yarn`, `bun`)

The following are the step by step installation process to get the server running. 
1. Move to the frontend folder
`cd frontend`
2. Install dependencies
`npm install`
3. Run server
`npm run dev`

Open your browser and navigate to http://localhost:3000 to view the application.

## System Dependencies
Install ffmpeg before running the project as required by Whisper:
- Ubuntu/Debian: `sudo apt install ffmpeg`
- Mac: `brew install ffmpeg`
- Windows: `https://ffmpeg.org/download.html`
