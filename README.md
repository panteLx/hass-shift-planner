# Home Assistant Shift Planner

A modern web application for planning and importing shifts into Home Assistant calendars with an intuitive calendar interface and intelligent shift categorization.

## Features

- 📅 **Interactive Calendar View** - Visual shift planning with modern horizontal shift badges
- 👥 **Multi-Person Support** - Plan shifts for multiple people simultaneously
- 🎨 **Intelligent Color Grouping** - Automatic categorization into Morning, Day, Evening, Night, and Special shifts
- 🏷️ **Manual Categorization** - Define custom categories in JSON configuration for precise control
- 📋 **Enhanced Shift Selection** - Dropdown menus show shift times, duration, and color-coded options
- 🗂️ **Grouped Legend** - Organized shift legend with icons and categories for better overview
- 🎯 **Flexible Shift Recognition** - Supports both time-based and name-based shift categorization
- 🌙 **Dark Theme** - Modern dark interface for comfortable viewing
- 🔄 **Real-time Updates** - Shifts sync immediately with Home Assistant calendars
- 📱 **Responsive Design** - Works perfectly on desktop and tablet. Mobile devices (WIP)
- 🐳 **Docker Ready** - Easy deployment with Docker and Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Home Assistant instance with Long-Lived Access Token
- Calendar entities created in Home Assistant

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/panteLx/hass-shift-planner.git
   cd hass-shift-planner
   ```

2. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Home Assistant Configuration
   HA_URL=http://homeassistant.local:8123
   HA_TOKEN=your_long_lived_access_token_here
   CALENDAR_ENTITY_IDS={"Name 1":"calendar.name1","Name 2":"calendar.name2"}

   # Optional: Server Configuration (defaults shown)
   HOST=0.0.0.0
   PORT=3000
   ```

   **Environment Variables:**

   - `HA_URL`: Your Home Assistant URL
   - `HA_TOKEN`: Long-Lived Access Token from Home Assistant
   - `CALENDAR_ENTITY_IDS`: JSON object mapping person names to calendar entity IDs
   - `HOST`: Server host address (default: 0.0.0.0)
   - `PORT`: Server port (default: 3000)

3. **Configure shift types**

   Copy, edit and rename `shifts_config.json.example` to `shifts_config.json` with your shift times and categories:

   ```bash
   cp shifts_config.json.example shifts_config.json
   ```

   ```json
   {
     "sebastian": {
       "früh": {
         "start": "06:00:00",
         "end": "14:00:00",
         "category": "morning"
       },
       "mittel": {
         "start": "10:00:00",
         "end": "18:00:00",
         "category": "day"
       },
       "spät": {
         "start": "13:00:00",
         "end": "21:00:00",
         "category": "evening"
       },
       "nacht": {
         "start": "20:45:00",
         "end": "23:59:00",
         "category": "night"
       },
       "fortbildung": {
         "start": "08:00:00",
         "end": "16:00:00",
         "category": "special"
       }
     }
   }
   ```

   **Categories:**

   - `morning` 🌅 - Morning shifts (green colors)
   - `day` ☀️ - Day shifts (blue colors)
   - `evening` 🌆 - Evening/late shifts (orange colors)
   - `night` 🌙 - Night shifts (purple colors)
   - `special` ⭐ - Special shifts like training, vacation (various colors)

4. **Copy Docker Compose file**

   Copy the example Docker Compose file:

   ```bash
   cp docker-compose-examples/docker-compose.yaml docker-compose.yaml
   ```

5. **Start the application**

   ```bash
   docker compose up -d
   ```

6. **Access the application**

   Open http://localhost:3000 in your browser

## Usage

### Planning Shifts

1. **Select a person** from the dropdown menu
2. **Select a shift type** from the available options
3. **Click on calendar days** to add shifts
4. Click again on a day to remove that specific shift
5. **Submit planned shifts** to sync with Home Assistant

### Shift Categories and Color Coding

The application uses intelligent categorization with manual control:

#### Manual Categorization (Recommended)

Define categories in your `shifts_config.json`:

- 🌅 **Morning shifts** (`"category": "morning"`) - Green tones
- ☀️ **Day shifts** (`"category": "day"`) - Blue tones
- 🌆 **Evening shifts** (`"category": "evening"`) - Orange tones
- 🌙 **Night shifts** (`"category": "night"`) - Purple tones
- ⭐ **Special shifts** (`"category": "special"`) - Various colors for training, vacation, etc.

#### Automatic Fallback

For shifts without manual categories, the system uses:

- **Time-based detection** - Categorizes by shift start times
- **Keyword recognition** - Recognizes common patterns like "früh", "spät", "nacht"

### Multi-Person Planning

- Switch between people using the dropdown
- Previously planned shifts are preserved when switching
- Each person's shifts are displayed with their initials
- Multiple shifts can exist on the same day

## Docker Commands

### Using Docker Compose (Recommended)

```bash
# Start in background
docker compose up -d

# Start with rebuild
docker compose up --build

# Stop containers
docker compose down

# View logs
docker compose logs -f

# Restart
docker compose restart
```

## Configuration Files

### shifts_config.json

Defines shift times, categories, and configurations for each person. Enhanced structure with manual categorization:

```json
{
  "PersonName": {
    "ShiftType": {
      "start": "HH:MM:SS",
      "end": "HH:MM:SS",
      "category": "morning|day|evening|night|special"
    }
  }
}
```

**Example with complex shifts:**

```json
{
  "lisa": {
    "früh": {
      "start": "07:45:00",
      "end": "15:45:00",
      "category": "morning"
    },
    "mittel-1": {
      "start": "10:00:00",
      "end": "18:00:00",
      "category": "day"
    },
    "mittel-2": {
      "start": "11:00:00",
      "end": "19:00:00",
      "category": "evening"
    },
    "spät-1": {
      "start": "12:15:00",
      "end": "20:10:00",
      "category": "evening"
    }
  }
}
```

## Troubleshooting

### Check Container Logs

```bash
docker compose logs -f
docker logs hass-shift-planner
```

### Verify Environment Variables

```bash
docker compose config
```

### Interactive Container Shell

```bash
docker exec -it hass-shift-planner sh
```

### Common Issues

**Port already in use:**

- Change `PORT` in `.env` file
- Restart: `docker compose up -d`

**Calendar not updating:**

- Verify `HA_TOKEN` is valid
- Check `CALENDAR_ENTITY_IDS` match your Home Assistant setup
- Ensure calendar entities exist in Home Assistant

**Configuration not loading:**

- Verify `shifts_config.json` is valid JSON
- Check file permissions
- Restart container: `docker compose restart`

## Development

### Local Development (without Docker)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` file with configuration

3. Start development server:

   ```bash
   npm start
   ```

4. Access at http://localhost:3000

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **UI/UX**: Modern dark theme, responsive flexbox layouts, horizontal shift badges
- **Data Management**: JSON-based configuration with caching
- **Container**: Docker, Docker Compose
- **Integration**: Home Assistant REST API

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
