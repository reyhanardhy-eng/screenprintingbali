import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const ok = status === "success";
  return <div className="admin-page auth-card">
    <h1>{ok ? "Email verified" : "Verification link expired"}</h1>
    <p className="admin-sub">{ok ? "Your account is ready. Sign in to start a chat." : "Request a new verification email by signing up again or contact us."}</p>
    <Link className="admin-save-btn" href="/#chat">Return to the website</Link>
  </div>;
}
