import { StarsValue } from "@components/data";

type HotelStarsProps = {
  className?: string;
  max?: number;
  value: number;
};

function HotelStars({ className, max = 6, value }: HotelStarsProps) {
  return <StarsValue className={className} max={max} value={value} />;
}

export { HotelStars };
