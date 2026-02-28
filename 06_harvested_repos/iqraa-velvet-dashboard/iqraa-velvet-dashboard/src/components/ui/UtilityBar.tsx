'use client';

import { Button } from './button';
import { Share2, Archive, Download, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GlobalConceptAnalyzer } from './GlobalConceptAnalyzer';
import { ModeToggle } from './mode-toggle';
import { useToast } from './use-toast';

export function UtilityBar() {
  const { toast } = useToast();

  const handleSaveAll = () => {
    toast({
      title: "Save All",
      description: "All changes have been (mock) saved.",
    });
  };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <GlobalConceptAnalyzer />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Save All" onClick={handleSaveAll} className="md:w-auto md:px-4">
              <Save className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Save All</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save All (Mock)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Share" className="md:w-auto md:px-4">
              <Share2 className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share Project</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Archive" className="md:w-auto md:px-4">
              <Archive className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Archive</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Archive Project</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Download" className="md:w-auto md:px-4">
              <Download className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Download</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download Data</p>
          </TooltipContent>
        </Tooltip>
        <ModeToggle />
      </div>
    </TooltipProvider>
  );
}
