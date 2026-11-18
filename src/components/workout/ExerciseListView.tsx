import { useState, useMemo } from 'react';
import { BookOpen, Trophy, Plus, Search } from 'lucide-react';
import { DEFAULT_EXERCISES } from '../../data/default-exercises';
import { UserExerciseMeta, MuscleGroup } from '../../types/workout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';

interface ExerciseListViewProps {
  userExercises: Record<string, UserExerciseMeta>;
  onCreateExercise: (name: string, muscleGroup: MuscleGroup) => void;
}

const MUSCLE_GROUPS: { label: string; value: MuscleGroup | 'all' }[] = [
  { label: 'ALL', value: 'all' },
  { label: 'CHEST', value: 'chest' },
  { label: 'BACK', value: 'back' },
  { label: 'LEGS', value: 'legs' },
  { label: 'SHOULDERS', value: 'shoulders' },
  { label: 'ARMS', value: 'arms' },
  { label: 'CORE', value: 'core' },
  { label: 'CONDITIONING', value: 'conditioning' },
  { label: 'OTHER', value: 'other' },
];

export function ExerciseListView({
  userExercises,
  onCreateExercise,
}: ExerciseListViewProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState<MuscleGroup>('chest');

  const allExercises = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        muscleGroup: MuscleGroup;
        isCustom: boolean;
        bestWeight?: number;
        usageCount: number;
      }
    >();

    // Seed defaults
    for (const def of DEFAULT_EXERCISES) {
      map.set(def.id, {
        id: def.id,
        name: def.name,
        muscleGroup: def.muscleGroup,
        isCustom: false,
        usageCount: 0,
      });
    }

    // Merge user exercises & PRs
    for (const [id, userEx] of Object.entries(userExercises)) {
      const existing = map.get(id);
      if (existing) {
        existing.bestWeight = userEx.bestWeight;
        existing.usageCount = userEx.usageCount || 0;
        existing.isCustom = userEx.isCustom;
      } else {
        map.set(id, {
          id,
          name: userEx.name,
          muscleGroup: userEx.muscleGroup,
          isCustom: true,
          bestWeight: userEx.bestWeight,
          usageCount: userEx.usageCount || 0,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [userExercises]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allExercises.filter((item) => {
      if (selectedMuscle !== 'all' && item.muscleGroup !== selectedMuscle) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.muscleGroup.toLowerCase().includes(q)
      );
    });
  }, [allExercises, searchQuery, selectedMuscle]);

  const handleCreate = () => {
    if (!newExerciseName.trim()) return;
    onCreateExercise(newExerciseName.trim(), newExerciseMuscle);
    setNewExerciseName('');
    setDialogOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col space-y-3 px-3 pt-3 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-primary" strokeWidth={2} />
          <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-foreground">
            EXERCISE_INDEX ({filtered.length})
          </h2>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="h-8 px-2.5 text-[10px]"
        >
          <Plus className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
          NEW
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
        <input
          type="text"
          placeholder="Filter by name or muscle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded border border-input bg-card pl-9 pr-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Muscle Filter Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
        {MUSCLE_GROUPS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedMuscle(opt.value)}
            className={`shrink-0 rounded px-2 py-1 text-[10px] font-mono tracking-wider transition-colors border ${
              selectedMuscle === opt.value
                ? 'bg-primary text-primary-foreground border-primary font-bold'
                : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Exercises List */}
      <div className="space-y-1.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded border border-border bg-card p-2.5 text-xs font-mono hover:bg-secondary/40 transition-colors"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-foreground truncate">
                  {item.name}
                </span>
                {item.isCustom && (
                  <Badge variant="outline" className="text-[8px] py-0 px-1 border-warning/40 text-warning">
                    CUSTOM
                  </Badge>
                )}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground capitalize">
                {item.muscleGroup}
                {item.usageCount > 0 && ` • Logged ${item.usageCount} times`}
              </div>
            </div>

            <div className="shrink-0 text-right">
              {item.bestWeight !== undefined && item.bestWeight > 0 ? (
                <div className="flex items-center gap-1 rounded bg-accent/10 border border-accent/30 px-2 py-0.5 text-accent font-bold text-[11px] tabular-nums">
                  <Trophy className="h-3 w-3" strokeWidth={2} />
                  <span>{item.bestWeight}kg</span>
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground/40">NO PR</span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded border border-dashed border-border bg-card/30 p-8 text-center text-xs font-mono text-muted-foreground">
            No exercises match your query.
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>CREATE_CUSTOM_EXERCISE</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                EXERCISE_NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Bulgarian Landmine Squat"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                className="h-10 w-full rounded border border-input bg-background px-3 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                PRIMARY_MUSCLE_GROUP
              </label>
              <select
                value={newExerciseMuscle}
                onChange={(e) => setNewExerciseMuscle(e.target.value as MuscleGroup)}
                className="h-10 w-full rounded border border-input bg-card px-3 text-xs font-mono text-foreground focus:border-primary focus:outline-none capitalize"
              >
                {MUSCLE_GROUPS.filter((m) => m.value !== 'all').map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              CANCEL
            </Button>
            <Button variant="accent" onClick={handleCreate} disabled={!newExerciseName.trim()}>
              SAVE_EXERCISE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
