"use client"

import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Image from "next/image"

export function CharacterImageCarousel({ images, name }: { images: string[], name: string }) {
  return (
    <Carousel
      className="w-80 h-[24rem] rounded-lg overflow-hidden shrink-0"
      plugins={[
        Autoplay({
          delay: 2500,
        }),
      ]}
      opts={{
        loop: true,
        align: "start",
      }}
    >
      <CarouselContent className="-ml-0 h-full">
        {images.map((image, index) => (
          <CarouselItem key={index} className="pl-0 h-full">
            <div className="relative h-[24rem] w-full bg-muted rounded-lg overflow-hidden">
              <Image
                src={image}
                alt={`${name}-${index}`}
                fill
                sizes="320px"
                className="object-cover rounded-lg transition-opacity duration-700"
                priority={index === 0}
                unoptimized
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}