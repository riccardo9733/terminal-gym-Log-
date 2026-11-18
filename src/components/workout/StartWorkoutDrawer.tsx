import { Play, Plus, Bookmark, Clock, ChevronRight } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { WorkoutRoutine } from '../../types/workout';
import { formatShortDate } from '../../lib/utils';

interface StartWorkoutDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routines: WorkoutRoutine[];
  onStartEmpty: () => void;
  onStartRoutine: (routine: WorkoutRoutine) => void;
  onCreateRoutine: () => void;
}

export function StartWorkoutDrawer({
  open,
  onOpenChange,
  routines,
  onStartEmpty,
  onStartRoutine,
  onCreateRoutine,
}: StartWorkoutDrawerProps) {
  const handleStartEmpty = () => {
    onStartEmpty();
    onOpenChange(false);
  };

  const handleStartRoutine = (routine: WorkoutRoutine) => {
    onStartRoutine(routine);
    onOpenChange(false);
  };

  const handleCreate = () => {
    onOpenChange(false);
    onCreateRoutine();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88dvh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Play className="h-4 w-4 text-accent fill-current" />
            <span>INIZIA_ALLENAMENTO</span>
          </DrawerTitle>
          <DrawerDescription>
            Seleziona una scheda salvata o avvia una sessione libera vuota.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="space-y-3">
          {/* Option 1: Empty workout session */}
          <div className="rounded border border-primary/40 bg-primary/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                [SESSIONE_LIBERA]
              </span>
              <Badge variant="primary" className="text-[9px]">
                VUOTA
              </Badge>
            </div>
            <p className="text-xs font-mono text-foreground font-semibold">
              Inizia senza scheda preimpostata e aggiungi gli esercizi sul momento.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartEmpty}
              className="w-full text-xs font-mono font-bold tracking-wider h-10"
            >
              <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
              AVVIA_SESSIONE_LIBERA
            </Button>
          </div>

          {/* Option 2: Choose from user's routines */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold px-0.5">
              <div className="flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                <span>LE_TUE_SCHEDE ({routines.length})</span>
              </div>

              <button
                type="button"
                onClick={handleCreate}
                className="flex items-center gap-1 text-[10px] font-mono text-primary font-bold hover:underline"
              >
                <Plus className="h-3 w-3" strokeWidth={2} />
                <span>NUOVA</span>
              </button>
            </div>

            <div className="space-y-2">
              {routines.map((routine) => {
                const muscleGroups = Array.from(
                  new Set(routine.exercises.map((e) => e.muscleGroup))
                );

                return (
                  <div
                    key={routine.id}
                    onClick={() => handleStartRoutine(routine)}
                    className="cursor-pointer rounded border border-border bg-card/80 p-3 hover:border-accent hover:bg-secondary/40 active:bg-secondary transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold font-mono text-foreground group-hover:text-accent transition-colors truncate">
                            {routine.title}
                          </h4>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            • {routine.exercises.length} esercizi
                          </span>
                        </div>

                        {routine.description && (
                          <p className="text-[11px] font-mono text-muted-foreground line-clamp-1 mt-0.5">
                            {routine.description}
                          </p>
                        )}

                        {routine.lastPerformedAt && (
                          <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-muted-foreground/70">
                            <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                            <span>Svolta il: {formatShortDate(routine.lastPerformedAt)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-accent shrink-0 pt-0.5">
                        <span className="hidden sm:inline">AVVIA</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {muscleGroups.map((mg) => (
                        <span
                          key={mg}
                          className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground capitalize border border-border/40"
                        >
                          {mg}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {routines.length === 0 && (
                <div className="rounded border border-dashed border-border bg-card/30 p-6 text-center space-y-2">
                  <p className="text-xs font-mono text-muted-foreground">
                    Non hai ancora creato nessuna scheda.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreate}
                    className="text-xs font-mono border-dashed"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    CREA_LA_PRIMA_SCHEDA
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
