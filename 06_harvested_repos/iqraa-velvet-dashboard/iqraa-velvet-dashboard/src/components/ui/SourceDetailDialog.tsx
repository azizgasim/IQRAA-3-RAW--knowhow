'use client';

import { useState } from 'react';
import { Source } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from './button';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from './use-toast';
import { useSourceStore } from '@/store/sourceStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Book, Globe, FileText, Newspaper, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  title: z.string().min(1, { message: "Source title cannot be empty." }),
  type: z.enum(["book", "article", "website", "manuscript"]),
  author: z.string().optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal('')), // Allow empty string for optional URL
});

type SourceEditFormValues = z.infer<typeof formSchema>;

interface SourceDetailDialogProps {
  source: Source;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sourceIcons = {
  book: Book,
  article: Newspaper,
  website: Globe,
  manuscript: FileText,
};

export function SourceDetailDialog({ source, open, onOpenChange }: SourceDetailDialogProps) {
  const { updateSource, deleteSource } = useSourceStore();
  const { toast } = useToast();

  const form = useForm<SourceEditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: source.title,
      type: source.type,
      author: source.author || '',
      url: source.url || '',
    },
  });

  async function onSubmit(values: SourceEditFormValues) {
    updateSource(source.id, values);
    onOpenChange(false);
    toast({
      title: "Source Updated!",
      description: `Source "${values.title}" has been successfully updated.`, // Corrected: escaped " to "
    });
  }

  const handleDelete = () => {
    deleteSource(source.id);
    onOpenChange(false); // Close the dialog after deletion
    toast({
      title: "Source Deleted",
      description: `Source "${source.title}" has been deleted.`, // Corrected: escaped " to "
    });
  };

  const Icon = sourceIcons[source.type] || Book;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            <span>Edit Source</span>
          </DialogTitle>
          <DialogDescription>
            Make changes to this source here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Source Title" {...field} />
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
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="manuscript">Manuscript</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Author Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Source
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this source.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
