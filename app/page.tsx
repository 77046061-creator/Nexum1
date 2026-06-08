import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 md:px-16">
        <div className="mt-2 flex items-center justify-between rounded-2xl border border-outline-variant/40 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-heading-md text-primary">
              Nexum
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/" className="text-label-md text-on-surface-variant transition-colors hover:text-on-surface">
                Inicio
              </Link>
              {user && (
                <Link href="/dashboard" className="text-label-md text-on-surface-variant transition-colors hover:text-on-surface">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-3 py-2 sm:px-4 text-label-md text-on-primary transition-opacity hover:opacity-90"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-on-primary/20 text-xs font-semibold text-on-primary">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <a
                  href="/api/auth/logout"
                  className="inline-flex items-center rounded-lg border border-outline-variant px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                >
                  <svg className="sm:hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="hidden sm:inline">Salir</span>
                </a>
              </>
            ) : (
              <a
                href="/api/auth/discord"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 sm:px-5 text-label-md text-on-primary transition-opacity hover:opacity-90"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span className="hidden sm:inline">Conectar con Discord</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex flex-col items-center px-4 pt-36 pb-20 text-center md:px-16 md:pt-44 md:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(31,53,37,0.06)_0%,_transparent_70%)]" />
      <div className="relative max-w-3xl">
        <h1 className="text-display text-primary">
          Tu conocimiento,
          <br />
          organizado.
        </h1>
        <p className="mt-6 text-body-lg text-on-surface-variant md:px-12">
          Sube exámenes, prácticas, resúmenes y fórmulas desde Discord o desde la web.
          Revisa todo en tu Depth Board personal.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="/api/auth/discord"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-8 py-3.5 text-body-md font-semibold text-on-primary transition-all hover:opacity-90"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Comenzar con Discord
          </a>
        </div>
      </div>
    </section>
  );
}

async function CommunityStats() {
  const admin = createAdminClient();
  const [{ count: totalItems }, { count: totalUsers }, { data: subjects }] =
    await Promise.all([
      admin.from("items").select("*", { count: "exact", head: true }),
      admin.from("users").select("*", { count: "exact", head: true }),
      admin.from("subjects").select("display_name").order("display_name"),
    ]);

  return (
    <section className="px-4 py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
            <p className="text-display text-primary">{totalItems || 0}</p>
            <p className="mt-1 text-label-md text-on-surface-variant">Materiales subidos</p>
          </div>
          <div className="rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
            <p className="text-display text-primary">{totalUsers || 0}</p>
            <p className="mt-1 text-label-md text-on-surface-variant">Estudiantes</p>
          </div>
          <div className="col-span-2 rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm md:col-span-1">
            <p className="text-display text-primary">{subjects?.length || 0}</p>
            <p className="mt-1 text-label-md text-on-surface-variant">Materias</p>
          </div>
        </div>
        {subjects && subjects.length > 0 && (
          <p className="mt-6 text-center text-label-md text-on-surface-variant">
            {subjects.map((s) => s.display_name).join(" · ")}
          </p>
        )}
      </div>
    </section>
  );
}

const steps = [
  {
    number: "01",
    title: "Conecta con Discord",
    description: "Inicia sesión con tu cuenta de Discord. Sin correos ni contraseñas.",
  },
  {
    number: "02",
    title: "Sube tu material",
    description: "Desde Discord con /subir o directo desde la web. PDF, imágenes y documentos.",
  },
  {
    number: "03",
    title: "Revisa en tu Depth Board",
    description: "Visualiza, busca y descarga todo desde tu tablero personal.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface-container-lowest px-4 py-20 md:px-16 md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-heading-lg text-center text-primary">Cómo funciona</h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group rounded-xl bg-surface p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-label-sm font-semibold text-outline">{step.number}</span>
              <h3 className="mt-3 text-heading-md text-primary">{step.title}</h3>
              <p className="mt-2 text-body-md text-on-surface-variant">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContentTypes() {
  const defaultTypes = [
    { icon: "📝", name: "Prácticas pasadas" },
    { icon: "📄", name: "Exámenes" },
    { icon: "📑", name: "Resúmenes" },
    { icon: "📐", name: "Fórmulas" },
  ];

  return (
    <section className="px-4 py-20 md:px-16 md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-heading-lg text-center text-primary">Tipos de contenido</h2>
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {defaultTypes.map((type) => (
            <div
              key={type.name}
              className="group flex items-center gap-5 rounded-xl border border-outline-variant/30 bg-surface px-6 py-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-3xl">{type.icon}</span>
              <span className="text-heading-md text-primary">{type.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer_() {
  return (
    <footer className="border-t border-outline-variant/30 px-4 py-10 md:px-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <span className="text-heading-md text-primary">Nexum</span>
        <p className="text-body-md text-on-surface-variant">
          Hecho por estudiantes, para estudiantes.
        </p>
        <div className="flex gap-6 text-label-md text-on-surface-variant">
          <a href="#" className="hover:text-on-surface">Términos</a>
          <a href="#" className="hover:text-on-surface">Privacidad</a>
          <a href="#" className="hover:text-on-surface">Contacto</a>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{background:"#eefdf3 url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.06'%3E%3Cpath d='M0 0h1v40H0zM39 0h1v40h-1zM0 0v1h40V0zM0 39v1h40v-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\"),radial-gradient(ellipse 80% 60% at 0% 20%,rgba(59,130,246,0.1),transparent),radial-gradient(ellipse 60% 50% at 100% 80%,rgba(139,92,246,0.08),transparent)"}}
    >
      <Navbar />
      <main className="flex-1">
        <Hero />
        <CommunityStats />
        <HowItWorks />
        <ContentTypes />
      </main>
      <Footer_ />
    </div>
  );
}
