"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value = 0,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
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
          // Wait 2 seconds (2000ms) after coming into view before starting animation
          timer = setTimeout(() => {
            setCurrentValue(value || 0)
          }, 2000)

          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer) // Clean up timer on unmount
    }
  }, [value])

  return (
    <ProgressPrimitive.Root
      ref={ref}
      data-slot="progress"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      value={currentValue}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-transform duration-1000 ease-out"
        style={{ transform: `translateX(-${100 - (currentValue || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }