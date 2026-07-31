import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Trash2, Database, Calendar, HardDrive, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { logger } from "@/lib/logger";

interface BackupLog {
  id: string;
  backup_file_path: string;
  backup_size_bytes: number;
  backup_type: string;
  status: string;
  created_at: string;
  table_count: number;
  total_rows: number;
}

export const DatabaseBackup = () => {
  const [backups, setBackups] = useState<BackupLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('backup_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setBackups(data || []);
    } catch (error: any) {
      logger.error('Error fetching backups:', error);
      toast({
        title: "Error",
        description: "Failed to load backup history",
        variant: "destructive"
      });
    }
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-backup', {
        method: 'POST'
      });

      if (error) throw error;

      toast({
        title: "Backup Created",
        description: `Successfully created backup: ${data.filename}`
      });

      fetchBackups();
    } catch (error: any) {
      logger.error('Backup error:', error);
      toast({
        title: "Backup Failed",
        description: error.message || "Failed to create backup",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async (filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('database-backups')
        .download(filename);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${filename}`
      });
    } catch (error: any) {
      logger.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const restoreBackup = async () => {
    if (!restoreFile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('restore-backup', {
        body: { filename: restoreFile }
      });

      if (error) throw error;

      toast({
        title: "Restore Completed",
        description: `Restored ${data.restoredTables} tables with ${data.restoredRows} rows`
      });

      setRestoreFile(null);
    } catch (error: any) {
      logger.error('Restore error:', error);
      toast({
        title: "Restore Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBackup = async (filename: string) => {
    try {
      const { error } = await supabase.storage
        .from('database-backups')
        .remove([filename]);

      if (error) throw error;

      toast({
        title: "Backup Deleted",
        description: `Deleted ${filename}`
      });

      fetchBackups();
    } catch (error: any) {
      logger.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Backup & Restore
          </CardTitle>
          <CardDescription>
            Create, download, and restore database backups. Backups include all application data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Restoring a backup will replace all current data. Make sure you have a recent backup before restoring.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={createBackup} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <Database className="mr-2 h-4 w-4" />
            {loading ? 'Creating Backup...' : 'Create Backup Now'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>
            View and manage your database backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No backups available. Create your first backup above.
              </p>
            ) : (
              backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{backup.backup_file_path}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(backup.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatBytes(backup.backup_size_bytes)}
                      </span>
                      <span>
                        {backup.table_count} tables, {backup.total_rows.toLocaleString()} rows
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadBackup(backup.backup_file_path)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRestoreFile(backup.backup_file_path)}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteBackup(backup.backup_file_path)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!restoreFile} onOpenChange={() => setRestoreFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Database Backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all current data with the backup from: <strong>{restoreFile}</strong>
              <br /><br />
              This action cannot be undone. Make sure you have a recent backup of the current data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={restoreBackup} disabled={loading}>
              {loading ? 'Restoring...' : 'Restore Backup'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
