import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { COORD, GridCase, StateParticipant } from '../game.service';

@Component({
  selector: 'app-board[state]',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent implements OnInit {
  @Input() state!: StateParticipant;
  @Input("show-boats") showBoats = true;
  @Input() playable = false;
  
  @Output() shoot = new EventEmitter<COORD>();

  readonly letters = 'ABCDEFGHIJ'.split('')

  constructor() {
  }

  ngOnInit() {
  }

  trackByIndex(i: number): number {
    return i;
  }

  classForCase(c: GridCase): ['water' | 'boat', 'canShoot' | ''] {
    return ['water', '']
  }

  classForShot(c: GridCase): ['shot' | ''] {
    return ['']
  }

}