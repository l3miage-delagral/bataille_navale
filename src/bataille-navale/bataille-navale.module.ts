import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game/game.component';
import { GameService } from "./game.service"
import { BoardComponent } from './board/board.component';
import { ScoreComponent } from './score/score.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [GameComponent, BoardComponent, ScoreComponent],
  exports: [GameComponent],
  providers: [GameService]
})
export class BatailleNavaleModule { }