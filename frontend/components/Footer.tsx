export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p className="tracking-label">
          &copy; {new Date().getFullYear()} Studio
        </p>
        <p>Murales &middot; Fine Art &middot; Diseño Gráfico &middot; Brand Design</p>
      </div>
    </footer>
  );
}
