# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Project workspace and dashboard data

Create and manage mining project profiles in **Projects**. Profiles include project ID, mine and commodity details, location, operating company, reserves, production target, estimated cost, and dates. The project directory supports search, filters, sorting, grid/table views, pagination, archive/restore, CSV export, and CSV/XLSX import. Select **View** to open a project workspace with project-scoped geology, GIS, production, documents, environmental, safety, finance, task, milestone, and team modules.

The Projects summary cards and dashboard portfolio KPIs are calculated from non-archived project profiles. Dashboard production/environment charts, report rows, and mine-map markers remain illustrative sample data and are not connected to project profiles, live mine systems, or operational sensors. Do not use sample data for operational or production decisions.

### Project data modes

- Default `VITE_DATA_MODE=mock`: projects are stored in this browser's local storage. Project module records use a separate mock-data namespace per project. These records are not shared between users or devices. Document uploads in mock mode store file metadata only; they do not save file contents.
- `VITE_DATA_MODE=php`: project and module services call the API at `VITE_API_BASE_URL` (defaults to `/api`). Set these variables in the frontend environment before starting Vite. PHP/MySQL project endpoints are a backend integration contract; the PHP server currently included in this repository only implements health and AI chat endpoints. Project API routes, MySQL persistence, authentication, authorization, and file storage must be implemented by the backend team before switching this mode on.

### PHP project API contract

All JSON responses for collection and single-record reads/writes use `{ "data": ... }`. Project records use a stable API `id` for resource URLs and a human-readable `projectId` such as `CNX-2026-0001` for the directory. A list response is `{ "data": [project, ...] }`; create/update/archive responses are `{ "data": project }`. Errors should use `{ "error": "Readable error message" }` and an appropriate HTTP status. Project create/update request bodies are the project record fields as JSON.

| Method | Expected endpoint | Purpose |
| --- | --- | --- |
| GET, POST | `/api/projects` | List or create project profiles |
| PUT, DELETE | `/api/projects/{id}` | Update or delete a profile |
| PATCH | `/api/projects/{id}/archive` | Set `{ "archived": true|false }` |
| GET, POST | `/api/projects/{id}/geology` | Boreholes, strata and resource records |
| GET, POST | `/api/projects/{id}/gis` | Map layer and location references |
| GET, POST | `/api/projects/{id}/production` | Targets, actuals and dispatch records |
| GET, POST | `/api/projects/{id}/documents` | Document metadata and file upload |
| GET, POST | `/api/projects/{id}/environmental` | Environmental/forest clearances and monitoring |
| GET, POST | `/api/projects/{id}/safety` | Incidents, inspections and corrective actions |
| GET, POST | `/api/projects/{id}/finance` | Project cost records |
| GET, POST | `/api/projects/{id}/tasks` | Project task records |
| GET, POST | `/api/projects/{id}/milestones` | Project milestone records |
| GET, POST | `/api/projects/{id}/team` | Team contacts and project roles |

Each resource also expects `PUT /api/projects/{id}/{resource}/{recordId}` and `DELETE /api/projects/{id}/{resource}/{recordId}` for record updates/deletion. Resource creates/updates send JSON and should return `{ "data": record }`. Document create sends `multipart/form-data` with a `file` field plus metadata (`category`, `version`, `status`, and upload metadata), then returns `{ "data": document }`; document responses may include `downloadUrl` and `previewUrl` when the backend supports them. Deleting a project should cascade-delete its project-scoped records and stored files; the mock adapter also clears that project's local module data.

Example project request:

```json
{
  "projectId": "CNX-2026-0001",
  "name": "North Ridge Expansion",
  "projectType": "Expansion",
  "mineType": "Opencast",
  "commodity": "Coal",
  "coalfield": "Jharia Coalfield",
  "miningBlock": "Jharia Block I",
  "latitude": 23.8,
  "longitude": 86.4,
  "leaseAreaHa": 1200,
  "geologicalReservesMt": 45,
  "operator": "Coal India subsidiary",
  "status": "Under Development",
  "productionTarget": 2.5,
  "estimatedCost": 850,
  "archived": false
}
```

Services are separated under `src/services/`; API configuration and endpoint paths are in `src/config/api.js`; mock browser storage is isolated in `src/mocks/mockStore.js`; project-resource loading and CRUD state is handled by `src/hooks/useProjectResource.js`. Backend responses should preserve the field names used by the forms and stable record IDs.

## Global workspace tools

The existing header search supports `Ctrl+K`/`Cmd+K`, keyboard result navigation, recent searches, and categorized matches for projects/mines, documents, reports, and archives. In mock mode it searches saved project profiles and browser-stored document, report, and archive metadata. Recent searches and recent activity are stored in this browser only. Quick actions open the existing project, upload, report-generation, and analysis forms; this does not create backend records.

In PHP mode, global search calls `GET /api/search?q={encodedQuery}`. Return `{ "data": [{ "id": "stable-id", "type": "Project|Mine|Document|Report|Archive", "title": "Result title", "description": "Short metadata", "path": "/documents?search=..." }] }`. All five fields are required strings. The backend must apply the signed-in user's access permissions before returning matches. This endpoint is an integration contract; it is not implemented by the PHP server currently included in this repository.

The notification center supports read/unread state, history, alerts, and category filters. Mock notification state and recent activity are browser-local and must be replaced with authenticated backend services for shared users, delivery, and audit history.

## Documents module

The Documents page retains its existing folder directory, table, search, sort, category, and starred controls. Document metadata, approval history, versions, and comments are stored in the mock browser library. Uploaded file bytes are held only in memory for the current browser session; refreshing or leaving the session removes access to those bytes. The sample library contains metadata-only files, so they cannot be previewed or downloaded as real originals.

The frontend provides session-local multi-file upload with a 25 MB per-file limit, PDF/image/CSV/XLSX preview (first worksheet for XLSX, when browser decompression support is available), document details, version metadata and restore, approval states, review comments, bulk download/archive/restore/delete, and metadata search. Word, legacy XLS, and ZIP previews are not available without an installed renderer; those formats remain downloadable when file bytes or a backend URL are available. XLSX parsing is dependency-free and limited to the workbook's first worksheet.

The document service is `src/services/documentService.js`. In PHP mode it expects `{ "data": ... }` for successful JSON responses and `{ "error": "Readable error" }` for failures. The collection contract is:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET, POST | `/api/documents` | List documents or upload a file with multipart metadata |
| GET, PUT, DELETE | `/api/documents/{id}` | Read, update metadata/file version, or delete |
| PATCH | `/api/documents/{id}/archive` | Set `{ "archived": true|false }` |
| GET | `/api/documents/{id}/versions` | List version metadata |
| POST | `/api/documents/{id}/versions/{version}/restore` | Restore a version as the current version |
| GET | `/api/documents/{id}/download` | Download the current file |
| GET | `/api/documents/{id}/versions/{version}/download` | Download a historical version |
| GET | `/api/documents/{id}/preview` | Provide a safe preview URL or stream |
| PATCH | `/api/documents/{id}/approval` | Set `Pending Review`, `Approved`, or `Rejected` with a comment |
| POST | `/api/documents/{id}/comments` | Add a reviewer comment |

Upload requests use `multipart/form-data` (`file` plus title, folder, category, project, type, description, tags, and version description). Document records should include stable `id`, `name`, `folder`, `category`, `project`, `type`, `description`, `uploadedBy`, `uploadedAt`, `modifiedAt`, `size`, `version`, `approvalStatus`, `approvalHistory`, `comments`, `versions`, `archived`, and optional safe `previewUrl`/`downloadUrl`. Approval state changes and bulk operations are currently mock-driven; authenticated server-side roles, permissions, immutable audit records, retention policy, and permanent file storage must be implemented by the backend.

Dashboard charts, totals, report rows, and mine-map markers are illustrative sample data and are not connected to project profiles, live mine systems, or operational sensors. Replace them with verified data from an authenticated backend before using the dashboard for operational or production decisions. A production deployment also needs server-side persistence and access controls for project data.

## Mine operations map

The Dashboard uses a live OpenStreetMap base map by default, so it works without a Google billing account. Mine markers use the sample coordinates in `Dashboard.jsx`; replace them with verified site coordinates before field use. OpenStreetMap attribution is shown on the map.

To use Google Maps instead, set `VITE_MAP_PROVIDER=google` and configure `VITE_GOOGLE_MAPS_API_KEY` in `.env.local`. Google Maps requires billing on its Cloud project. For prototyping, Google also offers a no-cost Maps Demo Key with limited features and quotas. If Google authentication fails, the dashboard falls back to OpenStreetMap.

See the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/) and Google's [Maps billing and error guidance](https://developers.google.com/maps/documentation/javascript/error-messages) and [Maps Demo Key instructions](https://developers.google.com/maps/documentation/javascript/demo-key).

## Gemini for the AI Assistant

The React app sends chat requests to `/api/chat`. Vite proxies `/api` to the PHP router at `http://127.0.0.1:8000`; the PHP backend calls Gemini using cURL. The API key remains on the PHP server. Saved-file searches and workspace navigation continue to run locally in the browser.

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Add `GEMINI_API_KEY` and, optionally, `GEMINI_MODEL=gemini-3.8-flash` to `carbonexa-frontend/.env.local`. Do not prefix the Gemini key with `VITE_`.
3. If PHP is listening on a different origin, set `PHP_API_ORIGIN` in `.env.local` (the default is `http://127.0.0.1:8000`).
4. Start the PHP API in one terminal:

   ```sh
   cd carbonexa-frontend
   npm start
   ```

5. Start Vite in another terminal:

   ```sh
   cd carbonexa-frontend
   npm run dev
   ```

Open the URL Vite prints. If port 5173 is occupied, Vite selects an available port. The PHP server requires PHP 8.0 or later with the cURL extension enabled. It loads server variables from the process environment first and then `carbonexa-frontend/.env.local`.

The PHP API exposes `GET /api/health` and `POST /api/chat`. Chat requests accept `{ "message": "...", "history": [] }`; successful responses contain `{ "text": "..." }`. Chat history is currently transient React state and is not stored in MySQL.

See Google's [Gemini API reference](https://ai.google.dev/api) and [API key safety guide](https://ai.google.dev/gemini-api/docs/api-key).
