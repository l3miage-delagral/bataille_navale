import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BOAT, COORD, GameDataPlayer } from '../game.service';

@Component({
  selector: 'app-score[data]',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScoreComponent implements OnInit {
  @Input() data!: GameDataPlayer ;

  constructor() { }

  ngOnInit() {
  }

}