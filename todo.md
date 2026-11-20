# TODO: UX, UI & Minimalist Ergonomics Overhaul (TUI / CLI Edition)

Piano operativo completo per rimuovere il rumore visivo, azzerare gli attriti tattili con una sola mano e allineare `GYM_LOG` ai canoni rigorosi del `design.md` e delle regole mobile-first PWA.

---

## Indice dei Fix

- [x] **[FIX-01]** Autofill 1-Tap da `PREV` & Smart Set Completion (`SetRow.tsx`, `ExerciseCard.tsx`)
- [x] **[FIX-02]** Rimozione del pulsante distruttivo `[DISCARD]` dalla Bottom Action Bar fissa (`ActiveWorkout.tsx`)
- [x] **[FIX-03]** Rimozione Cestino Pericoloso su `SetRow` & Pulizia Testata `ExerciseCard.tsx`
- [x] **[FIX-04]** De-cluttering & Compressione Header di `ActiveWorkout.tsx` (da 130px a 32px)
- [x] **[FIX-05]** Rest Timer Sticky Compatto & Eliminazione del Layout Shift (`RestTimer.tsx`, `ActiveWorkout.tsx`)
- [ ] **[FIX-06]** De-cluttering della Schermata `Session / Home` (Launcher & Schede Rapide) (`App.tsx`)
- [ ] **[FIX-07]** De-cluttering della Scheda `Schede / Routines` (`RoutinesView.tsx`)
- [ ] **[FIX-08]** Eliminazione Box Annidati nella Schermata `Logs` (`HistoryView.tsx`)
- [ ] **[FIX-09]** TUI Design System Compliance: Eliminazione `rounded-full` & Centered `Dialog` (`TopStatusBar.tsx`, `AuthScreen.tsx`, rimozione `ExerciseListView.tsx`)
- [ ] **[FIX-10]** Telemetria Live nella `BottomDock.tsx` durante sessione attiva

---

## Dettaglio Fix e Prompt di Implementazione

---

### [FIX-01] Autofill 1-Tap da `PREV` & Smart Set Completion
- **File coinvolti:** `src/components/workout/SetRow.tsx`, `src/components/workout/ExerciseCard.tsx`
- **Problema:** Per compilare una serie, l'atleta deve toccare l'input `KG`, attendere la tastiera OS che copre lo schermo, digitare, toccare `REPS`, digitare, chiudere la tastiera e spuntare `[ ]`. Nel 90% dei casi si ripete il peso della serie precedente o del workout passato (`PREV`). Attualmente il testo `PREV` è statico e non cliccabile.
- **Obiettivo:**
  1. Rendere il riquadro `PREV` cliccabile: un tap copia istantaneamente `prevWeight` e `prevReps` negli input della riga.
  2. Se i campi `weight`/`reps` sono vuoti o zero, premere direttamente `[ ]` compila automaticamente con il valore `PREV` (o della serie precedente) e marca il set come completato `[x]` con **un singolo tocco**.

#### Prompt per l'Agente:
```markdown
Implementa l'autofill 1-tap per i set di allenamento in `src/components/workout/SetRow.tsx` e `src/components/workout/ExerciseCard.tsx`.

Requisiti specifici:
1. Nella colonna `PREV` di `SetRow.tsx`:
   - Se `prevWeight` e `prevReps` sono disponibili, trasforma la cella `PREV` in un pulsante tattile compatto con bordi TUI (es. `[80×8]`).
   - Al tap, compila istantaneamente i campi `weight` e `reps` della serie con i valori di `prevWeight` e `prevReps`.
   - Aggiungi feedback visivo attivo (`active:scale-95`, transizione rapida).
2. Nel pulsante di completamento `[ ] / [x]`:
   - Se l'utente tocca `[ ]` mentre `set.weight === 0` o `set.reps === 0`:
     - Se `prevWeight` e `prevReps` sono presenti, assegna automaticamente quei valori al set prima di inviare `onToggleComplete`.
     - In alternativa, se non c'è `PREV`, eredita i valori della serie precedente dello stesso esercizio (passando il fallback da `ExerciseCard`).
     - In questo modo l'utente può loggare una serie identica alla precedente con 1 solo tocco senza mai aprire la tastiera su schermo.
3. Mantieni `font-variant-numeric: tabular-nums` e l'area minima di tocco di 44x44px. Assicurati che non ci siano errori TypeScript (`npm run build`).
```

---

### [FIX-02] Rimozione del Tasto Distruttivo `[DISCARD]` dalla Bottom Action Bar Fissa
- **File coinvolti:** `src/components/workout/ActiveWorkout.tsx`
- **Problema:** Nella barra inferiore fissa (`z-30`), il tasto rosso distruttivo `[ ✕ DISCARD ]` (largo 130px, `h-11`) è affiancato a `[ ✓ FINISH ]`. Con mani sudate o pollice frettoloso c'è un rischio costante di tocco accidentale su un'azione irreversibile.
- **Obiettivo:** Rimuovere `DISCARD` dalla bottom bar principale. Dedicare il 100% della larghezza della bottom bar al completamento sessione. Spostare l'annullamento in un pulsante testuale discreto o menu secondario non invasivo.

#### Prompt per l'Agente:
```markdown
Rimuovi il pulsante distruttivo `[ ✕ DISCARD ]` dalla bottom bar fissa in `src/components/workout/ActiveWorkout.tsx`.

Requisiti specifici:
1. Nella barra fissa inferiore:
   - Rimuovi il pulsante `[ ✕ DISCARD ]`.
   - Fai espandere il pulsante di completamento `[ ✓ FINISH SESSION (N/M) ↵ ]` per occupare l'intera larghezza (`w-full`), massimizzando la touch area (altezza 44px, `font-mono`, `bg-accent`, `text-background`, font-extrabold).
2. Riposiziona l'azione di scarto sessione:
   - Inserisci un pulsante o link secondario discreto a fine pagina, sotto l'elenco degli esercizi: un pulsante outline/ghost `[ ✕ ANNULLA QUESTA SESSIONE ]` che apre il drawer di conferma `showCancelConfirm`.
   - In alternativa, rendi accessibile l'annullamento dall'header della sessione attiva con un glifo minimale `[✕]` che chiede conferma.
3. Verifica che il drawer di conferma `showCancelConfirm` continui a funzionare correttamente e che non ci siano regressioni di layout su schermi stretti (375px-430px).
```

---

### [FIX-03] Rimozione Cestino Pericoloso su `SetRow` & Pulizia Testata `ExerciseCard.tsx`
- **File coinvolti:** `src/components/workout/SetRow.tsx`, `src/components/workout/ExerciseCard.tsx`
- **Problema:** 
  - In ogni riga di serie c'è un'icona cestino `w-6` a soli 4px dal checkbox di completamento `[x]`, bersaglio pericoloso e facile da toccare per errore.
  - La testata di ogni `ExerciseCard` ha troppi bottoni piccoli e raramente usati: `ChevronUp`, `ChevronDown`, `Trash2`, più 4 bottoni/badge orizzontali sotto il titolo (`[PR]`, `[HIST]`, `[REST]`, `[NOTE]`).
- **Obiettivo:**
  1. Rimuovere il cestino da ogni singola riga. Aggiungere un'azione contestuale `[- RIMUOVI ULTIMA SERIE]` in fondo alla card dell'esercizio (accanto a `[+ AGGIUNGI SERIE]`).
  2. Rimuovere i tasti `ChevronUp` e `ChevronDown` sempre visibili; inserire le opzioni di riordino ed eliminazione esercizio in un singolo pulsante/menu a comparsa `[···]` o drawer opzioni.
  3. Rendere il nome dell'esercizio o il badge PR il trigger per aprire la cronologia (`ExerciseHistoryDrawer`), eliminando il bottone ridondante `[HIST]`.

#### Prompt per l'Agente:
```markdown
Rivedi l'ergonomia e la pulizia visiva di `src/components/workout/SetRow.tsx` e `src/components/workout/ExerciseCard.tsx`.

Requisiti specifici:
1. In `SetRow.tsx`:
   - Rimuovi il bottone con l'icona del cestino (`Trash2`) posto all'estremità destra di ogni riga.
   - Allarga lo spazio orizzontale disponibile per gli input di `KG`, `REPS` e per il tasto di check `[ ] / [x]` (44x44px puliti senza elementi di pericolo adiacenti).
2. In `ExerciseCard.tsx`:
   - Aggiungi in fondo alla card, a fianco del pulsante `[ + ADD_SET ]`, un pulsante secondario per eliminare l'ultima serie (es. `[ - DEL_SET ]`, disabilitato se c'è solo 1 serie).
   - Nell'header della card, rimuovi i bottoni `ChevronUp` e `ChevronDown`.
   - Sostituisci i controlli sparsi nell'header con un singolo pulsante compatto `[···]` (oppure menu a tendina/drawer) contenente le azioni secondarie: "Sposta Su", "Sposta Giù", "Cambia Tempo di Recupero", "Elimina Esercizio".
   - Rimuovi il bottone `[HIST]`: rendi il nome dell'esercizio cliccabile con sottolineatura al tocco per aprire direttamente `onOpenHistory`.
   - Mostra il campo `[NOTE]` solo se ci sono già note scritte, altrimenti rendilo attivabile dal menu `[···]`.
3. Verifica la compilazione TypeScript con `npm run build`.
```

---

### [FIX-04] De-cluttering & Compressione Header di `ActiveWorkout.tsx`
- **File coinvolti:** `src/components/workout/ActiveWorkout.tsx`
- **Problema:** L'header dell'allenamento attivo occupa ~130px di altezza verticale, rubando spazio visivo prezioso agli esercizi. Contiene pulsanti a bassissima frequenza d'uso (`[SAVE_BLUEPRINT]`), la modifica del titolo della sessione, e metriche ripetute (`SETS: [████░░░░░░] 2/4`, `VOL: 12,400kg`, `EX: 3`).
- **Obiettivo:** Condensare l'header da 130px a una striscia TUI essenziale a riga singola (altezza ~32px-36px).

#### Prompt per l'Agente:
```markdown
Semplifica e comprimi l'header della sessione attiva in `src/components/workout/ActiveWorkout.tsx`.

Requisiti specifici:
1. Rimuovi dall'header:
   - Il pulsante `[SAVE_BLUEPRINT]` (l'opzione di salvare la sessione come scheda è già presente e contestualizzata nel drawer di fine allenamento).
   - L'input/icona per rinominare il titolo della sessione durante l'allenamento (il titolo può essere modificato a fine sessione o resta default).
   - I testi duplicati o ridondanti come `ACTIVE_SESSION // MONITOR`, `EX: N`.
2. Crea una barra di telemetria TUI compatta a singola riga:
   - Sinistra: Nome sessione sintetico o prompt `// ACTIVE` con cronometro live `[⏱ 14:20]`.
   - Destra: Progresso serie essenziale con mini-barra ASCII o conteggio numerico pulito (es. `4/12 SETS [███░░░░░░░]`).
   - Altezza massima del componente: ~32-36px con bordo inferiore hairline (`border-b border-border`).
3. Sposta immediatamente la lista degli esercizi in primo piano, massimizzando il contenuto visibile senza costringere l'utente a scrollare per vedere la prima serie.
4. Esegui `npm run build` per verificare che non ci siano errori di build.
```

---

### [FIX-05] Rest Timer Sticky Compatto & Eliminazione del Layout Shift
- **File coinvolti:** `src/components/workout/RestTimer.tsx`, `src/components/workout/ActiveWorkout.tsx`
- **Problema:**
  - Quando scatta il recupero dopo una serie, il `RestTimer` si espande da 36px a oltre 140px, causando un violento **layout shift** che spinge tutti gli esercizi in basso.
  - Se l'atleta sta completando le serie del 3° o 4° esercizio (più in basso nella pagina), il timer finisce fuori schermo e non è più visibile.
  - Quando inattivo, occupa spazio con 4 pulsanti radio non necessari.
- **Obiettivo:** Trasformare il `RestTimer` in una barra sticky/ancorata ultra-compatta (altezza fissa 36px) che compare solo quando il recupero è attivo e resta sempre visibile durante lo scroll, con 0 layout shift per gli esercizi.

#### Prompt per l'Agente:
```markdown
Riprogetta il componente `RestTimer` in `src/components/workout/RestTimer.tsx` e la sua integrazione in `src/components/workout/ActiveWorkout.tsx` per eliminare il layout shift e garantire la visibilità durante lo scroll.

Requisiti specifici:
1. Comportamento dello stato inattivo (`!isActive`):
   - Non renderizzare blocchi espansi sopra gli esercizi. Quando il timer è inattivo, occupa 0px (oppure integra un'impostazione globale discreta).
2. Comportamento dello stato attivo (`isActive`):
   - Renderizza il timer come una **barra TUI compatta sticky** posizionata subito sopra la bottom action bar (oppure ancorata in cima sotto la TopStatusBar).
   - Altezza fissa di 36px con layout a riga singola:
     - Sinistra: Icona o label `⏱ REST` + countdown gigante e chiaro `01:15` in `font-mono font-black tabular-nums text-warning`.
     - Centro: Mini barra di progressione ASCII (es. `[████░░░░]`).
     - Destra: Controlli rapidi 1-tap: pulsante `[-15s]`, pulsante `[+15s]`, pulsante pausa/play e pulsante `[✕ SKIP]`.
3. Ergonomia:
   - Assicurati che non copra l'ultima serie quando si scrolla a fondo pagina (aggiungendo il corretto padding inferiore `pb-*` al contenitore principale di `ActiveWorkout`).
   - Assicurati che il countdown non causi tremolio o salti di larghezza (usa `tabular-nums` rigoroso).
4. Verifica che la build passi senza errori (`npm run build`).
```

---

### [FIX-06] De-cluttering della Schermata `Session / Home` (Launcher & Schede Rapide)
- **File coinvolti:** `src/App.tsx`, `src/components/workout/StartWorkoutDrawer.tsx`
- **Problema:** 
  - Nella Home inattiva ci sono elementi inutili: riga `DATE: 20 Nov 2026`, paragrafo didattico ("Avvia una sessione libera oppure seleziona..."), statistiche con etichette duplicate (`LIFETIME_TONNAGE` + `┌─[ VOLUME ]`).
  - Ridondanza tra la lista orizzontale "Le Tue Schede" e il drawer `StartWorkoutDrawer` che si apre premendo il tasto verde e mostra esattamente le stesse cose.
- **Obiettivo:** Rimuovere il testo didattico superfluo e unificare il launcher in una schermata TUI rapida a 1 tap.

#### Prompt per l'Agente:
```markdown
Ottimizza e semplifica la schermata iniziale (Session / Home in stato inattivo) in `src/App.tsx` e `src/components/workout/StartWorkoutDrawer.tsx`.

Requisiti specifici:
1. Eliminare il superfluo:
   - Rimuovi la riga `DATE: 20 Nov 2026` dall'header di sistema.
   - Rimuovi il paragrafo descrittivo `Avvia una sessione libera oppure seleziona una delle tue schede preimpostate.` e il testo finto-terminale `> PRONTO_PER_L'ALLENAMENTO █`.
   - Nelle card delle statistiche (Sessioni e Volume), rimuovi le doppie etichette (`LIFETIME_TONNAGE`, `COMPLETED_TOTAL`). Mantieni solo la testata `┌─[ SESSIONI ]` e `┌─[ VOLUME ]` con il numero in grande e `tabular-nums`.
2. Unificazione del flusso di avvio:
   - Invece di costringere l'utente ad aprire il `StartWorkoutDrawer` per scegliere una scheda, mostra le schede preimpostate direttamente nella schermata principale con pulsanti verticali a 1 tap:
     - `[ ▶ AVVIA SESSIONE LIBERA ↵ ]`
     - Elenco schede dell'utente: ogni scheda con nome, numero di esercizi e pulsante diretto `[ ▶ AVVIA ]`.
   - Se l'utente tocca una scheda, la sessione parte istantaneamente (0 tap intermedi).
3. Mantieni la card "Ultima Sessione Svolta" pulita ed essenziale, con il pulsante `[ ↻ RIPETI ]`.
4. Verifica con `npm run build`.
```

---

### [FIX-07] De-cluttering della Scheda `Schede / Routines`
- **File coinvolti:** `src/components/workout/RoutinesView.tsx`
- **Problema:** 
  - Ogni card di scheda ha 3 bottoni identici stipati nell'header: `[CPY]` (duplica), `[EDT]` (modifica), `[DEL]` (elimina). Duplicare o eliminare una scheda sono azioni rarissime che sporcano la schermata.
  - La barra di ricerca `$ grep` è sempre presente anche per 2 o 3 schede.
- **Obiettivo:** Rendere la scheda concentrata sull'avvio dell'allenamento; nascondere duplicazione ed eliminazione dentro la modifica o un menu compatto `[···]`.

#### Prompt per l'Agente:
```markdown
Semplifica l'interfaccia della vista Schede in `src/components/workout/RoutinesView.tsx`.

Requisiti specifici:
1. Nell'header di ogni scheda in `filteredRoutines`:
   - Rimuovi i bottoni multipli `[CPY]`, `[EDT]`, `[DEL]`.
   - Lascia unicamente un pulsante opzioni compatto `[···]` (o un singolo `[EDT]`), che apre il drawer di modifica `onEditRoutine` o un menu con "Modifica", "Duplica" ed "Elimina".
2. Barra di ricerca `$ grep`:
   - Mostra l'input `$ grep` solo se `routines.length >= 5`. Se l'utente ha poche schede, rimuovi la barra per risparmiare 45px di spazio verticale.
3. Rendi primaria e ben visibile la card:
   - Titolo della scheda chiaro e leggibile.
   - Badge con numero di esercizi e gruppi muscolari.
   - Pulsante primario `[ ▶ AVVIA_SCHEDA ↵ ]` ad altezza 44px (`h-11`).
4. Verifica con `npm run build`.
```

---

### [FIX-08] Eliminazione Box Annidati nella Schermata `Logs`
- **File coinvolti:** `src/components/workout/HistoryView.tsx`
- **Problema:** Quando si espande un workout passato (`[EXPAND]`), ogni esercizio è racchiuso in un box con bordo, e dentro ogni box le serie sono dentro ulteriori badge con bordi. Questo triplo annidamento ("box dentro box dentro box") comprime il testo su schermi da 375px-400px.
- **Obiettivo:** Trasformare l'espansione del log in un albero ASCII TUI lineare e pulito, senza bordi annidati, massimizzando la leggibilità di serie e carichi.

#### Prompt per l'Agente:
```markdown
Riprogetta la visualizzazione espansa della cronologia in `src/components/workout/HistoryView.tsx`.

Requisiti specifici:
1. Rimuovi i box con bordo annidati (`border border-border/40 bg-secondary/30 p-2`) all'interno dell'elenco espanso degli esercizi.
2. Sostituiscili con una struttura ad albero ASCII terminale a filo:
   - Ogni esercizio introdotto da `├─` o `└─` con nome in grassetto e numero di serie `[3 SERIE]`.
   - Sotto a ogni esercizio (con rientro `pl-4`), elenca le serie completate come token essenziali su singola o doppia riga:
     es. `80kg × 8 │ 80kg × 8 │ 85kg × 6` (in `tabular-nums font-mono text-xs`).
3. Mantieni l'interazione per aprire `ExerciseHistoryDrawer` al tocco sul nome dell'esercizio.
4. Mantieni i bottoni di azione a fondo card: `[ ✕ ELIMINA ]` e `[ ↻ RIPETI_SESSIONE ]`.
5. Verifica che il risultato sia pulito, privo di rumore visivo da bordi multipli, e compila con `npm run build`.
```

---

### [FIX-09] TUI Design System Compliance: Eliminazione `rounded-full` & Centered `Dialog`
- **File coinvolti:** `src/components/layout/TopStatusBar.tsx`, `src/App.tsx`, `src/components/workout/AuthScreen.tsx`, `src/components/workout/ExerciseListView.tsx`, `src/components/ui/dialog.tsx`
- **Problema:** 
  - Presenza di cerchi/dots `rounded-full` in contrasto con l'estetica TUI / mono rigida.
  - Presenza di un file orfano `ExerciseListView.tsx` che importa un modale centrato a schermo (`Dialog`), violando la regola vincolante del progetto: *"ALWAYS use bottom drawers / sheets (Drawer), NEVER centered dialogs or modals (Dialog)"*.
- **Obiettivo:** Sostituire i cerchi con glifi terminale nativi (`■` o `●`), eliminare `ExerciseListView.tsx` e deprecate/isolare `ui/dialog.tsx`.

#### Prompt per l'Agente:
```markdown
Esegui la bonifica di conformità al Design System TUI e alle regole mobile-first PWA del repository:

1. Rimozione `rounded-full`:
   - In `src/components/layout/TopStatusBar.tsx`: sostituisci il pallino pulsante `rounded-full bg-accent animate-pulse` con un blocco terminale quadrato `w-2 h-2 rounded-[0px] bg-accent` o glifo `■`.
   - In `src/App.tsx`: sostituisci il div di loading `h-2 w-2 rounded-full bg-accent animate-ping` con un loader terminale a blocchi o testo `[INITIALIZING...]`.
   - In `src/components/workout/AuthScreen.tsx`: sostituisci il dot con il medesimo blocco terminale quadrato.
2. Bonifica Modali Centrati (`Dialog`):
   - Rimuovi il file orfano non utilizzato `src/components/workout/ExerciseListView.tsx` (oppure convertilo a `Drawer` se necessario per export futuri).
   - Verifica che nessun file del progetto utilizzi `Dialog`, `DialogContent` centrati; tutti i popup devono essere tassativamente `Drawer` ancorati al fondo con safe-area (`DrawerContent`).
3. Esegui `npm run build` per confermare la totale assenza di errori di compilazione e rimozione di riferimenti orfani.
```

---

### [FIX-10] Telemetria Live nella `BottomDock.tsx` durante Sessione Attiva
- **File coinvolti:** `src/components/layout/BottomDock.tsx`, `src/App.tsx`
- **Problema:** Quando c'è una sessione in corso e l'utente naviga in `LOGS` o `SCHEDE` per controllare un dato, la tab `SESSION` mostra solo un debole asterisco (`SESSION*`). L'utente non sa se il timer di riposo sta scorrendo o quanto tempo è trascorso.
- **Obiettivo:** Trasformare l'indicatore della dock in un mini-ticker attivo (es. `0:SESSION [⏱12:40]` o `0:SESSION [REST 00:45]`) con colore di accento e aggiornamento live.

#### Prompt per l'Agente:
```markdown
Migliora il feedback di sessione attiva nella navigation bar inferiore in `src/components/layout/BottomDock.tsx` e `src/App.tsx`.

Requisiti specifici:
1. In `BottomDockProps`, aggiungi proprietà opzionali per la telemetria di sessione:
   - `elapsedSeconds?: number`
   - `activeRestSeconds?: number`
2. Nella tab `workout` (indice 0):
   - Se `hasActiveWorkout` è vero:
     - Se c'è un timer di recupero attivo (`activeRestSeconds > 0`), mostra nel testo del pulsante: `0:SESSION [REST ${activeRestSeconds}s]`.
     - Altrimenti, mostra il tempo trascorso formattato: `0:SESSION [⏱${mm:ss}]`.
     - Applica un bordo o colore accento intermittente discreto per evidenziare che la sessione è "viva" e in background.
   - Quando non c'è sessione attiva, mantieni il testo pulito `0:SESSION`.
3. In `src/App.tsx`, passa i valori calcolati di tempo trascorso o rest timer alla `BottomDock`.
4. Verifica con `npm run build` che i tipi TypeScript siano corretti e che la dock mantenga la corretta safe-area bottom (`env(safe-area-inset-bottom)`).
```

---

## Flusso Consigliato di Esecuzione

Si consiglia di eseguire i fix nell'ordine:
1. **[FIX-01]** + **[FIX-02]** + **[FIX-03]** (Nucleo centrale dell'`ActiveWorkout` e `SetRow`: azzera gli attriti durante le serie in palestra).
2. **[FIX-04]** + **[FIX-05]** (Risoluzione del layout shift e compattazione visiva dell'allenamento attivo).
3. **[FIX-06]** + **[FIX-07]** + **[FIX-08]** (De-cluttering delle schermate Launcher, Schede e Logs).
4. **[FIX-09]** + **[FIX-10]** (Rifinitura TUI design system, eliminazione dialoghi centrati e telemetria dock).
