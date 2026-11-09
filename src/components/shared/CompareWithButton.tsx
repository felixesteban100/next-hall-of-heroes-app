import { getRandomIds } from '@/lib/character_utils'
import { LoadingLink } from './LoadingLink'
import { MAX_TEAM_SIZE } from '@/app/(main)/matchup/page'

export default function CompareWithButton({ ids }: { ids: number[] }) {
    const href = `/matchup?a=${getRandomIds(ids).join(",")}`

    return (
        <LoadingLink href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Match up with {`(random ${MAX_TEAM_SIZE} max)`}
        </LoadingLink>
    )
}
