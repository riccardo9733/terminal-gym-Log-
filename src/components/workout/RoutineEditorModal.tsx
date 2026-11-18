import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Bookmark,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  WorkoutRoutine,
  RoutineExercise,
  UserExerciseMeta,
  MuscleGroup,
} from '../../types/workout';
import { ExerciseCombobox } from './ExerciseCombobox';
import { generateId } from '../../lib/utils';

interface RoutineEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineToEdit?: WorkoutRoutine | null;
  userExercises: Record<string, UserExerciseMeta>;
  onSaveRoutine: (routine: WorkoutRoutine) => void;
  onCreateCustomExercise: (name: string, muscleGroup: MuscleGroup) => void;
}

export function RoutineEditorModal({
  open,
  onOpenChange,
  routineToEdit,
  userExercises,
  onSaveRoutine,
  onCreateCustomExercise,
}: RoutineEditorModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  useEffect(() => {
    if (routineToEdit) {
      setTitle(routineToEdit.title);
      setDescription(routineToEdit.description || '');
      setExercises(routineToEdit.exercises || []);
    } else {
      setTitle('');
      setDescription('');
      setExercises([]);
    }
  }, [routineToEdit, open]);

  const handleAddExercise = (selected: {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    isCustom: boolean;
  }) => {
    const newEx: RoutineExercise = {
      exerciseId: selected.id,
      name: selected.name,
      muscleGroup: selected.muscleGroup,
      targetSets: 3,
      defaultReps: 8,
      defaultWeight: userExercises[selected.id]?.bestWeight || 0,
    };
    setExercises((prev) => [...prev, newEx]);
  };

  const handleUpdateExercise = (index: number, patch: Partial<RoutineExercise>) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...patch };
      return updated;
    });
  };

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= exercises.length) return;
    setExercises((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const routine: WorkoutRoutine = {
      id: routineToEdit?.id || generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      exercises,
      createdAt: routineToEdit?.createdAt || Date.now(),
      updatedAt: Date.now(),
      lastPerformedAt: routineToEdit?.lastPerformedAt,
    };
    onSaveRoutine(routine);
    onOpenChange(false);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92dvh]">
          <DrawerHeader>
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-primary" strokeWidth={2} />
              <DrawerTitle>
                {routineToEdit ? 'MODIFICA_SCHEDA' : 'CREA_NUOVA_SCHEDA'}
              </DrawerTitle>
            </div>
          </DrawerHeader>

          <DrawerBody className="space-y-3.5 pr-3">
            {/* Title */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1 font-semibold">
                NOME_SCHEDA *
              </label>
              <input
                type="text"
                placeholder="es. GAMBE_&_ADDOME o PUSH_HEAVY"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 w-full rounded border border-input bg-background px-3 text-base font-mono text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1 font-semibold">
                NOTE / DESCRIZIONE
              </label>
              <input
                type="text"
                placeholder="es. Focus quadricipiti, recupero 90s"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10 w-full rounded border border-input bg-background px-3 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Exercises List */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                <span>ESERCIZI IN SCHEDA ({exercises.length})</span>
              </div>

              {exercises.map((ex, idx) => (
                <div
                  key={ex.exerciseId + idx}
                  className="rounded border border-border bg-background p-2.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        #{(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="text-xs font-bold font-mono text-foreground truncate">
                        {ex.name}
                      </span>
                      <Badge variant="outline" className="text-[8px] py-0 px-1 border-border">
                        {ex.muscleGroup.substring(0, 4).toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, idx - 1)}
                        className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === exercises.length - 1}
                        onClick={() => handleMove(idx, idx + 1)}
                        className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Target Sets & Reps */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5 rounded border border-input bg-card/60 px-2 py-1">
                      <span className="text-[10px] text-muted-foreground shrink-0">SETS:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={ex.targetSets}
                        onChange={(e) =>
                          handleUpdateExercise(idx, {
                            targetSets: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="w-full bg-transparent text-center font-bold text-foreground focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 rounded border border-input bg-card/60 px-2 py-1">
                      <span className="text-[10px] text-muted-foreground shrink-0">REPS:</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={ex.defaultReps || 8}
                        onChange={(e) =>
                          handleUpdateExercise(idx, {
                            defaultReps: Math.max(1, parseInt(e.target.value) || 8),
                          })
                        }
                        className="w-full bg-transparent text-center font-bold text-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setComboboxOpen(true)}
                className="w-full border-dashed border-border/80 text-xs font-mono text-primary hover:text-primary h-10"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                AGGIUNGI_ESERCIZIO_A_SCHEDA
              </Button>
            </div>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ANNULLA
            </Button>
            <Button
              variant="accent"
              onClick={handleSave}
              disabled={!title.trim() || exercises.length === 0}
            >
              SALVA_SCHEDA
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Exercise Picker Drawer */}
      <ExerciseCombobox
        open={comboboxOpen}
        onOpenChange={setComboboxOpen}
        userExercises={userExercises}
        onSelectExercise={handleAddExercise}
        onCreateCustomExercise={(name, muscleGroup) => {
          onCreateCustomExercise(name, muscleGroup);
          handleAddExercise({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            muscleGroup,
            isCustom: true,
          });
        }}
      />
    </>
  );
}
