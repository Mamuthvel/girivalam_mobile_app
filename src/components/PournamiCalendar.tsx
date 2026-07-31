import React, { useState, lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Moon } from "lucide-react";

interface PournamiCalendarProps {
  children: React.ReactNode;
}

const LazyCalendarContent = lazy(() => import('./PournamiCalendarContent'));

export const PournamiCalendar: React.FC<PournamiCalendarProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-playfair">
            <Moon className="h-5 w-5 text-primary" />
            Pournami Calendar
          </DialogTitle>
        </DialogHeader>
        {open && (
          <Suspense fallback={<div className="p-6 text-center text-sm text-muted-foreground">Loading calendar…</div>}>
            <LazyCalendarContent />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
};
