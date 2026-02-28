'use client';

import { useState, useMemo } from 'react';
import { Source } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Book, Globe, FileText, Newspaper } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSourceStore } from '@/store/sourceStore';
import { Badge } from '@/components/ui/badge';
import { SourceDetailDialog } from '@/components/ui/SourceDetailDialog';
import { PlusCircle } from 'lucide-react';

interface SourceCardProps {
  source: Source;
  onEdit: (source: Source) => void;
}

const sourceIcons = {
  book: Book,
  article: Newspaper,
  website: Globe,
  manuscript: FileText,
};

function SourceCard({ source, onEdit }: SourceCardProps) {
  const Icon = sourceIcons[source.type] || Book;
  return (
    <Card className="bg-card text-card-foreground cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onEdit(source)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center space-x-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span>{source.title}</span>
        </CardTitle>
        <Badge variant="secondary">{source.type}</Badge>
      </CardHeader>
      <CardContent>
        {source.author && <p className="text-xs text-muted-foreground">Author: {source.author}</p>}
        {source.url && <p className="text-xs text-muted-foreground"><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Link</a></p>}
      </CardContent>
    </Card>
  );
}

export function SourceListView() {
  const { sources, addSource } = useSourceStore();
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceType, setNewSourceType] = useState<Source['type'] | undefined>('book');
  const [newSourceAuthor, setNewSourceAuthor] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const { toast } = useToast();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddSource = () => {
    if (newSourceTitle && newSourceType) {
      addSource({
        title: newSourceTitle,
        type: newSourceType,
        author: newSourceAuthor || undefined,
        url: newSourceUrl || undefined,
      });
      setNewSourceTitle('');
      setNewSourceType('book');
      setNewSourceAuthor('');
      setNewSourceUrl('');
      toast({
        title: "Source Added!",
        description: `Source "${newSourceTitle}" has been added.`,
      });
    } else {
      toast({
        title: "Missing Information",
        description: "Please provide a title and type for the new source.",
        variant: "destructive",
      });
    }
  };

  const handleEditSource = (source: Source) => {
    setEditingSource(source);
    setIsEditDialogOpen(true);
  };

  const filteredSources = useMemo(() => {
    if (!searchTerm) return sources;
    return sources.filter(
      (source) =>
        source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (source.author && source.author.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sources, searchTerm]);

  return (
    <>
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Sources Management</h2>

        <div className="space-y-4 rounded-lg border p-4 bg-card">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <PlusCircle className="h-5 w-5" />
            <span>Add New Source</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source-title">Title</Label>
              <Input
                id="source-title"
                value={newSourceTitle}
                onChange={(e) => setNewSourceTitle(e.target.value)}
                placeholder="Source Title"
              />
            </div>
            <div>
              <Label htmlFor="source-type">Type</Label>
              <Select onValueChange={(value: Source['type']) => setNewSourceType(value)} value={newSourceType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="manuscript">Manuscript</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="source-author">Author (Optional)</Label>
              <Input
                id="source-author"
                value={newSourceAuthor}
                onChange={(e) => setNewSourceAuthor(e.target.value)}
                placeholder="Author Name"
              />
            </div>
            <div>
              <Label htmlFor="source-url">URL (Optional)</Label>
              <Input
                id="source-url"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                placeholder="URL"
              />
            </div>
          </div>
          <Button onClick={handleAddSource}>Add Source</Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Existing Sources</h3>
          <Input
            placeholder="Search sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {filteredSources.length === 0 ? (
            <EmptyState title="No Sources Found" description="Try adjusting your search or add new sources." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSources.map((source) => (
                <SourceCard key={source.id} source={source} onEdit={handleEditSource} />
              ))}
            </div>
          )}
        </div>
      </div>
      {editingSource && (
        <SourceDetailDialog
          source={editingSource}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
}
