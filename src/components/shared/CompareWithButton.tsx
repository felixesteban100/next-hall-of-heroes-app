import { getRandomIds } from '@/lib/character_utils'
import { LoadingLink } from './LoadingLink'
import { CompareMode } from '@/lib/compare/compareParams'

export default function CompareWithButton({ mode, ids }: { mode: CompareMode, ids: number[] }) {
    const href = mode === "team" ?
        `/compare?a=${getRandomIds(ids).join(",")}`
        : `/compare?id1=${ids[0]}`

    return (
        <LoadingLink href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Compare with {mode == "team" && `(random 12 max)`}
        </LoadingLink>
    )
}
