import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns/format";
import { usePournamiDates } from "@/hooks/get-pournamidates";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PournamiCalendarContent: React.FC = () => {
  const { dates: pournamiDates, nextPournami, daysUntilPournami } = usePournamiDates();

  const pournamiDateObjects = pournamiDates.map(p => p.dateObj);

  const modifiers = { pournami: pournamiDateObjects };
  const modifiersStyles = {
    pournami: {
      backgroundColor: "hsl(var(--primary))",
      color: "white",
      borderRadius: "50%",
      fontWeight: "bold",
    },
  };

  const CustomDay = (props: any) => {
    const { date, displayMonth } = props;
    const pournamiInfo = pournamiDates.find(
      (p) => p.dateObj.toDateString() === date.toDateString()
    );

    const baseClass = "h-9 w-9 p-0 font-normal flex items-center justify-center rounded-md transition-colors";

    if (pournamiInfo) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                {...props.divProps}
                className={`${baseClass} bg-primary text-primary-foreground hover:bg-primary/90 font-bold cursor-default shadow-sm`}
              >
                {date.getDate()}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium text-primary">{pournamiInfo.name}</p>
              <p className="text-xs text-muted-foreground">{format(date, "MMMM dd, yyyy")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div
        {...props.divProps}
        className={`${baseClass} hover:bg-accent hover:text-accent-foreground cursor-default opacity-50`}
      >
        {date.getDate()}
      </div>
    );
  };


  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-primary/10 rounded-lg">
        <p className="text-sm text-muted-foreground">Next Pournami</p>
        <p className="text-lg font-semibold">
          {format(nextPournami, "MMMM dd, yyyy")}
        </p>
        <p className="text-primary text-sm">{daysUntilPournami} days remaining</p>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="default"
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          showOutsideDays={false}
          className="border rounded-md pointer-events-auto shadow-sm bg-background"
          components={{
            Day: CustomDay
          }}
        />
      </div>
    </div>
  );
};

export default PournamiCalendarContent;
