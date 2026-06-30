# Pre-RequestIT

Pre-RequestIT is a React + Vite web application for a Course Request System in the USC DCISM. 
The app models a university course expansion and off-semester petition workflow. It allows students to browse the master curriculum and securely join or initiate course petitions, while providing academic coordinators with real-time demand dashboards.

## What This App Is For

Pre-RequestIT is built around a structured academic demand model. It is not an official enrollment system, a grading platform, or a general student information system.

The app is meant for:
* University students who need to formally request off-semester subjects or expansion classes.
* Academic coordinators who need a centralized, data-driven dashboard sorted by student demand to make rapid approval decisions.
* System admins managing the master curriculum and assigning secure user roles.

## Environment Variables
Create a local environment file named `.env` at the root of your project with the following keys:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```