export const metadata = { title: "Sign in | PM Board" };

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/", error } = await searchParams;
  return (
    <div className="login">
      <form method="post" action="/api/login" className="card">
        <h1>PM Board</h1>
        <p className="muted">Enter the board password.</p>
        <input type="hidden" name="next" value={next} />
        <input type="password" name="password" placeholder="Password" autoFocus required />
        {error && <p className="error">Wrong password.</p>}
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
