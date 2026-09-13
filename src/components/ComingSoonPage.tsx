type ComingSoonPageProps = {
  title: string;
};

function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <main className="app-shell coming-soon-page">
      <section className="panel coming-soon-card">
        <p className="eyebrow">{title}</p>
        <h1>Coming soon</h1>
        <p>This page is ready as a placeholder. You can design it later without affecting Kundali generation.</p>
      </section>
    </main>
  );
}

export default ComingSoonPage;
