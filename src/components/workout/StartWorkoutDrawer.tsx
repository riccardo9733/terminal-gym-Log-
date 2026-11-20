import { Clock } from 'lucide-react';
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
import { AsciiBox } from '../ui/ascii-box';
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
      <DrawerContent className="max-h-[88dvh] font-mono">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-1.5 font-mono text-xs uppercase">
            <span className="text-accent select-none font-bold">&gt;</span>
            <span>INIZIA_ALLENAMENTO</span>
          </DrawerTitle>
          <DrawerDescription className="font-mono text-[11px] text-muted-foreground">
            Seleziona una scheda salvata o avvia una sessione libera.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="space-y-3">
          {/* Option 1: Empty workout session */}
          <AsciiBox
            variant="accent"
            title="SESSIONE_LIBERA"
            status={<Badge variant="primary" className="text-[9px]">VUOTA</Badge>}
            className="space-y-2"
          >
            <p className="text-xs font-mono text-foreground font-semibold">
              Inizia senza scheda preimpostata e aggiungi gli esercizi sul momento.
            </p>
            <Button
              variant="primary"
              size="default"
              onClick={handleStartEmpty}
              className="w-full text-xs font-mono font-bold tracking-wider h-11"
            >
              [ ▶ AVVIA_SESSIONE_LIBERA ↵ ]
            </Button>
          </AsciiBox>

          {/* Option 2: Choose from user's routines */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold px-0.5">
              <span>LE_TUE_SCHEDE ({routines.length})</span>
              <button
                type="button"
                onClick={handleCreate}
                className="text-[10px] font-mono text-accent font-bold hover:underline"
              >
                [ + NUOVA ]
              </button>
            </div>

            <div className="space-y-2 max-h-[42dvh] overflow-y-auto no-scrollbar">
              {routines.map((routine) => {
                return (
                  <div
                    key={routine.id}
                    onClick={() => handleStartRoutine(routine)}
                    className="cursor-pointer rounded-[2px] border border-border bg-card p-3 hover:border-accent hover:bg-secondary/40 active:bg-secondary transition-all space-y-2 group select-none"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold font-mono text-foreground group-hover:text-accent transition-colors truncate">
                            {routine.title}
                          </h4>
                          <Badge variant="outline" className="text-[9px]">
                            {`${routine.exercises.length} ES.`}
                          </Badge>
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
                        <span>[ ▶ AVVIA ]</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {routines.length === 0 && (
                <div className="rounded-[2px] border border-dashed border-border p-4 text-center text-xs font-mono text-muted-foreground">
                  Nessuna scheda creata finora.
                </div>
              )}
            </div>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
