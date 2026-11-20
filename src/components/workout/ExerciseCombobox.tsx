import { useState, useMemo, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
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
import { Button } from '../ui/button';
import {
  DEFAULT_EXERCISES,
  MUSCLE_FILTER_OPTIONS,
  MUSCLE_GROUPS_IT,
} from '../../data/default-exercises';
import { UserExerciseMeta, MuscleGroup } from '../../types/workout';
import { slugify } from '../../lib/utils';

export interface SelectedExerciseItem {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  isCustom: boolean;
}

interface ExerciseComboboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userExercises: Record<string, UserExerciseMeta>;
  onSelectExercise: (exercise: SelectedExerciseItem) => void;
  onCreateCustomExercise: (name: string, muscleGroup: MuscleGroup) => void;
  multiSelect?: boolean;
  onSelectMultiple?: (exercises: SelectedExerciseItem[]) => void;
  alreadySelectedIds?: string[];
}

interface MergedExerciseItem {
  id: string;
  name: string;
  nameIt?: string;
  muscleGroup: MuscleGroup;
  usageCount: number;
  lastUsedAt: number;
  isCustom: boolean;
  aliases?: string[];
}

function normalizeSearchText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[°'"]/g, '')           // remove °, ', "
    .replace(/[-_]/g, ' ')           // replace - and _ with space
    .replace(/\s+/g, ' ')
    .trim();
}

export function ExerciseCombobox({
  open,
  onOpenChange,
  userExercises,
  onSelectExercise,
  onCreateCustomExercise,
  multiSelect = false,
  onSelectMultiple,
  alreadySelectedIds = [],
}: ExerciseComboboxProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all');
  const [batchSelected, setBatchSelected] = useState<Map<string, SelectedExerciseItem>>(new Map());

  // Reset batch selection when opening
  useEffect(() => {
    if (open) {
      setBatchSelected(new Map());
      setSearchQuery('');
    }
  }, [open]);

  // Merge default exercises with user exercises and rank by usage
  const mergedExercises = useMemo(() => {
    const map = new Map<string, MergedExerciseItem>();

    // Add static seed
    for (const def of DEFAULT_EXERCISES) {
      map.set(def.id, {
        id: def.id,
        name: def.name,
        nameIt: def.nameIt,
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
        // Keep localized name if userEx name matches or use userEx name
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

    // Sort: most used & recently used first, then alphabetical by Italian name or English name
    list.sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      if (b.lastUsedAt !== a.lastUsedAt) {
        return b.lastUsedAt - a.lastUsedAt;
      }
      const nameA = a.nameIt || a.name;
      const nameB = b.nameIt || b.name;
      return nameA.localeCompare(nameB);
    });

    return list;
  }, [userExercises]);

  // Filtered by search and muscle
  const filteredList = useMemo(() => {
    const qClean = normalizeSearchText(searchQuery);
    const tokens = qClean.split(' ').filter(Boolean);

    return mergedExercises.filter((item) => {
      if (selectedMuscle !== 'all' && item.muscleGroup !== selectedMuscle) {
        return false;
      }
      if (tokens.length === 0) return true;

      const normName = normalizeSearchText(item.name);
      const normNameIt = item.nameIt ? normalizeSearchText(item.nameIt) : '';
      const normMuscle = normalizeSearchText(item.muscleGroup);
      const normMuscleIt = normalizeSearchText(MUSCLE_GROUPS_IT[item.muscleGroup] || '');
      const normAliases = item.aliases?.map(normalizeSearchText) || [];

      // Every word token must match at least one attribute of the exercise
      return tokens.every((token) => {
        return (
          normName.includes(token) ||
          normNameIt.includes(token) ||
          normMuscle.includes(token) ||
          normMuscleIt.includes(token) ||
          normAliases.some((a) => a.includes(token))
        );
      });
    });
  }, [mergedExercises, searchQuery, selectedMuscle]);

  const exactMatchExists = useMemo(() => {
    const targetSlug = slugify(searchQuery);
    const norm = normalizeSearchText(searchQuery);
    return mergedExercises.some(
      (item) =>
        item.id === targetSlug ||
        normalizeSearchText(item.name) === norm ||
        (item.nameIt && normalizeSearchText(item.nameIt) === norm)
    );
  }, [mergedExercises, searchQuery]);

  const toggleBatchItem = (item: MergedExerciseItem) => {
    setBatchSelected((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, {
          id: item.id,
          name: item.nameIt || item.name,
          muscleGroup: item.muscleGroup,
          isCustom: item.isCustom,
        });
      }
      return next;
    });
  };

  const handleSelectSingle = (item: MergedExerciseItem) => {
    onSelectExercise({
      id: item.id,
      name: item.nameIt || item.name,
      muscleGroup: item.muscleGroup,
      isCustom: item.isCustom,
    });
    onOpenChange(false);
    setSearchQuery('');
  };

  const handleConfirmBatch = () => {
    if (!onSelectMultiple) return;
    const selectedList = Array.from(batchSelected.values());
    if (selectedList.length > 0) {
      onSelectMultiple(selectedList);
    }
    onOpenChange(false);
    setSearchQuery('');
  };

  const handleCreateCustom = () => {
    if (!searchQuery.trim()) return;
    const name = searchQuery.trim();
    const muscle = selectedMuscle === 'all' ? 'other' : selectedMuscle;
    onCreateCustomExercise(name, muscle);

    const newItem: SelectedExerciseItem = {
      id: slugify(name),
      name,
      muscleGroup: muscle,
      isCustom: true,
    };

    if (multiSelect && onSelectMultiple) {
      setBatchSelected((prev) => new Map(prev).set(newItem.id, newItem));
    } else {
      onSelectExercise(newItem);
      onOpenChange(false);
    }
    setSearchQuery('');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 sm:max-w-md max-h-[90dvh] flex flex-col gap-0 border-border bg-card font-mono">
        <DrawerHeader className="p-3 border-b border-border">
          <DrawerTitle className="text-xs font-mono tracking-wider uppercase text-foreground flex items-center justify-between">
            <span>
              &gt; {multiSelect ? 'SELEZIONA_ESERCIZI_MULTIPLI' : 'SELEZIONA_O_CREA_ESERCIZIO'}
            </span>
            {multiSelect && batchSelected.size > 0 && (
              <Badge variant="accent" className="text-[10px] tabular-nums font-bold">
                {batchSelected.size} SCELTI
              </Badge>
            )}
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
            placeholder="Cerca esercizio (es. Panca, Lat, Squat, Spinte 30)..."
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
                Nessun esercizio trovato per questo gruppo muscolare.
              </div>
            ) : (
              <CommandGroup heading={`RISULTATI (${filteredList.length})`}>
                {filteredList.map((item) => {
                  const isBatchChosen = batchSelected.has(item.id);
                  const isAlreadyInSheet = alreadySelectedIds.includes(item.id);
                  const muscleIt = MUSCLE_GROUPS_IT[item.muscleGroup] || item.muscleGroup;

                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => {
                        if (multiSelect) {
                          toggleBatchItem(item);
                        } else {
                          handleSelectSingle(item);
                        }
                      }}
                      className={`flex items-center justify-between py-2.5 px-3 hover:bg-secondary/80 border-b border-border/20 last:border-b-0 rounded-[2px] cursor-pointer ${
                        isBatchChosen ? 'bg-accent/10 border-accent/40' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`font-bold truncate text-xs ${
                              isBatchChosen ? 'text-accent' : 'text-foreground'
                            }`}
                          >
                            {item.nameIt || item.name}
                          </span>
                          {item.isCustom && (
                            <span className="text-warning text-[10px] font-bold">[CUSTOM]</span>
                          )}
                          {isAlreadyInSheet && (
                            <span className="text-[9px] text-muted-foreground/60 font-mono">
                              [IN SCHEDA]
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {item.nameIt ? `${item.name} • ${muscleIt}` : muscleIt}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {multiSelect ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBatchItem(item);
                            }}
                            className={`h-7 px-2 rounded-[2px] border text-[10px] font-mono font-bold flex items-center gap-1 transition-all select-none ${
                              isBatchChosen
                                ? 'bg-accent text-background border-accent'
                                : 'bg-secondary/60 text-muted-foreground border-border hover:border-accent hover:text-foreground'
                            }`}
                          >
                            {isBatchChosen ? (
                              <>
                                <Check className="h-3 w-3 stroke-[3]" />
                                <span>SCELTO</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3" />
                                <span>AGGIUNGI</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <>
                            {item.usageCount > 0 && (
                              <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                                {item.usageCount}×
                              </span>
                            )}
                            <Badge variant="outline" className="text-[9px] uppercase font-bold">
                              {muscleIt.substring(0, 4)}
                            </Badge>
                          </>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>

        {/* Multi-Select Bottom Confirmation Sticky Bar */}
        {multiSelect && (
          <div className="p-3 border-t border-border bg-card flex items-center justify-between gap-2">
            <div className="text-xs font-mono text-muted-foreground">
              Selezionati:{' '}
              <span className="text-accent font-bold tabular-nums">
                {batchSelected.size}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs font-mono"
              >
                [ CHIUDI ]
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={batchSelected.size === 0}
                onClick={handleConfirmBatch}
                className="font-mono text-xs font-bold"
              >
                [ ✓ AGGIUNGI ({batchSelected.size}) ESERCIZI ↵ ]
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
