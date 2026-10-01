"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
}

function Progress({
  className,
  indicatorClassName,
  value = 0,
  ...props
}: ProgressProps) {
  const [currentValue, setCurrentValue] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    let timer: NodeJS.Timeout

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            setCurrentValue(value || 0)
          }, 200) // Reduced to 200ms for instant mobile response

          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [value])

  return (
    <ProgressPrimitive.Root
      ref={ref}
      data-slot="progress"
      className={cn(
        "relative flex h-1.5 w-full items-center overflow-hidden rounded-full bg-muted",
        className
      )}
      value={currentValue > 100 ? 100 : currentValue}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "size-full flex-1 bg-primary transition-transform duration-1000 ease-out",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (currentValue || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }