"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

const AddToListDialog = ({ 
  manga, 
  onAddToList 
}: { 
  manga: any, 
  onAddToList: (status: string, progress: number) => void 
}) => {
  const [status, setStatus] = useState('CURRENT')
  const [progress, setProgress] = useState(0)

  const handleAddToList = () => {
    onAddToList(status, progress)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs hover:bg-transparent">
          Add to List
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {manga.displayTitle} to Your List</DialogTitle>
          <DialogDescription>
            Track your reading progress and update your manga status.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CURRENT">Currently Reading</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PLANNING">Plan to Read</SelectItem>
                <SelectItem value="DROPPED">Dropped</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="progress" className="text-right">
              Progress
            </Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max={manga.chapters || 1000}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="col-span-3"
              placeholder="Chapters read"
            />
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleAddToList}>
            Add to List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AddToListDialog }
