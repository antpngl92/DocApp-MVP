"use client";

import { useEffect } from "react";
import Link from "next/link";

type PostAuthRedirectProps = Readonly<{
  destination: string;
}>;

const PostAuthRedirect = ({ destination }: PostAuthRedirectProps) => {
  useEffect(() => {
    window.location.replace(destination);
  }, [destination]);

  return (
    <main className="grid min-h-[50vh] place-items-center text-center">
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-muted)]">Redirecting...</p>
        <Link className="text-sm font-semibold text-[var(--primary)]" href={destination}>
          Continue
        </Link>
      </div>
    </main>
  );
};

export default PostAuthRedirect;
