import { Injectable } from '@angular/core';
import {
  tap,
  scan,
  map,
  Observable,
  Subject,
  delay,
  switchMap,
  shareReplay,
  startWith,
  BehaviorSubject,
  Subscription,
  filter,
} from 'rxjs';
import { OnDestroy } from '@angular/core';

export type COORD = readonly [x: number, y: number];
export interface BOAT {
  readonly upperLeft: COORD;
  readonly lowerRight: COORD;
}

export interface GameDataPlayer {
  readonly boats: readonly BOAT[];
  readonly shots: readonly COORD[];
}

interface DATA {
  readonly turn: TURN;
  readonly player: GameDataPlayer;
  readonly opponent: GameDataPlayer;
}

export type GridCase = 'water' | 'missed' | 'boat' | 'touched';
export type GridRow = readonly GridCase[];
export type GRID = readonly GridRow[];

function grid(g: GRID, [x, y]: COORD): GRID {
  let v: GridCase;
  switch (g[x][y]) {
    case 'boat':
      v = 'touched';
      break;
    case 'water':
      v = 'missed';
      break;
    default:
      v = g[x][y];
  }
  return g.map((L, i) => (i != x ? L : L.map((c, j) => (j != y ? c : v))));
}

export interface StateParticipant {
  readonly data: GameDataPlayer;
  readonly grid: GRID;
}

export type TURN = 'player' | 'opponent';
export interface STATE {
  readonly turn: TURN;
  readonly player: StateParticipant;
  readonly opponent: StateParticipant;
}

function* gen(nb: number) {
  for (let i = 0; i < nb; i++) {
    yield i;
  }
}

const N = 10;

export interface SHOOT {
  readonly orderFrom: TURN;
  readonly at: COORD;
}

export interface GameInterface {
  readonly obsState: Observable<STATE>;
  shoot(s: SHOOT): void;
  reset(turn: TURN): void;
}

@Injectable()
export class GameService implements OnDestroy, GameInterface {
  private subjData = new Subject<DATA>();
  private subjShot = new Subject<SHOOT>();
  readonly obsState: Observable<STATE>;
  private bsState = new BehaviorSubject<STATE>({
    turn: 'player',
    player: { data: { boats: [], shots: [] }, grid: [] },
    opponent: { data: { boats: [], shots: [] }, grid: [] },
  });

  private Lsub: Subscription[] = [];

  ngOnDestroy() {
    console.log('destroy GameService');
    this.Lsub.forEach((s) => s.unsubscribe());
  }

  constructor() {
    console.log('new GameService');
    this.Lsub.push(
      this.subjData
        .pipe(
          tap((D) => console.log('new data for state', D)),
          map((data) => ({
            // produce an initial STATE
            turn: data.turn,
            player: {
              data: data.player,
              grid: this.getGridFromBoats(data.player.boats),
            },
            opponent: {
              data: data.opponent,
              grid: this.getGridFromBoats(data.opponent.boats),
            },
          })),
          switchMap((S: STATE) => {
            return this.subjShot.pipe(
              scan((state, { orderFrom: shooter, at: shootAt }) => {
                const { turn, player, opponent } = state;
                if (turn !== shooter) return state;
                const P: StateParticipant =
                  turn === 'player' ? state.opponent : state.player;
                const nP: StateParticipant = {
                  data: {
                    ...P.data,
                    shots: [...P.data.shots, shootAt],
                  },
                  grid: grid(P.grid, shootAt),
                };
                const newState: STATE =
                  state.turn === 'opponent'
                    ? {
                        turn: 'player',
                        player: nP,
                        opponent,
                      }
                    : {
                        turn: 'opponent',
                        player,
                        opponent: nP,
                      };

                return newState;
              }, S),
              startWith(S)
            );
          }),
          tap(console.log),
          shareReplay(1)
        )
        .subscribe(this.bsState)
    ); // endof push

    this.Lsub.push(
      this.bsState
        .pipe(
          filter((s) => s.turn === 'opponent'),
          delay(100)
        )
        .subscribe((state) => {
          let L: COORD[] = [];
          state.player.grid.forEach((row, i) =>
            row.forEach((col, j) => {
              if (col === 'water' || col === 'boat') {
                L.push([i, j]);
              }
            })
          );

          console.log('opponent play');
          if (L.length) {
            const at: COORD = L[Math.floor(Math.random() * L.length)];
            console.log('  at', at);
            this.shoot({ orderFrom: 'opponent', at });
          }
        })
    );

    this.obsState = this.bsState.asObservable();
    this.reset();
  }

  shoot(
    s: SHOOT
  ): { status: 'error'; error: `not the turn of ${TURN}` } | { status: 'OK' } {
    if (this.bsState.value.turn === s.orderFrom) {
      this.subjShot.next(s);
      return { status: 'OK' };
    }
    return { status: 'error', error: `not the turn of ${s.orderFrom}` };
  }

  reset(turn: TURN = 'player'): void {
    this.subjData.next({
      turn,
      player: {
        boats: this.getBoats(),
        shots: [],
      },
      opponent: {
        boats: this.getBoats(),
        shots: [],
      },
    });
  }

  private getGridFromBoats(L: readonly BOAT[]): GRID {
    const G = Array(N)
      .fill(false)
      .map((L) => Array<GridCase>(N).fill('water'));

    L.forEach(({ upperLeft: [x1, y1], lowerRight: [x2, y2] }) => {
      for (let i = x1; i <= x2; i++) {
        for (let j = y1; j <= y2; j++) {
          G[i][j] = 'boat';
        }
      }
    });

    return G;
  }

  private getBoats(): BOAT[] {
    const G = Array(N)
      .fill(false)
      .map((L) => Array(N).fill(false));
    const LB: BOAT[] = [];
    [5, 4, 3, 3, 3, 2, 2, 2, 1, 1].forEach((s) => {
      let placed = false;
      do {
        const [x, y] = this.getCoord(N, N);
        if (G[x][y]) continue;
        // Try any direction
        const directions = [
          ...([
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ] as const),
        ];

        while (directions.length > 0 && !placed) {
          const pos = Math.floor(directions.length * Math.random());
          const [dx, dy] = directions[pos];
          directions.splice(pos, 1);
          if (
            [...gen(s)].reduce(
              (occ, n) => occ && G[x + n * dx]?.[y + n * dy] === false,
              true
            )
          ) {
            // Aucune case déjà occupée
            const [ex, ey]: COORD = [x + (s - 1) * dx, y + (s - 1) * dy];
            const upperLeft: COORD = [Math.min(x, ex), Math.min(y, ey)];
            const lowerRight: COORD = [Math.max(x, ex), Math.max(y, ey)];

            // Ajouter le bateau
            LB.push({ upperLeft, lowerRight });

            // Mettre à jour la grille
            [...gen(s)].forEach((n) => (G[x + n * dx][y + n * dy] = true));

            // Placé !
            placed = true;
          }
        }
      } while (!placed);
    });

    return LB;
  }

  private getCoord(X: number, Y: number): COORD {
    return [Math.floor(Math.random() * X), Math.floor(Math.random() * Y)];
  }
}
