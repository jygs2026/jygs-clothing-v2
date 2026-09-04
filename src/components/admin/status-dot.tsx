import type { UserStatus } from "@/lib/admin/directory";
import { cn } from "@/lib/utils";

const TONES: Record<UserStatus, string> = {
  Active: "text-emerald-700 dark:text-emerald-400",
  Inactive: "text-rose-700 dark:text-rose-400",
  Invited: "text-amber-700 dark:text-amber-400",
};

/**
 * Status as a word with a dot beside it. The dot is the quick read down a
 * column; the word is there because colour alone is not a label.
 */
export function StatusDot({ status }: { status: UserStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px]", TONES[status])}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
