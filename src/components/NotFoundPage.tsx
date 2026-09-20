type NotFoundPageProps = {
  path: string;
  onGoHome: () => void;
};

function NotFoundPage({ path, onGoHome }: NotFoundPageProps) {
  return (
    <main className="app-shell not-found-page">
      <section className="panel">
        <p className="eyebrow">Error 404</p>
        <h1>This page does not exist</h1>
        <p>
          Nothing is published at <code>{path}</code>. The link may be mistyped, or the page may
          have been moved.
        </p>
        <button type="button" className="primary-button" onClick={onGoHome}>
          Back to home
        </button>
      </section>
    </main>
  );
}

export default NotFoundPage;
