import { Globe, Check } from "lucide-react";
import { useLanguage, languageOptions } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** Compact globe dropdown to switch UI language (English / Tamil / Telugu / Kannada). */
const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Change language"
          className={cn(
            "flex items-center gap-1 rounded-lg px-2 py-1.5 text-foreground transition-colors hover:bg-primary/10",
            className
          )}
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase">{language}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-[9999] w-44 border-border bg-card shadow-lg">
        {languageOptions.map((opt) => (
          <DropdownMenuItem
            key={opt.code}
            onClick={() => setLanguage(opt.code)}
            className="flex cursor-pointer items-center justify-between"
          >
            <span>
              <span className="font-medium">{opt.nativeName}</span>{" "}
              <span className="text-xs text-muted-foreground">({opt.name})</span>
            </span>
            {language === opt.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
