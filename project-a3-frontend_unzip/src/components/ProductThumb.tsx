import { Headphones, Watch, BatteryCharging, Cable, Laptop, Smartphone, Package } from "lucide-react";

const iconMap: Record<string, typeof Headphones> = {
  headphones: Headphones,
  watch: Watch,
  powerbank: BatteryCharging,
  earbuds: Cable,
  stand: Laptop,
  phonecase: Smartphone,
};

export function ProductThumb({ image, className = "" }: { image: string; className?: string }) {
  const Icon = iconMap[image] ?? Package;
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-accent-50 to-ink-100 text-accent-600 ${className}`}
    >
      <Icon size={28} strokeWidth={1.5} />
    </div>
  );
}
