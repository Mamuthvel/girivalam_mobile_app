import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Power, Sparkles } from 'lucide-react'
import { LandmarkFormValues } from '@/schemas/landmark.schema'
import { Tables } from '@/integrations/supabase/types'


type LandmarkRow = Tables<'landmarks'>

interface Props {
  data: LandmarkRow[]
  onEdit: (landmark: LandmarkRow) => void
  onToggle: (landmark: LandmarkRow) => void
  onDelete: (id: Number) => void
}

export default function LandmarkTable({
  data,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Photo</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Lat / Lng</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((l) => (
          <TableRow key={l.id}>
            <TableCell>
              {(l as any).image_url ? (
                <div className="w-10 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-gray-100 flex-shrink-0">
                  <img
                    src={(l as any).image_url}
                    alt={l.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="w-10 h-12 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-300 text-xs flex-shrink-0">
                  📷
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {l.name}
                {l.is_ashta_lingam && (
                  <Badge variant="outline" className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 gap-1">
                    <Sparkles className="h-3 w-3" />
                    Aṣṭa
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{l.type}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={l.is_active ? 'default' : 'secondary'}>
                {l.is_active ? 'Active' : 'Disabled'}
              </Badge>
            </TableCell>
            <TableCell className="text-xs">
              {l.lat.toFixed(4)}, {l.lng.toFixed(4)}
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button size="sm" variant="outline" onClick={() => onEdit(l)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => onToggle(l)}>
                <Power className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(l.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}

        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No landmarks found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
