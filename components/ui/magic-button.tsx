import { cn } from "@/lib/utils";

type MagicButtonProps = {
  title: string;
  icon?: React.ReactNode;
  position?: "left" | "right";
  handleClick?: () => void;
  otherClasses?: string;
  asChild?: boolean;
};

export const MagicButton = ({
  title,
  icon,
  position,
  handleClick,
  otherClasses,
  asChild = false,
}: MagicButtonProps) => {
  return (
    <button
      className={cn(
        "relative inline-flex h-12 w-full overflow-hidden rounded-lg bg-[linear-gradient(110deg,#e2cbff,#393bb2,#e2cbff)] bg-[length:200%_100%] p-px hover:bg-right focus-visible:ring-2 focus-visible:ring-purple motion-safe:transition-[background-position] md:w-60",
        !asChild && "md:mt-10"
      )}
      onClick={handleClick}
      tabIndex={asChild ? -1 : undefined}
    >
      <span
        className={cn(
          "inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-7 text-sm font-medium text-white",
          "bg-[--magic-btn-bg]",
          otherClasses
        )}
      >
        {position === "left" && icon}
        {title}
        {position === "right" && icon}
      </span>
    </button>
  );
};
