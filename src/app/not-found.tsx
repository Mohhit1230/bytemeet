import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h2 className="text-accent mb-2 text-4xl font-bold">Not Found</h2>
      <p className="text-muted-foreground mb-6">Could not find requested resource</p>
      <Link
        href="/"
        className="bg-accent text-accent-foreground rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
      >
        Return Home
      </Link>
    </div>
  );
}
