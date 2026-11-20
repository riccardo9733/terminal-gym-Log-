import { DefaultExercise } from '../types/workout';

export const DEFAULT_EXERCISES: DefaultExercise[] = [
  // CHEST
  { id: 'barbell-bench-press', name: 'Barbell Bench Press', muscleGroup: 'chest', aliases: ['flat bench', 'panca piana'] },
  { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', muscleGroup: 'chest', aliases: ['incline db press', 'spinte 30', 'spinte 30°', 'spinte manubri 30'] },
  { id: 'incline-barbell-bench-press', name: 'Incline Barbell Bench Press', muscleGroup: 'chest', aliases: ['incline bench'] },
  { id: 'chest-dips', name: 'Weighted Dips (Chest)', muscleGroup: 'chest', aliases: ['dips', 'parallele'] },
  { id: 'dumbbell-chest-fly', name: 'Dumbbell Chest Fly', muscleGroup: 'chest', aliases: ['croci manubri'] },
  { id: 'cable-chest-crossover', name: 'Cable Chest Crossover', muscleGroup: 'chest', aliases: ['cavi petto'] },
  { id: 'push-up', name: 'Push-Up', muscleGroup: 'chest', aliases: ['piegamenti'] },
  { id: 'machine-chest-press', name: 'Machine Chest Press', muscleGroup: 'chest', aliases: ['chest press'] },
  { id: 'pec-deck-fly', name: 'Pec Deck Machine', muscleGroup: 'chest', aliases: ['butterfly'] },

  // BACK
  { id: 'conventional-deadlift', name: 'Barbell Deadlift', muscleGroup: 'back', aliases: ['stacco da terra', 'deadlift'] },
  { id: 'barbell-bent-over-row', name: 'Barbell Bent-Over Row', muscleGroup: 'back', aliases: ['rematore bilanciere', 'pendlay row'] },
  { id: 'pull-up', name: 'Pull-Up', muscleGroup: 'back', aliases: ['trazioni alla sbarra', 'trazioni prone'] },
  { id: 'chin-up', name: 'Chin-Up', muscleGroup: 'back', aliases: ['trazioni supine'] },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', aliases: ['lat machine'] },
  { id: 'seated-cable-row', name: 'Seated Cable Row', muscleGroup: 'back', aliases: ['pulley basso', 'cable row'] },
  { id: 'single-arm-dumbbell-row', name: 'Single-Arm Dumbbell Row', muscleGroup: 'back', aliases: ['rematore manubrio'] },
  { id: 't-bar-row', name: 'T-Bar Row', muscleGroup: 'back', aliases: ['rematore a t'] },
  { id: 'chest-supported-row', name: 'Chest-Supported Row', muscleGroup: 'back', aliases: ['rematore panca'] },
  { id: 'face-pull', name: 'Face Pull', muscleGroup: 'back', aliases: ['facepull cavo', 'pull face', 'face pull'] },
  { id: 'hyperextension', name: 'Hyperextensions (Back)', muscleGroup: 'back', aliases: ['iperestensioni'] },

  // LEGS
  { id: 'barbell-back-squat', name: 'Barbell Back Squat', muscleGroup: 'legs', aliases: ['squat', 'accosciata'] },
  { id: 'barbell-front-squat', name: 'Barbell Front Squat', muscleGroup: 'legs', aliases: ['front squat'] },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift (RDL)', muscleGroup: 'legs', aliases: ['stacco rumeno', 'rdl'] },
  { id: 'leg-press', name: '45° Leg Press', muscleGroup: 'legs', aliases: ['pressa a 45'] },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'legs', aliases: ['split squat bulgaro', 'bss'] },
  { id: 'walking-lunges', name: 'Walking Lunges', muscleGroup: 'legs', aliases: ['affondi camminati'] },
  { id: 'leg-extension', name: 'Leg Extension Machine', muscleGroup: 'legs', aliases: ['leg ext'] },
  { id: 'lying-leg-curl', name: 'Lying Leg Curl', muscleGroup: 'legs', aliases: ['leg curl sdraiato'] },
  { id: 'seated-leg-curl', name: 'Seated Leg Curl', muscleGroup: 'legs', aliases: ['leg curl seduto'] },
  { id: 'standing-calf-raise', name: 'Standing Calf Raise', muscleGroup: 'legs', aliases: ['polpacci in piedi'] },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', muscleGroup: 'legs', aliases: ['polpacci seduto'] },
  { id: 'barbell-hip-thrust', name: 'Barbell Hip Thrust', muscleGroup: 'legs', aliases: ['hip thrust'] },
  { id: 'goblet-squat', name: 'Goblet Squat', muscleGroup: 'legs', aliases: ['goblet'] },
  { id: 'hack-squat', name: 'Hack Squat Machine', muscleGroup: 'legs', aliases: ['hack squat'] },

  // SHOULDERS
  { id: 'overhead-press', name: 'Overhead Barbell Press (OHP)', muscleGroup: 'shoulders', aliases: ['military press', 'lento avanti'] },
  { id: 'seated-dumbbell-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'shoulders', aliases: ['lento con manubri'] },
  { id: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'shoulders', aliases: ['alzate laterali'] },
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', muscleGroup: 'shoulders', aliases: ['alzate laterali al cavo'] },
  { id: 'reverse-pec-deck', name: 'Reverse Pec Deck (Rear Delt)', muscleGroup: 'shoulders', aliases: ['croci inverse'] },
  { id: 'arnold-press', name: 'Arnold Dumbbell Press', muscleGroup: 'shoulders', aliases: ['arnold press'] },
  { id: 'dumbbell-front-raise', name: 'Dumbbell Front Raise', muscleGroup: 'shoulders', aliases: ['alzate frontali'] },
  { id: 'upright-row', name: 'Barbell Upright Row', muscleGroup: 'shoulders', aliases: ['tirate al mento'] },

  // ARMS
  { id: 'barbell-bicep-curl', name: 'Barbell Bicep Curl', muscleGroup: 'arms', aliases: ['curl bilanciere'] },
  { id: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', muscleGroup: 'arms', aliases: ['curl panca inclinata', 'curl panca 60', 'curl panca 60°', 'curl 60'] },
  { id: 'dumbbell-hammer-curl', name: 'Dumbbell Hammer Curl', muscleGroup: 'arms', aliases: ['hammer curl', 'curl a martello'] },
  { id: 'preacher-curl', name: 'Preacher Curl (Scott Bench)', muscleGroup: 'arms', aliases: ['panca scott'] },
  { id: 'cable-bicep-curl', name: 'Cable Bicep Curl', muscleGroup: 'arms', aliases: ['curl al cavo'] },
  { id: 'tricep-rope-pushdown', name: 'Tricep Rope Pushdown', muscleGroup: 'arms', aliases: ['pushdown corda'] },
  { id: 'skullcrushers', name: 'Barbell Skullcrushers (Lying Ext)', muscleGroup: 'arms', aliases: ['french press'] },
  { id: 'close-grip-bench-press', name: 'Close-Grip Bench Press', muscleGroup: 'arms', aliases: ['panca presa stretta'] },
  { id: 'overhead-cable-tricep-ext', name: 'Overhead Cable Tricep Extension', muscleGroup: 'arms', aliases: ['estensioni sopra la testa'] },
  { id: 'tricep-bench-dips', name: 'Bench Dips', muscleGroup: 'arms', aliases: ['dips su panca'] },

  // CORE
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'core', aliases: ['alzate gambe alla sbarra'] },
  { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', muscleGroup: 'core', aliases: ['ruota addominali'] },
  { id: 'cable-woodchopper', name: 'Cable Woodchopper', muscleGroup: 'core', aliases: ['torsioni al cavo'] },
  { id: 'cable-crunch', name: 'Kneeling Cable Crunch', muscleGroup: 'core', aliases: ['crunch al cavo'] },
  { id: 'plank', name: 'Isometric Forearm Plank', muscleGroup: 'core', aliases: ['plank'] },
  { id: 'decline-sit-up', name: 'Decline Sit-Up', muscleGroup: 'core', aliases: ['sit up panca'] },

  // CONDITIONING
  { id: 'rowing-machine', name: 'Concept2 Rowing Machine', muscleGroup: 'conditioning', aliases: ['vogatore', 'rower'] },
  { id: 'assault-bike', name: 'Assault / Echo Air Bike', muscleGroup: 'conditioning', aliases: ['air bike'] },
  { id: 'kettlebell-swings', name: 'Kettlebell Swings', muscleGroup: 'conditioning', aliases: ['kb swings'] },
  { id: 'sled-push', name: 'Sled Push / Prowler', muscleGroup: 'conditioning', aliases: ['slitta', 'prowler'] },
  { id: 'farmers-walk', name: 'Heavy Farmer\'s Walk', muscleGroup: 'conditioning', aliases: ['camminata del contadino'] },
  { id: 'jump-rope', name: 'Jump Rope', muscleGroup: 'conditioning', aliases: ['salto con corda'] },

  // OTHER
  { id: 'barbell-shrug', name: 'Barbell Shrug', muscleGroup: 'other', aliases: ['scrollate bilanciere'] },
  { id: 'dumbbell-shrug', name: 'Dumbbell Shrug', muscleGroup: 'other', aliases: ['scrollate manubri'] },
  { id: 'wrist-curl', name: 'Wrist Curls (Forearms)', muscleGroup: 'other', aliases: ['avambracci'] },
];
