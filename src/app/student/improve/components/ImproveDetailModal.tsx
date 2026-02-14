'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ImproveDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: React.ReactNode;
}

export function ImproveDetailModal({ open, onOpenChange, title, content }: ImproveDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-w-2xl h-[90vh] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-3 border-b border-border/60 bg-muted/30">
          <DialogTitle className="pr-8 text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 px-6 flex flex-col overflow-hidden">
          <ScrollArea className="h-full min-h-0">
            <div className="pb-6 pt-4 pr-3 text-muted-foreground [&_.whitespace-pre-line]:text-foreground">
              {content}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
