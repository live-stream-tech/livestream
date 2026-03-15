import { ReactNode } from "react";

interface HorizontalScrollProps {
  title: string | ReactNode;
  children: ReactNode;
}

export default function HorizontalScroll({ title, children }: HorizontalScrollProps) {
  return (
    <div className="mb-6">
      <h2 className="font-bold text-lg px-4 mb-3 text-white">{title}</h2>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 pb-2 pr-8">
          {children}
        </div>
      </div>
    </div>
  );
}