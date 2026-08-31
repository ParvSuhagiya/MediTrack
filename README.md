# MediTrack

A medicine reminder and adherence tracking app built as a college assignment
project. Users can log their medicines, mark doses as taken with photo proof,
track appointments, and view their dose history and adherence over time.

## Tech Stack

- **Frontend:** React Native (Expo SDK 54), Expo Router (file-based routing), JSX
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (jsonwebtoken) + bcrypt (bcryptjs) for password hashing
- **Camera:** expo-image-picker (photo proof for doses)
- **Location:** expo-location (clinic location + reverse geocoding)

No state management or HTTP libraries beyond what's listed above — plain
`fetch` and React Context are used throughout, by design, to keep the
codebase simple and beginner-friendly.

## Features

- **Auth:** signup, login, logout (JWT-based, session kept in memory only —
  resets on app reload, no AsyncStorage)
- **Medicine tracking:** add, edit, delete, and list medicines
- **Photo proof:** mark a dose as taken with a camera photo, retake before
  confirming
- **Dose logging & today's schedule:** mark doses taken, missed, or skipped,
  grouped by morning/afternoon/night
- **History & adherence tracking:** view past dose logs with photos, filter
  by medicine/date, see adherence percentage, pull-to-refresh
- **Appointments:** add, edit, delete appointments (doctor, clinic, date,
  time, notes), mark as completed
- **Location:** capture current location for a clinic with reverse
  geocoding to an address, open the clinic in the device's native Maps app
- **Profile & settings:** edit profile (name/email), change password,
  dark/light theme toggle (in-memory only, resets on reload)
- **UI polish:** loading states, empty states, permission-denied states with
  retry, inline form validation, confirmation dialogs for destructive
  actions, and toast notifications for quick success messages

## Project Structure

```
MediTrack/
  backend/
    src/
      db.js
      models/
        User.js
        Medicine.js
        DoseLog.js
        Appointment.js
      middleware/
        auth.js
      routes/
        auth.js
        medicine.js
        doseLog.js
        appointment.js
        user.js
      server.js
    .env
    package.json

  frontend/my-app/
    app/
      _layout.tsx
      login.jsx
      signup.jsx
      add-medicine.jsx
      edit-medicine.jsx
      add-appointment.jsx
      edit-appointment.jsx
      mark-taken.jsx
      (tabs)/
        _layout.tsx
        home.jsx
        medicines.jsx
        appointments.jsx
        schedule.jsx
        history.jsx
        profile.jsx
    context/
      AuthContext.jsx
      ThemeContext.jsx
      ToastContext.jsx
    components/
      Toast.jsx
    constants/
      api.js
```

## Setup

### Backend

1. Navigate to the backend folder:
   ```
   cd backend
   npm install
   ```
2. Create a `.env` file with:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_string
   PORT=5000
   ```
3. Start the server:
   ```
   npm run dev
   ```
   You should see `MongoDB connected` and `Server running on port 5000`.

### Frontend

1. Navigate to the frontend folder:
   ```
   cd frontend/my-app
   npm install
   ```
2. Update `constants/api.js` with your computer's local network IP address
   (not `localhost`) so a physical phone or emulator can reach the backend:
   ```js
   export const API_URL = 'http://YOUR_LOCAL_IP:5000/api';
   ```
   - Find your IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux).
   - If using an Android emulator instead of a physical device, use
     `10.0.2.2` instead of your real IP.
3. Start the app:
   ```
   npx expo start
   ```
   Scan the QR code with Expo Go, or press `a` for an Android emulator.

**Note:** Your phone and computer must be on the same Wi-Fi network. If the
app can't reach the backend, check that Windows Firewall allows inbound
connections on port 5000.

## API Endpoints

All protected routes require an `Authorization: Bearer <token>` header.

**Auth** — `/api/auth`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signup` | Create a new account |
| POST | `/login` | Log in, returns `{ token, user }` |

**Users** — `/api/users`
| Method | Route | Description |
|--------|-------|-------------|
| PUT | `/profile` | Update name/email |
| PUT | `/password` | Change password (requires current password) |

**Medicines** — `/api/medicines`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/` | Add a medicine |
| GET | `/` | List the logged-in user's medicines |
| PUT | `/:id` | Update a medicine |
| DELETE | `/:id` | Delete a medicine |

**Dose Logs** — `/api/doselogs`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/` | Log a dose (taken/missed/skipped, photo optional) |
| GET | `/` | List the logged-in user's dose logs, newest first |

**Appointments** — `/api/appointments`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/` | Add an appointment |
| GET | `/` | List the logged-in user's appointments |
| PUT | `/:id` | Update an appointment (including marking completed) |
| DELETE | `/:id` | Delete an appointment |

## Known Limitations

- `npm audit` reports vulnerabilities in Expo's build tooling (`metro`,
  `postcss`, `image-size`, `uuid`) as of Expo SDK 54. These affect only the
  build/dev toolchain, not the shipped app, and a fix is only available via
  a breaking upgrade to Expo SDK 57 — intentionally deferred to keep the
  project on its required tech stack.
- Photos are stored as base64 strings directly in MongoDB rather than a
  separate file/object storage service, to avoid adding cloud storage
  dependencies for a college assignment scope.
- Theme preference and login session are both in-memory only (no
  AsyncStorage) and reset when the app reloads — a deliberate simplicity
  trade-off for this project.
- Map integration opens the device's native Maps app with saved coordinates
  rather than showing an embedded in-app map, since `react-native-maps`
  requires a custom dev client incompatible with plain Expo Go.