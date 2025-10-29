

<div align="center">
  <img width="90%" minWidth="500px" alt="GeoRemix" src="https://github.com/user-attachments/assets/311914fb-fa9a-4b67-bf44-f672759dc271" />
</div>

<br />

# 🌍 GeoRemix

**GeoRemix** is a research-driven geo-guessing game created by the **BIT Student Scientific Group at AGH University** in partnership with **NVIDIA**, which blends AI-powered image processing with classic GeoGuessr-style exploration gameplay, inviting players to navigate unfamiliar worlds and pinpoint their locations.

### 🛠️ Technology Stack

Content generation for the project was made possible by custom **AI Processing Chain**. Every panoramic photo used in the game was passed through **ComfyUI** pipeline, that mixes generative models, custom nodes and in-house tooling. The wokrflow enhances street-level captures with depth-aware styling, edge detection, and theme-specific prompts, thus producing visually coherent locations.

The ComfyUI chain runs on the [`RealVisXL_V5.0`](https://huggingface.co/SG161222/RealVisXL_V5.0) SDXL model for generating images, and every batch of renders is automatically tested and scored by the quality model [`PickScore_v1`](https://huggingface.co/yuvalkirstain/PickScore_v1) before we ingest the top panoramas. Technical details are documented in the [`pipeline/README.md`](./pipeline/README.md).

The game application is built on a containerized three-tier architecture. The frontend leverages [**Vite**](https://vitejs.dev/), [**React**](https://react.dev/), and [**TypeScript**](https://www.typescriptlang.org/) with [**Tailwind CSS**](https://tailwindcss.com/) and [**Neobrutalism Components**](https://www.neobrutalism.dev/) for styling. The capabilities also feature panorama viewing via [**Photo Sphere Viewer**](https://photo-sphere-viewer.js.org/) package and interactive map functionality powered by [**Leaflet**](https://leafletjs.com/) and [**MapLibre**](https://maplibre.org/).

The backend runs on [**Flask**](https://flask.palletsprojects.com/en/stable/) with [**SQLAlchemy**](https://www.sqlalchemy.org/), managing player progress, scoring and content serving. The entire stack is orchestrated with Docker Compose, combining nginx as a reverse proxy.

<br />

<div align="center">
  <img width="90%" minWidth="500px" alt="GeoRemix" src="https://github.com/user-attachments/assets/d724dc73-a9f6-4eba-961c-5bdabfac9659" />
</div>

---

### 🎥 Videos
- [Creation process](https://www.youtube.com/watch?v=YOUR_DEV_DIARY_VIDEO)

---

### 🧰 Project Structure
- `frontend/` — [**Vite**](https://vitejs.dev/) + [**React**](https://react.dev/) + [**TypeScript**](https://www.typescriptlang.org/) client with [**Neobrutalism Components**](https://www.neobrutalism.dev/) UI, framer-motion transitions, and custom windowed layout components.
- `backend/` — [**Flask**](https://flask.palletsprojects.com/en/stable/) service serving panoramas, routes, leaderboard, and player management via [**SQLAlchemy**](https://www.sqlalchemy.org/).
- `pipeline/` — [**ComfyUI**](https://github.com/comfyanonymous/ComfyUI)-integrated tooling that transforms raw panoramas into stylised scenes using prompt-driven workflows.
- `docker-compose.yaml` — Bridges **nginx**, frontend, and backend API into one deployment.

---

### 🖥️ Local Setup Instructions
1. **Clone the repository**

   ```bash
   git clone https://github.com/bit-labs/geo-remix.git
   ```

2. **Navigate to the project directory**

   ```bash
   cd geo-remix
   ```

3. **Create a `.env` file in the project root**

   ```env
   API_SECRET_KEY=change-me
   API_PORT=80
   API_HOST=http://localhost/api/
   DATABASE_URL=sqlite:///scores.db
   CLIENT_ORIGIN=http://localhost
   FLASK_ENV=production
   SKIP_API_KEY_CHECK=false
   ```

4. **Start the stack with Docker Compose**

   ```bash
   docker compose up --build
   ```

5. **Open the game** at `http://localhost` (the backend is proxied under `http://localhost/api`).

> 🔁 Rebuild with `docker compose up --build` after changing source files.

---

Happy guessing! 🌐
