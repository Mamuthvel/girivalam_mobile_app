import type { Dispatch, SetStateAction } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import { Search, Download } from 'lucide-react';
import type { User } from '../adminTypes';

interface UsersTabProps {
  userSearch: string;
  setUserSearch: Dispatch<SetStateAction<string>>;
  exportUsersToCsv: () => void;
  filteredUsers: User[];
  handleOpenEditUser: (u: User) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>;
  selectedUser: User | null;
  editRole: string;
  setEditRole: Dispatch<SetStateAction<string>>;
  handleSaveUserRole: () => void;
}

const UsersTab = ({
  userSearch,
  setUserSearch,
  exportUsersToCsv,
  filteredUsers,
  handleOpenEditUser,
  isEditDialogOpen,
  setIsEditDialogOpen,
  selectedUser,
  editRole,
  setEditRole,
  handleSaveUserRole,
}: UsersTabProps) => (
  <TabsContent value="users">
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user accounts and roles
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="relative w-full md:w-56">
              <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportUsersToCsv}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.display_name || 'N/A'}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      u.role === 'super_admin'
                        ? 'default'
                        : u.role === 'admin'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {u.role || 'user'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditUser(u)}
                  >
                    View / Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-sm text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Update the role for this user. Changes take effect immediately.
          </DialogDescription>
        </DialogHeader>
        {selectedUser && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">User</div>
              <div className="font-medium">
                {selectedUser.display_name || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedUser.email}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Role</div>
              <Select
                value={editRole}
                onValueChange={(value) => setEditRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveUserRole}>Save changes</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </TabsContent>
);

export default UsersTab;
