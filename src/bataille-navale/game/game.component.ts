import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GameService, SHOOT, STATE } from '../game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements OnInit {
  private table: Array<number> = [1, 2, 3, 4];

  protected readonly obsState: Observable<STATE>;
  constructor(private gs: GameService) {
    this.obsState = gs.obsState;
  }

  ngOnInit() {}
}
