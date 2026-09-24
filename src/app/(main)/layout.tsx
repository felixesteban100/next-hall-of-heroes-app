import Navbar from "@/components/navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen">
            <header>
                <Navbar />
            </header>
            <div className="p-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </div>
        </div>
    )
}