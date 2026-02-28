'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { useToast } from './use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Concept } from '@/types';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from './textarea';
import { useSourceStore } from '@/store/sourceStore';
import { Badge } from './badge';

const formSchema = z.object({
  content: z.string().min(1, { message: "Concept content cannot be empty." }),
  type: z.enum(["idea", "quote", "question", "insight"]),
  sourceId: z.string().optional(),
  tags: z.string().optional(),
});

type ConceptEditFormValues = z.infer<typeof formSchema>;

interface ConceptEditDialogProps {
  concept: Concept;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConceptEditDialog({ concept, projectId, open, onOpenChange }: ConceptEditDialogProps) {
  const updateConceptInProject = useProjectStore((state) => state.updateConceptInProject);
  const { sources } = useSourceStore();
  const { toast } = useToast();
  const [currentTagsInput, setCurrentTagsInput] = useState(concept.tags ? concept.tags.join(', ') : '');

  const form = useForm<ConceptEditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: concept.content,
      type: concept.type,
      sourceId: concept.sourceId,
      tags: concept.tags ? concept.tags.join(', ') : '',
    },
  });

  async function onSubmit(values: ConceptEditFormValues) {
    const tagsArray = values.tags ? values.tags.split(', ').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
    updateConceptInProject(projectId, concept.id, { ...values, tags: tagsArray });
    onOpenChange(false);
    toast({
      title: "Concept Updated!",
      description: "The concept has been successfully updated.",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Concept</DialogTitle>
          <DialogDescription>
            Make changes to this concept here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Concept content" {...field} className="min-h-[100px] resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concept Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="quote">Quote</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="insight">Insight</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sourceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Source (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {sources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.title} ({source.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="tag1, tag2" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        setCurrentTagsInput(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {currentTagsInput.split(', ').filter(tag => tag.trim().length > 0).map((tag) => (
                    <Badge key={tag} variant="outline" className="mr-1">{tag.trim()}</Badge>
                  ))}
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
