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
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend/Auth**: Firebase (Authentication & Firestore)
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## Setup
1. Clone the repository.
2. Update the Firebase configuration in `js/app.js` with your project credentials.
3. Open `index.html` in a local server environment.

## Administrative Access
Users with the `host` role can:
- View all registered users.
- Edit or Delete user sessions and logs.
- Manage global roadmap phases and project lists.

## License
MIT
