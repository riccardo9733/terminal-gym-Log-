import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
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
      <DrawerContent className="p-0 sm:max-w-md max-h-[88dvh] flex flex-col gap-0 border-border bg-card font-mono">
        <DrawerHeader className="p-3 border-b border-border">
          <DrawerTitle className="text-xs font-mono tracking-wider uppercase text-foreground">
            &gt; SELEZIONA_O_CREA_ESERCIZIO
          </DrawerTitle>
        </DrawerHeader>

        {/* Muscle group filter bracketed buttons */}
        <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-border/60 no-scrollbar bg-secondary/30">
          {MUSCLE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedMuscle(opt.value)}
              className={`shrink-0 rounded-[2px] px-2 py-1 text-[10px] font-mono tracking-wider transition-colors border select-none ${
                selectedMuscle === opt.value
                  ? 'bg-accent text-background border-accent font-extrabold'
                  : 'bg-secondary/60 text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              [{opt.label}]
            </button>
          ))}
        </div>

        <Command className="flex-1 overflow-hidden border-0" shouldFilter={false}>
          <CommandInput
            placeholder="grep esercizio (o digita per creare)..."
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
                  className="w-full flex items-center justify-between rounded-[2px] bg-accent/15 border border-accent/40 px-3 py-2.5 text-xs font-mono text-accent hover:bg-accent/25 active:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    <span className="font-bold">[ + CREA &quot;{searchQuery.trim()}&quot; ]</span>
                  </div>
                  <Badge variant="accent" className="text-[9px]">
                    NUOVO
                  </Badge>
                </button>
              </div>
            )}

            {filteredList.length === 0 && !searchQuery.trim() ? (
              <div className="py-6 text-center text-xs text-muted-foreground font-mono">
                Nessun esercizio trovato.
              </div>
            ) : (
              <CommandGroup heading={`MATCHES (${filteredList.length})`}>
                {filteredList.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center justify-between py-2.5 px-3 hover:bg-secondary/80 border-b border-border/20 last:border-b-0 rounded-[2px]"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground truncate">
                          {item.name}
                        </span>
                        {item.isCustom && (
                          <span className="text-warning text-[10px] font-bold">[CUSTOM]</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {item.muscleGroup}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.usageCount > 0 && (
                        <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                          {item.usageCount}×
                        </span>
                      )}
                      <Badge variant="outline" className="text-[9px]">
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
