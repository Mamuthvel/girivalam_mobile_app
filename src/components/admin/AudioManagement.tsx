import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Trash2,
  Play,
  Pause,
  Music,
  RefreshCw,
  FileAudio,
  Volume2,
} from 'lucide-react';

interface SacredAudio {
  id: string;
  mantra_id: string;
  mantra_name: string;
  audio_url: string;
  language: string;
  duration_seconds: number | null;
  audio_type: string;
  linga_id: number | null;
  file_size: number | null;
  file_format: string | null;
  created_at: string;
}

const ASHTA_LINGAMS = [
  { id: 1, name: 'Indra Lingam', tamilName: 'இந்திர லிங்கம்', direction: 'East' },
  { id: 2, name: 'Agni Lingam', tamilName: 'அக்னி லிங்கம்', direction: 'Southeast' },
  { id: 3, name: 'Yama Lingam', tamilName: 'யம லிங்கம்', direction: 'South' },
  { id: 4, name: 'Nirruti Lingam', tamilName: 'நிரிருதி லிங்கம்', direction: 'Southwest' },
  { id: 5, name: 'Varuna Lingam', tamilName: 'வருண லிங்கம்', direction: 'West' },
  { id: 6, name: 'Vayu Lingam', tamilName: 'வாயு லிங்கம்', direction: 'Northwest' },
  { id: 7, name: 'Kubera Lingam', tamilName: 'குபேர லிங்கம்', direction: 'North' },
  { id: 8, name: 'Esanya Lingam', tamilName: 'ஈசான்ய லிங்கம்', direction: 'Northeast' },
];

const SACRED_CHANTS = [
  { id: 'primary-chant', name: 'Primary Arunachala Chant', tamilName: 'முதன்மை அருணாசல கீர்த்தனை' },
  { id: 'ramana-prayer', name: "Ramana's Prayer", tamilName: 'ரமணரின் பிரார்த்தனை' },
  { id: 'indra-mantra', name: 'Indra Mantra', tamilName: 'இந்திர மந்திரம்' },
  { id: 'agni-mantra', name: 'Agni Mantra', tamilName: 'அக்னி மந்திரம்' },
  { id: 'yama-mantra', name: 'Yama Mantra', tamilName: 'யம மந்திரம்' },
  { id: 'nirruti-mantra', name: 'Nirruti Mantra', tamilName: 'நிரிருதி மந்திரம்' },
  { id: 'varuna-mantra', name: 'Varuna Mantra', tamilName: 'வருண மந்திரம்' },
  { id: 'vayu-mantra', name: 'Vayu Mantra', tamilName: 'வாயு மந்திரம்' },
  { id: 'kubera-mantra', name: 'Kubera Mantra', tamilName: 'குபேர மந்திரம்' },
  { id: 'esanya-mantra', name: 'Esanya Mantra', tamilName: 'ஈசான்ய மந்திரம்' },
];

const AudioManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Upload form state
  const [uploadType, setUploadType] = useState<'linga' | 'chant'>('linga');
  const [selectedLingaId, setSelectedLingaId] = useState<string>('');
  const [selectedChantId, setSelectedChantId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('sanskrit');

  // Fetch all audio
  const { data: audioList, isLoading, refetch } = useQuery({
    queryKey: ['admin-sacred-audio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mantra_audio')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SacredAudio[];
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const isLinga = uploadType === 'linga';
      const targetId = isLinga ? selectedLingaId : selectedChantId;
      
      if (!targetId) throw new Error('Please select a target');
      
      // Generate unique file path
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const fileName = `${uploadType}_${targetId}_${Date.now()}.${fileExt}`;
      const filePath = `${uploadType}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('sacred-audio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('sacred-audio')
        .getPublicUrl(filePath);

      // Determine mantra name
      let mantraName = '';
      if (isLinga) {
        const linga = ASHTA_LINGAMS.find(l => l.id === parseInt(targetId));
        mantraName = linga?.name || `Linga ${targetId}`;
      } else {
        const chant = SACRED_CHANTS.find(c => c.id === targetId);
        mantraName = chant?.name || targetId;
      }

      // Check if entry already exists and delete it
      if (isLinga) {
        const { data: existing } = await supabase
          .from('mantra_audio')
          .select('id, audio_url')
          .eq('audio_type', 'linga')
          .eq('linga_id', parseInt(targetId))
          .maybeSingle();

        if (existing) {
          // Delete old file from storage
          const oldPath = existing.audio_url.split('/sacred-audio/')[1];
          if (oldPath) {
            await supabase.storage.from('sacred-audio').remove([oldPath]);
          }
          // Delete old record
          await supabase.from('mantra_audio').delete().eq('id', existing.id);
        }
      } else {
        const { data: existing } = await supabase
          .from('mantra_audio')
          .select('id, audio_url')
          .eq('audio_type', 'chant')
          .eq('mantra_id', targetId)
          .maybeSingle();

        if (existing) {
          const oldPath = existing.audio_url.split('/sacred-audio/')[1];
          if (oldPath) {
            await supabase.storage.from('sacred-audio').remove([oldPath]);
          }
          await supabase.from('mantra_audio').delete().eq('id', existing.id);
        }
      }

      // Insert new record
      const { error: insertError } = await supabase
        .from('mantra_audio')
        .insert({
          mantra_id: isLinga ? `linga-${targetId}` : targetId,
          mantra_name: mantraName,
          audio_url: urlData.publicUrl,
          language,
          audio_type: uploadType,
          linga_id: isLinga ? parseInt(targetId) : null,
          file_size: file.size,
          file_format: fileExt,
        });

      if (insertError) throw insertError;

      return { success: true };
    },
    onSuccess: () => {
      toast({ title: 'Audio uploaded successfully!' });
      queryClient.invalidateQueries({ queryKey: ['admin-sacred-audio'] });
      queryClient.invalidateQueries({ queryKey: ['sacred-audio'] });
      queryClient.invalidateQueries({ queryKey: ['all-linga-audio'] });
      queryClient.invalidateQueries({ queryKey: ['all-chant-audio'] });
      resetUploadForm();
      setUploadDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (audio: SacredAudio) => {
      // Delete from storage
      const filePath = audio.audio_url.split('/sacred-audio/')[1];
      if (filePath) {
        await supabase.storage.from('sacred-audio').remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('mantra_audio')
        .delete()
        .eq('id', audio.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Audio deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-sacred-audio'] });
      queryClient.invalidateQueries({ queryKey: ['sacred-audio'] });
      queryClient.invalidateQueries({ queryKey: ['all-linga-audio'] });
      queryClient.invalidateQueries({ queryKey: ['all-chant-audio'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetUploadForm = () => {
    setSelectedFile(null);
    setSelectedLingaId('');
    setSelectedChantId('');
    setLanguage('sanskrit');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: 'Please select a file', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(selectedFile);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePlayPause = (audio: SacredAudio) => {
    if (playingId === audio.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(audio.audio_url);
      newAudio.onended = () => setPlayingId(null);
      newAudio.play();
      audioRef.current = newAudio;
      setPlayingId(audio.id);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAssignedItem = (audio: SacredAudio) => {
    if (audio.audio_type === 'linga' && audio.linga_id) {
      const linga = ASHTA_LINGAMS.find(l => l.id === audio.linga_id);
      return linga ? `${linga.name} (${linga.direction})` : `Linga ${audio.linga_id}`;
    }
    const chant = SACRED_CHANTS.find(c => c.id === audio.mantra_id);
    return chant?.name || audio.mantra_name;
  };

  const lingaAudioList = audioList?.filter(a => a.audio_type === 'linga') || [];
  const chantAudioList = audioList?.filter(a => a.audio_type === 'chant') || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Sacred Audio Manager
              </CardTitle>
              <CardDescription>
                Manage audio files for Ashta Lingam temples and Sacred Chanting Guide
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Audio
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Sacred Audio</DialogTitle>
                    <DialogDescription>
                      Upload audio for a Linga temple or Sacred Chant
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Audio Type</Label>
                      <Select value={uploadType} onValueChange={(v) => setUploadType(v as 'linga' | 'chant')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linga">Ashta Lingam Temple</SelectItem>
                          <SelectItem value="chant">Sacred Chant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {uploadType === 'linga' ? (
                      <div className="space-y-2">
                        <Label>Select Lingam</Label>
                        <Select value={selectedLingaId} onValueChange={setSelectedLingaId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a Lingam" />
                          </SelectTrigger>
                          <SelectContent>
                            {ASHTA_LINGAMS.map(linga => (
                              <SelectItem key={linga.id} value={linga.id.toString()}>
                                {linga.name} ({linga.direction})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Select Chant</Label>
                        <Select value={selectedChantId} onValueChange={setSelectedChantId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a Chant" />
                          </SelectTrigger>
                          <SelectContent>
                            {SACRED_CHANTS.map(chant => (
                              <SelectItem key={chant.id} value={chant.id}>
                                {chant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sanskrit">Sanskrit</SelectItem>
                          <SelectItem value="tamil">Tamil</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Audio File</Label>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Supports MP3, WAV, M4A, OGG, and other audio formats. No size limit.
                      </p>
                    </div>

                    {selectedFile && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileAudio className="h-4 w-4" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                      {isUploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="linga" className="space-y-4">
        <TabsList>
          <TabsTrigger value="linga" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Ashta Lingam ({lingaAudioList.length}/8)
          </TabsTrigger>
          <TabsTrigger value="chant" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Sacred Chants ({chantAudioList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="linga">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading audio files...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lingam</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ASHTA_LINGAMS.map(linga => {
                      const audio = lingaAudioList.find(a => a.linga_id === linga.id);
                      return (
                        <TableRow key={linga.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{linga.name}</p>
                              <p className="text-xs text-muted-foreground">{linga.direction}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {audio ? (
                              <Badge variant="outline">{audio.language}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {audio?.file_format?.toUpperCase() || '-'}
                          </TableCell>
                          <TableCell>
                            {formatFileSize(audio?.file_size || null)}
                          </TableCell>
                          <TableCell>
                            {audio ? new Date(audio.created_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {audio ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePlayPause(audio)}
                                >
                                  {playingId === audio.id ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Audio?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the audio for {linga.name}.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteMutation.mutate(audio)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            ) : (
                              <Badge variant="secondary">No Audio</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chant">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading audio files...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chant</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SACRED_CHANTS.map(chant => {
                      const audio = chantAudioList.find(a => a.mantra_id === chant.id);
                      return (
                        <TableRow key={chant.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{chant.name}</p>
                              <p className="text-xs text-muted-foreground">{chant.tamilName}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {audio ? (
                              <Badge variant="outline">{audio.language}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {audio?.file_format?.toUpperCase() || '-'}
                          </TableCell>
                          <TableCell>
                            {formatFileSize(audio?.file_size || null)}
                          </TableCell>
                          <TableCell>
                            {audio ? new Date(audio.created_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {audio ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePlayPause(audio)}
                                >
                                  {playingId === audio.id ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Audio?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the audio for {chant.name}.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteMutation.mutate(audio)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            ) : (
                              <Badge variant="secondary">No Audio</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AudioManagement;
