import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-white p-4">
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Could not find requested resource</p>
            <Link
                href="/"
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
                Return Home
            </Link>
        </div>
    )
}
