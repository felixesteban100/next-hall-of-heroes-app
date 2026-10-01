import { ButtonGroup } from '../ui/button-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuGroup } from '../ui/dropdown-menu';
import { ArrowBigDown } from 'lucide-react';
import { Button } from '../ui/button';

export type SortOption = { value: string; label: string };

type SortButtonProps = {
    sort: string
    sortOrientation: string
    updateParam: (key: string, value: string) => void;
    sortOptions: SortOption[]
}

export default function SortButton({ sort, sortOrientation, updateParam, sortOptions }: SortButtonProps) {
    return (
        <ButtonGroup>
            <Button size="sm" variant="outline" aria-label="Toggle sort direction"
                onClick={() => updateParam("sortOrientation", sortOrientation === "asc" ? "desc" : "asc")}
            >
                <ArrowBigDown className={`${sortOrientation === "desc" ? "rotate-180" : ""} transition-all`} />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                        Sort: {sortOptions.find(o => o.value === sort)?.label}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32">
                    <DropdownMenuGroup>
                        <DropdownMenuRadioGroup value={sort} onValueChange={(v) => updateParam("sort", v)}>
                            {sortOptions.map(o => (
                                <DropdownMenuRadioItem key={o.value} value={o.value}>{o.label}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </ButtonGroup>
    )
}
