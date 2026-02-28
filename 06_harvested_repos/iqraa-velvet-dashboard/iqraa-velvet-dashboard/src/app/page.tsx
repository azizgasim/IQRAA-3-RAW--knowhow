'use client';

import { CreateProjectForm } from "@/components/ui/CreateProjectForm";
import { ProjectList } from "@/components/ui/ProjectList";
import { ProjectDetails } from "@/components/ui/ProjectDetails";
import { LensBar } from "@/components/ui/LensBar";
import { UtilityBar } from "@/components/ui/UtilityBar";
import { SidebarNav } from "@/components/ui/SidebarNav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useViewStore } from '@/store/viewStore';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ConceptExplorationView } from '@/app/concept-exploration/page';
import { PrimaryProcessingView } from '@/app/primary-processing/page';
import { SourceListView } from '@/app/sources/page';
import { RecentActivityFeed } from '@/components/ui/RecentActivityFeed';
import { ConceptModelingView } from '@/app/concept-modeling/page';
import { UserSettingsView } from '@/app/settings/page';
import { DecisionExecutionView } from '@/app/decision-execution/page';

import { InteractionExpansionView } from '@/app/interaction-expansion/page';

export default function Home() {
  const { activeView } = useViewStore();

  const renderMainWorkspaceContent = () => {
    switch (activeView) {
      case "projects":
        return (
          <main className="flex-1 p-6">
            <ProjectDetails />
          </main>
        );
      case "concept-exploration":
        return <ConceptExplorationView />;
      case "primary-processing":
        return <PrimaryProcessingView />;
      case "sources":
        return <SourceListView />;
      case "concept-modeling":
        return <ConceptModelingView />;
      case "decision-execution":
        return <DecisionExecutionView />;
      case "interaction-expansion":
        return <InteractionExpansionView />;
      case "settings":
        return <UserSettingsView />;
      default:
        return (
          <div className="flex h-full items-center justify-center text-muted-foreground">Select a view from the sidebar.</div>
        );
    }
  };
  
  const SidebarContent = () => (
    <>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Iqraa 12</h1>
      <SidebarNav className="mb-8" />
      <Separator className="my-4" />
      <Accordion type="multiple" defaultValue={["projects", "new-project"]} className="w-full">
        <AccordionItem value="projects">
          <AccordionTrigger>Projects</AccordionTrigger>
          <AccordionContent>
            <ProjectList />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="new-project">
          <AccordionTrigger>New Project</AccordionTrigger>
          <AccordionContent>
            <CreateProjectForm />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="mt-8">
        <RecentActivityFeed />
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Persistent Sidebar - Large Screens */}
      <aside className="hidden w-64 flex-col border-r border-border p-4 md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Small Screens */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="absolute left-4 top-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4 flex flex-col">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-4 md:justify-start">
          {/* Lens Bar */}
          <div className="flex-1 md:ml-4">
            <LensBar />
          </div>
          {/* Utility Zone */}
          <div className="w-auto flex justify-end md:w-64">
             <UtilityBar />
          </div>
        </header>

        {/* Main Workspace */}
        {renderMainWorkspaceContent()}
      </div>
    </div>
  );
}
