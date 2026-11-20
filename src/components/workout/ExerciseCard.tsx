import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  MessageSquare,
  History,
} from 'lucide-react';
import { WorkoutExercise, WorkoutSet } from '../../types/workout';
import { SetRow } from './SetRow';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AsciiBox } from '../ui/ascii-box';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from '../ui/drawer';
import { generateId, cn } from '../../lib/utils';

interface ExerciseCardProps {
  exerciseIndex: number;
  totalExercises: number;
  exercise: WorkoutExercise;
  bestWeight?: number;
  lastPerformanceSets?: Array<{ weight: number; reps: number; isWarmup?: boolean }>;
  onOpenHistory?: () => void;
  onUpdateExercise: (updated: Partial<WorkoutExercise>) => void;
  onRemoveExercise: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSetCompleted: (exercise: WorkoutExercise, set: WorkoutSet) => void;
}

const REST_PRESETS = [45, 60, 90, 120, 150, 180];

export function ExerciseCard({
  exerciseIndex,
  totalExercises,
  exercise,
  bestWeight,
  lastPerformanceSets,
  onOpenHistory,
  onUpdateExercise,
  onRemoveExercise,
  onMoveUp,
  onMoveDown,
  onSetCompleted,
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(Boolean(exercise.notes));
  const [optionsOpen, setOptionsOpen] = useState(false);

  const handleCycleRest = () => {
    const current = exercise.restSeconds || 90;
    const currentIndex = REST_PRESETS.indexOf(current);
    const next =
      currentIndex === -1 || currentIndex === REST_PRESETS.length - 1
        ? REST_PRESETS[0]
        : REST_PRESETS[currentIndex + 1];
    onUpdateExercise({ restSeconds: next });
  };

  const handleAddSet = () => {
    const nextSetIdx = exercise.sets.length;
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const prevWorkoutSet =
      lastPerformanceSets?.[nextSetIdx] ||
      (lastPerformanceSets && lastPerformanceSets.length > 0
        ? lastPerformanceSets[lastPerformanceSets.length - 1]
        : undefined);

    const defaultWeight =
      lastSet && lastSet.weight > 0
        ? lastSet.weight
        : prevWorkoutSet && prevWorkoutSet.weight > 0
        ? prevWorkoutSet.weight
        : bestWeight || 0;

    const defaultReps =
      lastSet && lastSet.reps > 0
        ? lastSet.reps
        : prevWorkoutSet && prevWorkoutSet.reps > 0
        ? prevWorkoutSet.reps
        : 8;

    const newSet: WorkoutSet = {
      id: generateId(),
      weight: defaultWeight,
      reps: defaultReps,
      completed: false,
    };

    onUpdateExercise({
      sets: [...exercise.sets, newSet],
    });
  };

  const handleUpdateSet = (setId: string, patch: Partial<WorkoutSet>) => {
    onUpdateExercise({
      sets: exercise.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
    });
  };

  const handleToggleComplete = (set: WorkoutSet, autoFilled?: { weight: number; reps: number }) => {
    const nextCompleted = !set.completed;
    const completedAt = nextCompleted ? Date.now() : undefined;

    const weight =
      nextCompleted && autoFilled && set.weight === 0 ? autoFilled.weight : set.weight;
    const reps =
      nextCompleted && autoFilled && set.reps === 0 ? autoFilled.reps : set.reps;

    const updatedSet: WorkoutSet = {
      ...set,
      weight,
      reps,
      completed: nextCompleted,
      completedAt,
    };

    onUpdateExercise({
      sets: exercise.sets.map((s) => (s.id === set.id ? updatedSet : s)),
    });

    if (nextCompleted) {
      onSetCompleted(exercise, updatedSet);
    }
  };

  const handleDeleteSet = (setId: string) => {
    if (exercise.sets.length <= 1) return;
    onUpdateExercise({
      sets: exercise.sets.filter((s) => s.id !== setId),
    });
  };

  return (
    <>
      <AsciiBox
        title={
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground font-bold">
              #{(exerciseIndex + 1).toString().padStart(2, '0')}
            </span>
            <span
              onClick={onOpenHistory}
              className={`text-foreground font-bold transition-colors truncate ${
                onOpenHistory ? 'hover:text-accent hover:underline cursor-pointer' : ''
              }`}
              title={onOpenHistory ? 'Tocca per aprire storico esercizio' : undefined}
            >
              {exercise.name}
            </span>
            <Badge variant="outline" className="text-[9px]">
              {exercise.muscleGroup.toUpperCase()}
            </Badge>
          </div>
        }
        action={
          <button
            type="button"
            onClick={() => setOptionsOpen(true)}
            className="h-6 px-1.5 rounded-[2px] border border-border bg-secondary/60 text-muted-foreground hover:text-foreground hover:border-accent text-xs font-mono font-bold transition-colors select-none"
            title="Opzioni esercizio"
          >
            [···]
          </button>
        }
        className="space-y-2.5"
      >
        {/* Subheader Badges & Quick Controls */}
        <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono pb-1 border-b border-border/40">
          {bestWeight !== undefined && bestWeight > 0 && (
            <Badge
              variant="accent"
              className={cn(
                'text-[10px]',
                onOpenHistory && 'cursor-pointer hover:opacity-90 active:scale-95 transition-all'
              )}
              onClick={onOpenHistory}
              title={onOpenHistory ? 'Tocca per aprire storico PR' : undefined}
            >
              {`PR: ${bestWeight}kg`}
            </Badge>
          )}

          {/* Rest interval cycle button */}
          <button
            type="button"
            onClick={handleCycleRest}
            className="h-6 px-1.5 rounded-[2px] border border-border bg-secondary/60 text-muted-foreground hover:text-warning hover:border-warning/50 transition-colors flex items-center gap-1 tabular-nums"
            title="Tocca per cambiare intervallo di riposo"
          >
            <span>{`[REST: ${exercise.restSeconds || 90}S]`}</span>
          </button>

          {/* Show note indicator only if notes exist or user opened them */}
          {(showNotes || exercise.notes) && (
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={cn(
                'h-6 px-1.5 rounded-[2px] border transition-colors flex items-center gap-1 ml-auto',
                exercise.notes
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border bg-secondary/60 text-muted-foreground hover:text-foreground'
              )}
              title="Mostra / Nascondi campo note"
            >
              <MessageSquare className="h-2.5 w-2.5" />
              <span>[NOTE]</span>
            </button>
          )}
        </div>

        {/* Notes field */}
        {showNotes && (
          <div className="pt-0.5">
            <input
              type="text"
              placeholder="Note di esecuzione / setup macchinario..."
              value={exercise.notes || ''}
              onChange={(e) => onUpdateExercise({ notes: e.target.value })}
              className="h-8 w-full rounded-[2px] border border-border bg-secondary/50 px-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/35 focus:border-accent focus:outline-none"
            />
          </div>
        )}

        {/* Sets Column Header */}
        <div className="flex items-center gap-1.5 px-1.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground/80 select-none border-b border-border/30 pb-1">
          <div className="w-9 text-center font-bold">SET</div>
          <div className="w-16 text-center font-bold">PREV</div>
          <div className="flex-1 text-center font-bold">KG</div>
          <div className="flex-1 text-center font-bold">REPS</div>
          <div className="w-11 text-center font-bold text-accent">LOG</div>
        </div>

        {/* Sets Rows */}
        <div className="space-y-1">
          {exercise.sets.map((set, setIdx) => {
            const prevSet = lastPerformanceSets?.[setIdx];
            const precedingSet = setIdx > 0 ? exercise.sets[setIdx - 1] : undefined;
            const fallbackWeight =
              precedingSet && precedingSet.weight > 0 ? precedingSet.weight : bestWeight;
            const fallbackReps =
              precedingSet && precedingSet.reps > 0 ? precedingSet.reps : 8;

            return (
              <SetRow
                key={set.id}
                setIndex={setIdx + 1}
                set={set}
                prevWeight={prevSet?.weight}
                prevReps={prevSet?.reps}
                fallbackWeight={fallbackWeight}
                fallbackReps={fallbackReps}
                onUpdate={(patch) => handleUpdateSet(set.id, patch)}
                onToggleComplete={(autoFilled) => handleToggleComplete(set, autoFilled)}
              />
            );
          })}
        </div>

        {/* Bottom Set Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddSet}
            className="flex-1 h-8 text-[11px] font-mono font-bold tracking-wider border-dashed border-border hover:border-accent hover:text-accent"
          >
            <Plus className="mr-1 h-3 w-3" />
            [ + ADD_SET ]
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exercise.sets.length <= 1}
            onClick={() => {
              if (exercise.sets.length > 1) {
                const lastSet = exercise.sets[exercise.sets.length - 1];
                handleDeleteSet(lastSet.id);
              }
            }}
            className="h-8 px-2.5 text-[11px] font-mono font-semibold tracking-wider text-muted-foreground hover:text-destructive hover:border-destructive/60 disabled:opacity-30 disabled:pointer-events-none"
            title={
              exercise.sets.length <= 1
                ? 'Almeno una serie richiesta'
                : 'Rimuovi ultima serie'
            }
          >
            [ - DEL_SET ]
          </Button>
        </div>
      </AsciiBox>

      {/* Exercise Options Bottom Drawer */}
      <Drawer open={optionsOpen} onOpenChange={setOptionsOpen}>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle className="font-mono text-sm uppercase">
              {exercise.name} // OPZIONI
            </DrawerTitle>
            <DrawerDescription className="font-mono text-xs">
              {exercise.muscleGroup.toUpperCase()} • {exercise.sets.length} SERIE • RECUPERO{' '}
              {exercise.restSeconds || 90}S
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-3 font-mono">
            {/* 1. Sposta Su / Giù */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={exerciseIndex === 0}
                onClick={() => {
                  onMoveUp();
                  setOptionsOpen(false);
                }}
                className="h-10 text-xs justify-start"
              >
                <ChevronUp className="mr-1.5 h-3.5 w-3.5" />
                [ SPOSTA SU ]
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={exerciseIndex === totalExercises - 1}
                onClick={() => {
                  onMoveDown();
                  setOptionsOpen(false);
                }}
                className="h-10 text-xs justify-start"
              >
                <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                [ SPOSTA GIÙ ]
              </Button>
            </div>

            {/* 2. Recupero / Rest Time Presets */}
            <div className="rounded-[2px] border border-border bg-secondary/30 p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>TEMPO DI RECUPERO:</span>
                <span className="font-bold text-foreground tabular-nums">
                  {exercise.restSeconds || 90}s
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {REST_PRESETS.map((seconds) => (
                  <button
                    key={seconds}
                    type="button"
                    onClick={() => {
                      onUpdateExercise({ restSeconds: seconds });
                    }}
                    className={cn(
                      'h-8 rounded-[2px] border text-[10px] font-mono font-bold transition-colors tabular-nums',
                      (exercise.restSeconds || 90) === seconds
                        ? 'border-accent bg-accent/20 text-accent'
                        : 'border-border bg-secondary/60 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {seconds}s
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Note Toggle / Edit */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNotes(true);
                setOptionsOpen(false);
              }}
              className="w-full h-10 text-xs justify-start"
            >
              <MessageSquare className="mr-2 h-3.5 w-3.5" />
              {exercise.notes ? '[ MODIFICA NOTE ]' : '[ AGGIUNGI NOTE ]'}
            </Button>

            {/* 4. Storico Esercizio */}
            {onOpenHistory && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOptionsOpen(false);
                  onOpenHistory();
                }}
                className="w-full h-10 text-xs justify-start text-foreground"
              >
                <History className="mr-2 h-3.5 w-3.5" />
                [ VEDI STORICO ESERCIZIO ]
              </Button>
            )}

            {/* 5. Elimina Esercizio */}
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setOptionsOpen(false);
                onRemoveExercise();
              }}
              className="w-full h-10 text-xs justify-start text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              [ ✕ ELIMINA ESERCIZIO ]
            </Button>
          </DrawerBody>

          <DrawerFooter>
            <Button type="button" variant="outline" onClick={() => setOptionsOpen(false)}>
              [ CHIUDI ]
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
