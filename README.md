# DataPath — Analytics Transition Platform

A premium data analytics learning and tracking portal designed for aspiring data professionals.

## Features
- **Dashboard**: Track your overall progress, hours logged, and daily streaks.
- **Dynamic Roadmap**: Flexible learning paths that scale automatically beyond the initial 20-week curriculum.
- **Daily Log**: Streamlined session logging with auto-calculated week tracking.
- **Weekly Review**: Auto-generated performance summaries with rating systems and rating calculations.
- **Host Controls**: Full administrative access for 'host' users to manage student logs, reviews, and content.
- **Skills Tracker**: Visualize your growth across SQL, Python, Power BI, and more.
- **Project Portfolio**: Manage and track core analytics projects with real-time status updates.
- **Firebase Integration**: Real-time database sync and secure authentication.

## Tech Stack
- **Frontend**: HTML5, CSS3 (Component-Based), JavaScript (ES6 Modules)
- **Backend/Auth**: Firebase (Authentication & Firestore)
- **Testing**: Jest for unit testing logic functions
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## Architecture Updates
- **JS Modularization**: The legacy `app.js` monolith has been split into purpose-driven files (`state.js`, `events.js`, `utils.js`, `render*.js`).
- **Dark Mode**: Integrated `data-theme` architecture with localStorage persistence.
- **Component CSS**: Extracted utility and design tokens to `css/design-tokens.css` and `css/components/`.

## Setup
1. Clone the repository.
2. Ensure you have Node.js installed to run tests.
3. Run `npm install` to install Jest dependencies.
4. Update the Firebase configuration in `js/app.js` with your project credentials.
5. Open `index.html` in a local server environment (e.g., Live Server).

## Testing
Run the test suite using:
```bash
npx jest
```

## Administrative Access
Users with the `host` role can:
- View all registered users.
- Edit or Delete user sessions and logs.
- Manage global roadmap phases and project lists.

## License
MIT
