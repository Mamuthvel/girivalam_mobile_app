import React from "react";
import { format } from "date-fns";
import { CalendarDays, Moon, ChevronRight } from "lucide-react";
import { usePournamiDates } from "@/hooks/get-pournamidates";
import { Link } from "react-router-dom";
import { PournamiCalendar } from "@/components/PournamiCalendar";

const TAMIL_MONTHS: Record<string, string> = {
  January: "தை (Thai)", February: "மாசி (Maasi)", March: "பங்குனி (Panguni)",
  April: "சித்திரை (Chithirai)", May: "வைகாசி (Vaikasi)", June: "ஆனி (Aani)",
  July: "ஆடி (Aadi)", August: "ஆவணி (Aavani)", September: "புரட்டாசி (Purattasi)",
  October: "ஐப்பசி (Aippasi)", November: "கார்த்திகை (Karthigai)", December: "மார்கழி (Margazhi)",
};

const PournamiExpandableCard: React.FC = () => {
  const { nextPournami, daysUntilPournami } = usePournamiDates();
  const monthName = format(nextPournami, "MMMM");
  const tamilMonth = TAMIL_MONTHS[monthName] || monthName;
  const dayName = format(nextPournami, "EEEE");
  const dateFormatted = format(nextPournami, "MMMM dd, yyyy");

  return (
    <Link to="/next-pournami" className="block">
      <div className="spiritual-card cursor-pointer hover:scale-[1.01] transition-all duration-300 bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
        <div className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-primary" />
                <h3 className="font-playfair text-lg md:text-xl font-semibold text-foreground/90">
                  Next Pournami
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-xl md:text-2xl font-bold text-primary">{dateFormatted}</p>
                <p className="text-sm text-muted-foreground">{tamilMonth} • {dayName}</p>
              </div>
              <div className="flex items-center gap-2 pt-1" onClick={e => e.preventDefault()}>
                <PournamiCalendar>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    <CalendarDays className="h-4 w-4" />
                    View Pournami Calendar
                  </button>
                </PournamiCalendar>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <div className="bg-primary/10 rounded-xl px-4 py-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">{daysUntilPournami}</span>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic text-center border-t border-border/50 pt-3">
            Tap to open Pournami Preparation Hub →
          </p>
        </div>
      </div>
    </Link>
  );
};

export default PournamiExpandableCard;
