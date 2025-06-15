<!-- GitHub README for DeliveryCtrl App -->

<h1 align="center">🚚 DeliveryCTRL</h1>

<p align="center">
  A full-stack logistics and delivery management web app designed for admin-driver coordination with shift-based logic, salary automation, and bulk delivery support.
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/platane/platane/output/github-contribution-grid-snake.svg" alt="animated contribution snake" />
</p>

<h3 align="center">📦 Key Features</h3>

<ul>
  <li><b>Role-based Access:</b> Admins and Drivers have distinct dashboards</li>
  <li><b>Delivery Assignment:</b> Admins can assign deliveries based on vehicle & shift constraints</li>
  <li><b>Shift System:</b> Morning, Evening, or Both — impacts delivery eligibility and salary</li>
  <li><b>Smart Salary Rules:</b> Auto-calculated based on attendance, shift, vehicle, and manual overrides</li>
  <li><b>Bulk Delivery Upload:</b> Upload an Excel (.xlsx) to add multiple deliveries at once</li>
  <li><b>Live Status Updates:</b> Drivers can mark deliveries as Picked, In Transit, Delivered</li>
  <li><b>Payout History:</b> Salary breakdown with date-wise tracking & payout logs for both admin and driver</li>
  <li><b>Mobile-Responsive + PWA:</b> Add-to-home prompt and optimized UX across devices</li>
</ul>

<h3 align="center">🛠️ Tech Stack</h3>

<p align="center">
  <b>Frontend:</b> Next.js 14 • TailwindCSS • React<br/>
  <b>Backend:</b> Next.js API Routes • Prisma ORM • PostgreSQL<br/>
  <b>Auth:</b> NextAuth.js (Google + Credentials)<br/>
  <b>Features:</b> Excel Parsing with SheetJS • Attendance Tracking • Delivery Status Transitions • Salary Engine<br/>
  <b>Deployable As:</b> PWA-compatible web app
</p>

<h3 align="center">💻 Getting Started</h3>

<ol>
  <li>Clone the repository:
    <pre><code>git clone https://github.com/your-username/deliveryctrl.git</code></pre>
  </li>
  <li>Install dependencies:
    <pre><code>cd deliveryctrl
npm install</code></pre>
  </li>
  <li>Set up environment variables:
    <pre><code>cp .env.example .env</code></pre>
    <p>Edit the <code>.env</code> file to include your PostgreSQL URL, NEXTAUTH secret or USE</p>
    <p>DATABASE_URL="postgresql://neondb_owner:npg_f2YOCaxIcE4e@ep-shiny-moon-a1ljxvbr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"</p>
<p>NEXTAUTH_SECRET="X5kZG2Kf0MIK9BYnA4oLMREhqjkSKTCH1Qoz5MOGwLM="</p>

<p>NEXT_PUBLIC_APP_URL=http://localhost:3000</p>

<p>NEXT_PUBLIC_BASE_URL=http://localhost:3000</p>
  </li>
  <li>Push Prisma schema to DB:
    <pre><code>npx prisma db push</code></pre>
  </li>
  <li>Start the development server:
    <pre><code>npm run dev</code></pre>
  </li>
</ol>

<h3 align="center">👤 Built by Raghav Kumar</h3>