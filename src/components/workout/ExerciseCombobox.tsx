import { useState, useMemo } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '../ui/drawer';
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from '../ui/command';
import { Badge } from '../ui/badge';
import { DEFAULT_EXERCISES } from '../../data/default-exercises';
import { UserExerciseMeta, MuscleGroup } from '../../types/workout';
import { slugify } from '../../lib/utils';

interface ExerciseComboboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userExercises: Record<string, UserExerciseMeta>;
  onSelectExercise: (exercise: {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    isCustom: boolean;
  }) => void;
  onCreateCustomExercise: (name: string, muscleGroup: MuscleGroup) => void;
}

const MUSCLE_FILTER_OPTIONS: { label: string; value: MuscleGroup | 'all' }[] = [
  { label: 'ALL', value: 'all' },
  { label: 'CHEST', value: 'chest' },
  { label: 'BACK', value: 'back' },
  { label: 'LEGS', value: 'legs' },
  { label: 'SHOULDERS', value: 'shoulders' },
  { label: 'ARMS', value: 'arms' },
  { label: 'CORE', value: 'core' },
  { label: 'CARDIO', value: 'conditioning' },
];

export function ExerciseCombobox({
  open,
  onOpenChange,
  userExercises,
  onSelectExercise,
  onCreateCustomExercise,
}: ExerciseComboboxProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all');

  // Merge default exercises with user exercises and rank by usage
  const mergedExercises = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        muscleGroup: MuscleGroup;
        usageCount: number;
        lastUsedAt: number;
        isCustom: boolean;
        aliases?: string[];
      }
    >();

    // Add static seed
    for (const def of DEFAULT_EXERCISES) {
      map.set(def.id, {
        id: def.id,
        name: def.name,
        muscleGroup: def.muscleGroup,
        usageCount: 0,
        lastUsedAt: 0,
        isCustom: false,
        aliases: def.aliases,
      });
    }

    // Overlay user exercises & custom items
    for (const [id, userEx] of Object.entries(userExercises)) {
      const existing = map.get(id);
      if (existing) {
        existing.usageCount = userEx.usageCount || 0;
        existing.lastUsedAt = userEx.lastUsedAt || 0;
        existing.isCustom = userEx.isCustom;
      } else {
        map.set(id, {
          id,
          name: userEx.name,
          muscleGroup: userEx.muscleGroup,
          usageCount: userEx.usageCount || 0,
          lastUsedAt: userEx.lastUsedAt || 0,
          isCustom: true,
        });
      }
    }

    const list = Array.from(map.values());

    // Sort: most used & recently used first, then alphabetical
    list.sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      if (b.lastUsedAt !== a.lastUsedAt) {
        return b.lastUsedAt - a.lastUsedAt;
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [userExercises]);

  // Filtered by search and muscle
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return mergedExercises.filter((item) => {
      if (selectedMuscle !== 'all' && item.muscleGroup !== selectedMuscle) {
        return false;
      }
      if (!q) return true;

      const matchesName = item.name.toLowerCase().includes(q);
      const matchesAliases = item.aliases?.some((a) => a.toLowerCase().includes(q));
      const matchesMuscle = item.muscleGroup.toLowerCase().includes(q);
      return matchesName || matchesAliases || matchesMuscle;
    });
  }, [mergedExercises, searchQuery, selectedMuscle]);

  const exactMatchExists = useMemo(() => {
    const targetSlug = slugify(searchQuery);
    return mergedExercises.some(
      (item) => item.id === targetSlug || item.name.toLowerCase() === searchQuery.toLowerCase().trim()
    );
  }, [mergedExercises, searchQuery]);

  const handleSelect = (item: {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    isCustom: boolean;
  }) => {
    onSelectExercise(item);
    onOpenChange(false);
    setSearchQuery('');
  };

  const handleCreateCustom = () => {
    if (!searchQuery.trim()) return;
    const name = searchQuery.trim();
    const muscle = selectedMuscle === 'all' ? 'other' : selectedMuscle;
    onCreateCustomExercise(name, muscle);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 sm:max-w-md max-h-[88dvh] flex flex-col gap-0 border-border bg-card">
        <DrawerHeader className="p-3 border-b border-border">
          <DrawerTitle className="text-xs font-mono tracking-wider uppercase text-foreground">
            SELECT_OR_CREATE_EXERCISE
          </DrawerTitle>
        </DrawerHeader>

        {/* Muscle group filter pills */}
        <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-border/60 no-scrollbar">
          {MUSCLE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedMuscle(opt.value)}
              className={`shrink-0 rounded px-2 py-1 text-[10px] font-mono tracking-wider transition-colors border ${
                selectedMuscle === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/60 text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Command className="flex-1 overflow-hidden" shouldFilter={false}>
          <CommandInput
            placeholder="Search exercise (or type to create)..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />

          <CommandList className="max-h-[50dvh] overflow-y-auto">
            {/* Inline Creatable Option */}
            {searchQuery.trim().length > 1 && !exactMatchExists && (
              <div className="p-2 border-b border-border/50">
                <button
                  type="button"
                  onClick={handleCreateCustom}
                  className="w-full flex items-center justify-between rounded bg-primary/10 border border-primary/40 px-3 py-2.5 text-xs font-mono text-primary hover:bg-primary/20 active:bg-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    <span className="font-bold">CREATE &quot;{searchQuery.trim()}&quot;</span>
                  </div>
                  <Badge variant="primary" className="text-[9px]">
                    NEW
                  </Badge>
                </button>
              </div>
            )}

            {filteredList.length === 0 && !searchQuery.trim() ? (
              <div className="py-6 text-center text-xs text-muted-foreground font-mono">
                No exercises found.
              </div>
            ) : (
              <CommandGroup heading={`MATCHES (${filteredList.length})`}>
                {filteredList.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center justify-between py-2.5 px-3 hover:bg-secondary/80 border-b border-border/20 last:border-b-0"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground truncate">
                          {item.name}
                        </span>
                        {item.isCustom && (
                          <Sparkles className="h-3 w-3 text-warning shrink-0" strokeWidth={2} />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {item.muscleGroup}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.usageCount > 0 && (
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {item.usageCount}×
                        </span>
                      )}
                      <Badge variant="outline" className="text-[9px] py-0 px-1 border-border">
                        {item.muscleGroup.substring(0, 4).toUpperCase()}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DrawerContent>
    </Drawer>
  );
}
