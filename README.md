# Home Assistant Shift Planner

A modern web application for planning and importing shifts into Home Assistant calendars with an intuitive calendar interface.

## Features

- 📅 **Interactive Calendar View** - Visual shift planning with color-coded shift types
- 👥 **Multi-Person Support** - Plan shifts for multiple people simultaneously
- 🎨 **Automatic Color Coding** - Predefined colors for common shifts, automatic generation for custom types
- 🌙 **Dark Theme** - Modern dark interface for comfortable viewing
- 🔄 **Real-time Updates** - Shifts sync immediately with Home Assistant calendars
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

   Edit and rename `shifts_config-example.json` to `shifts_config.json` with your shift times:

   ```json
   {
     "Name 1": {
       "Shift 1": {
         "start": "06:00:00",
         "end": "14:00:00"
       },
       "Shift 2": {
         "start": "14:00:00",
         "end": "22:00:00"
       },
       "Shift 3": {
         "start": "22:00:00",
         "end": "06:00:00"
       }
     },
     "Name 2": {
       "Shift 1 ": {
         "start": "07:00:00",
         "end": "15:00:00"
       },
       "Shift 2": {
         "start": "15:00:00",
         "end": "23:00:00"
       }
     }
   }
   ```

4. **Start the application**

   ```bash
   docker compose up -d
   ```

5. **Access the application**

   Open http://localhost:3000 in your browser

## Usage

### Planning Shifts

1. **Select a person** from the dropdown menu
2. **Select a shift type** from the available options
3. **Click on calendar days** to add shifts
4. Click again on a day to remove that specific shift
5. **Submit planned shifts** to sync with Home Assistant

### Color Coding

The calendar automatically color-codes shifts:

- **Früh/Frühschicht** (Early shift) - Green
- **Spät/Spätschicht** (Late shift) - Orange
- **Nacht/Nachtschicht** (Night shift) - Indigo
- **Custom shifts** - Automatically generated consistent colors

The legend below the calendar shows all active shift types with their colors.

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

### Using Docker Only

Build the image:

```bash
docker build -t hass-shift-planner .
```

Run the container:

```bash
docker run -d \
  --name hass-shift-planner \
  -p 3000:3000 \
  -e HOST=0.0.0.0 \
  -e PORT=3000 \
  -e HA_URL=http://homeassistant.local:8123 \
  -e HA_TOKEN=your_token_here \
  -e CALENDAR_ENTITY_IDS='{"Name 1":"calendar.name1", "Name 2":"calendar.name2"}' \
  -v $(pwd)/shifts_config.json:/app/shifts_config.json:ro \
  hass-shift-planner
```

## Configuration Files

### shifts_config.json

Defines shift times for each person and shift type. Structure:

```json
{
  "PersonName": {
    "ShiftType": {
      "start": "HH:MM:SS",
      "end": "HH:MM:SS"
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
- **Container**: Docker, Docker Compose
- **Integration**: Home Assistant REST API

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
