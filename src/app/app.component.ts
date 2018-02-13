import { Component } from '@angular/core';
import {setTimeout} from 'timers';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function Node (value) {
  this.value = value;
  this.open = value !== '#';
  this.cost = 1000;
  this.path = '';

  this.left = null;
  this.top = null;
  this.right = null;
  this.bottom = null;
}

function getPath(a, b) {
  let path = '';
  const d = a - b;

  if (d === 1 || d === -3) { path += 'l'; }
  if (d === 2 || d === -2) { path += 'rr'; }
  if (d === 3 || d === -1) { path += 'r'; }

  return path + 'f';
}

function getCommands(field, power) {
  const square = [[]];
  const d = Math.sqrt(field.length);

  let start = null;
  let target = null;
  let x = 0;
  let y = 0;

  for (let i = 0; i < field.length; i++) {
    if (x === d) {
      square.push([]);
      x = 0;
      y++;
    }

    square[y][x] = new Node(field[i]);

    if (square[y] && square[y][x - 1]) {
      square[y][x].left = square[y][x - 1];
      square[y][x].left.right = square[y][x];
    }

    if (square[y - 1] && square[y - 1][x]) {
      square[y][x].top = square[y - 1][x];
      square[y][x].top.bottom = square[y][x];
    }

    if (square[y][x].value === 'S') {
      start = square[y][x];
    }
    if (square[y][x].value === 'T') {
      target = square[y][x];
    }

    x++;
  }

  function find(node, direction = 1, cost = 0, path = '') {
    if (node.cost < cost || path.length > power) {
      return;
    } else {
      node.cost = cost;
      node.path = path;
    }

    if (node.value === 'T') {
      return;
    }

    if (node.left && node.left.open) {
      find(node.left, 0, cost + 1 + Math.abs(direction - 0), path + getPath(direction , 0));
    }
    if (node.top && node.top.open) {
      find(node.top, 1, cost + 1 + Math.abs(direction - 1), path + getPath(direction , 1));
    }
    if (node.right && node.right.open) {
      find(node.right, 2, cost + 1 + Math.abs(direction - 2), path + getPath(direction , 2));
    }
    if (node.bottom && node.bottom.open) {
      find(node.bottom, 3, cost + 1 + Math.abs(direction - 3), path + getPath(direction , 3));
    }
  }

  find(start);

  if (target.path.length > power) {
    return [];
  }

  return target.path.split('');
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {

  power = 30;
  // field = '.S.#....#..#....#..#....#..#....#.......#T.......';
  // field = '.T.#....#..#....#..#....#..#....#.......#S.......';
  field = 'S.........##.#.#.#.....##.##...#.......##.....#T.';
  // field = '..........##.#.#.#.....##.##...#.......##....S#T.';

  commands = [];
  submitted = false;
  map = undefined;
  commandIndex = 0;

  submitForm() {
    let pos;
    this.commands = getCommands(this.field, this.power);
    this.submitted = true;
    const self = this;


    // create map for display
    const map = [];
    const size = Math.sqrt(this.field.length);
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const s = this.field.charAt(j + i * size);
        if (s === 'S') {
          pos = [i, j];
        }
        row[j] = {
          symbol: s,
          visited: false,
          current: false,
          direction: undefined
        };
      }
      map.push(row);
    }
    this.map = map;


    // startup robot position & direction
    let cell = map[pos[0]][pos[1]];
    cell.current = true;
    cell.visited = true;
    cell.direction = 'n';


    // make one move with a command
    function makeMove(cmd) {
      if (cmd === 'r') {
        switch (cell.direction) {
          case 'n':
            cell.direction = 'e';
            break;
          case 'e':
            cell.direction = 's';
            break;
          case 's':
            cell.direction = 'w';
            break;
          case 'w':
            cell.direction = 'n';
            break;
        }
      } else if (cmd === 'l') {
        switch (cell.direction) {
          case 'n':
            cell.direction = 'w';
            break;
          case 'w':
            cell.direction = 's';
            break;
          case 's':
            cell.direction = 'e';
            break;
          case 'e':
            cell.direction = 'n';
            break;
        }
      } else {
        let newCell;
        switch (cell.direction) {
          case 'n':
            newCell = --pos[0];
            break;
          case 's':
            newCell = ++pos[0];
            break;
          case 'w':
            newCell = --pos[1];
            break;
          case 'e':
            newCell = ++pos[1];
            break;
        }

        // highlight new cell & set it's as current, hide previous
        cell.current = false;
        newCell = map[pos[0]][pos[1]];
        newCell.current = true;
        newCell.visited = true;
        newCell.direction = cell.direction;
        cell.direction = undefined;
        cell = newCell;

      }
    }

    // iterate over commands array & execute each of them
    // async just for delay beetween iteration
    async function showCommand() {
      for (let i = 0; i < self.commands.length; i++) {
        await delay(1000);
        self.commandIndex = i;

        makeMove(self.commands[i]);
      }
    }
    showCommand();

  }

}
