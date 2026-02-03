import React from 'react'
import { Pizza } from 'lucide-react'

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-zinc-100">
        <div className="relative h-48 bg-zinc-200 animate-pulse"></div>
        <div className="p-6">
            <div className="h-6 w-3/4 bg-zinc-200 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-full bg-zinc-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-5/6 bg-zinc-200 rounded animate-pulse mb-6"></div>
            <div className="flex items-center justify-between">
                <div className="h-8 w-8 bg-zinc-200 rounded-full animate-pulse"></div>
                <div className="h-10 w-28 bg-zinc-200 rounded-lg animate-pulse"></div>
            </div>
        </div>
    </div>
)

export default function MenuSkeleton() {
    return (
        <section className="py-12 bg-white" id="menu-skeleton">
            <div className="container mx-auto px-4">
                {/* Category Tabs Skeleton */}
                <div className="flex overflow-x-auto gap-4 mb-10 pb-2 no-scrollbar">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-10 w-28 bg-zinc-200 rounded-full animate-pulse"></div>
                    ))}
                </div>

                {/* Product Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        </section>
    )
}
