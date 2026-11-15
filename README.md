# AstraVital

**Personalized astronaut health and space hazard monitoring.**

AstraVital is a web-based platform that helps astronauts and mission teams monitor changes in physiological health while keeping track of potential environmental hazards in space.

Instead of relying only on general thresholds, AstraVital compares current health data with an individual's personal baseline to identify meaningful changes.

## Features

### Health monitoring

Track important physiological indicators and observe how they change over time.

Current metrics include:

- Heart rate
- Heart rate variability (HRV)
- Blood oxygen level (SpO₂)
- Sleep duration
- Activity level

### Risk analysis

The Risk Analysis feature compares an astronaut's current measurements with their personal baseline.

The system identifies significant deviations and provides:

- An overall risk level
- Detected patterns
- Potential risk factors
- A summary of the analysis
- Recommended follow-up actions

### Risk trends

AstraVital visualizes changes in overall risk over time, making it easier to identify patterns across multiple days.

### Space hazard monitoring

Astronaut health is affected not only by physiological changes, but also by the environment surrounding them.

The Space Hazard Monitor tracks recent space weather events, including:

- Solar flares
- Solar energetic particle events
- Geomagnetic storms

The application uses NASA/CCMC DONKI data to retrieve recent space weather information.

## How it works

AstraVital combines two sources of context:

**Personal health data**

Current measurements are compared with an astronaut's individual baseline. Significant deviations are then used to identify potential patterns and risk factors.

**Space environment data**

Recent space weather events are retrieved and processed into hazard information that can be viewed alongside health monitoring data.

The goal is to bring both perspectives together instead of treating health and environmental conditions as completely separate pieces of information.

## Built with

- Next.js
- React
- JavaScript
- Tailwind CSS
- Recharts
- Supabase

NASA/CCMC DONKI is used as a source of space weather data.

## Getting started

Clone the repository:

```bash
git clone https://github.com/queenshafa/astravital.git
cd astravital
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file and add your environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NASA_API_KEY=your_nasa_api_key
```

Then start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

## Project structure

```text
src/
├── app/
│   ├── api/
│   │   ├── hazards/
│   │   └── risk/
│   ├── lib/
│   │   ├── hazard.js
│   │   └── riskEngine.js
│   ├── risk-analysis/
│   └── space-hazard/
│
└── components/
    ├── RiskAnalysis.js
    ├── RiskTrendChart.js
    └── SpaceHazardMonitor.js
```

## NASA data and research

AstraVital uses NASA Human Research Program resources as part of the project's research into the health challenges associated with human spaceflight.

For the Space Hazard Monitor, AstraVital uses NASA/CCMC DONKI space weather data, including information related to solar flares, solar energetic particle events, and geomagnetic storms.

## Future development

AstraVital is currently a prototype. Future development could include:

- Wearable device integration
- Additional physiological metrics
- Improved risk prediction models
- Automated alerts
- More environmental data sources
- Mission-specific monitoring

## Team

- Queenshafa Rania Bilqis — Programming
- Savanna Wicaksono — Programming
- Tasya Fediarisa— Research
- Adzkia Amada Raissa — Design
- Airin Azaria Helma Putri — Design

## Disclaimer

AstraVital is a prototype developed for educational and innovation purposes. It is not intended to replace professional medical diagnosis or medical advice.