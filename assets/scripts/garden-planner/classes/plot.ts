import uniqid from 'uniqid'
import Direction from '../enums/direction'
import type Bonus from '../enums/bonus'
import CropType from '../enums/crops'
import type Crop from './crop'
import Tile from './tile'

// Grid sizes for a plot
const TILE_ROWS = 3
const TILE_COLS = 3

class Plot {
  private _isActive: boolean = false
  private _tiles: Tile[][] = []
  private _id: string = uniqid()

  // Contains references to adjacent plots for the purpose of calculating bonuses
  private _adjacentPlots: {
    north: Plot | null
    south: Plot | null
    east: Plot | null
    west: Plot | null
  }

  constructor(isActive: boolean = false) {
    this._tiles = [
      [new Tile(null), new Tile(null), new Tile(null)],
      [new Tile(null), new Tile(null), new Tile(null)],
      [new Tile(null), new Tile(null), new Tile(null)],
    ]

    this._adjacentPlots = {
      north: null,
      south: null,
      east: null,
      west: null,
    }
    this._isActive = isActive
  }

  get id(): string {
    return this._id
  }

  get tiles(): Tile[][] {
    // this is to prevent the plot from being interacted with for calculations when inactive
    if (!this._isActive) {
      return [
        [new Tile(null), new Tile(null), new Tile(null)],
        [new Tile(null), new Tile(null), new Tile(null)],
        [new Tile(null), new Tile(null), new Tile(null)],
      ]
    }

    return this._tiles
  }

  getTile(x: number, y: number): Tile {
    // this is to prevent the plot from being interacted with for calculations when inactive
    if (!this._isActive)
      return new Tile(null)

    return this._tiles[x][y]
  }

  removeCropFromTile(row: number, col: number): void {
    // this is to prevent the plot from being interacted with when inactive
    if (!this._isActive)
      return

    const id = this._tiles[row][col].id
    this._tiles[row][col].crop = null
    this._tiles[row][col].id = uniqid()
    this._tiles[row][col].bonuses = []

    // look for adjacent tiles with the same id and recursively remove them
    const matchingTiles: Tile[] = this._tiles.flat().filter((tile: Tile) => tile.id === id)
    matchingTiles.forEach((tile: Tile) => {
      const tileX: number = this._tiles.findIndex((row: Tile[]) => row.includes(tile))
      const tileY: number = this._tiles[tileX].findIndex((t: Tile) => t === tile)
      this.removeCropFromTile(tileX, tileY)
    })

    // look for adjacent tiles with the same id in adjacent plots and recursively remove them
    for (const adjacentPlot of Object.values(this._adjacentPlots)) {
      if (adjacentPlot === null)
        continue
      const matchingTiles: Tile[] = adjacentPlot.tiles.flat().filter((tile: Tile) => tile.id === id)
      matchingTiles.forEach((tile: Tile) => {
        const tileX: number = adjacentPlot.tiles.findIndex((row: Tile[]) => row.includes(tile))
        const tileY: number = adjacentPlot.tiles[tileX].findIndex((t: Tile) => t === tile)
        adjacentPlot.removeCropFromTile(tileX, tileY)
      })
    }

    this.calculateBonusesReceived()
  }

  private placeCropOnTile(row: number, col: number, crop: Crop, id: string = uniqid()): void {
    this.removeCropFromTile(row, col)
    this._tiles[row][col].crop = crop
    this._tiles[row][col].id = id
  }

  private placeCropOnPlot(plot: Plot, row: number, col: number, crop: Crop, id: string = uniqid()): void {
    plot.removeCropFromTile(row, col)
    plot.tiles[row][col].crop = crop
    plot.tiles[row][col].id = id
  }

  private placeCropOnTiles(startRow: number, startCol: number, endRow: number, endCol: number, crop: Crop, id: string = uniqid()): void {
    for (let i = startRow; i < endRow; i++) {
      for (let j = startCol; j < endCol; j++)
        this.placeCropOnTile(i, j, crop, id)
    }
  }

  placeCropsOnPlot(plot: Plot, startRow: number, startCol: number, endRow: number, endCol: number, crop: Crop, id: string = uniqid()): void {
    for (let i = startRow; i < endRow; i++) {
      for (let j = startCol; j < endCol; j++)
        this.placeCropOnPlot(plot, i, j, crop, id)
    }
  }

  setTile(row: number, column: number, crop: Crop | null): void {
    // this is to prevent the plot from being interacted with when inactive
    if (!this._isActive)
      return

    if (crop === null) {
      this.removeCropFromTile(row, column)
      return
    }

    if ((crop.type as CropType) === CropType.Apple) {
      // console.log('placing apple')
      // console.log('row: ', row, ' column: ', column)
      // Assigns them the same id so that they can be removed together
      const id: string = uniqid()

      if (row === 0 && column === 0) {
        this.placeCropOnTiles(row, column, TILE_ROWS, TILE_COLS, crop, id)
      }
      else {
        // console.log('placing apple on non-northwest plot')

        // With this row, we only need to check for an adjacent to the west
        if (
          row === 0
          && column > 0
          && this._adjacentPlots.east
          && this._adjacentPlots.east.isActive
        ) {
          // console.log('placing apple on east plot')
          this.placeCropOnTiles(row, column, TILE_ROWS, TILE_COLS, crop, id)
          this.placeCropsOnPlot(this._adjacentPlots.east, 0, 0, TILE_ROWS, column, crop, id)
        }

        // With this column, we only need to check for an adjacent to the south
        else if (
          row > 0
          && column === 0
          && this._adjacentPlots.south
          && this._adjacentPlots.south.isActive
        ) {
          // console.log('placing apple on south plot')
          this.placeCropOnTiles(row, column, TILE_ROWS, TILE_COLS, crop, id)
          this.placeCropsOnPlot(this._adjacentPlots.south, 0, 0, row, TILE_COLS, crop, id)
        }

        // This set up means that the plot southeast of the current plot will be intersected by the apple tree
        else if (
          row > 0
          && column > 0
          && this._adjacentPlots.south
          && this._adjacentPlots.south.isActive
          && this._adjacentPlots.east
          && this._adjacentPlots.east.isActive
          && this._adjacentPlots.south._adjacentPlots.east
          && this._adjacentPlots.south._adjacentPlots.east.isActive
          && this._adjacentPlots.east._adjacentPlots.south
          && this._adjacentPlots.east._adjacentPlots.south.isActive
        ) {
          // console.log('placing apple on southeast plot')
          this.placeCropOnTiles(row, column, TILE_ROWS, TILE_COLS, crop, id)
          this.placeCropsOnPlot(this._adjacentPlots.east, row, 0, TILE_ROWS, column, crop, id)
          this.placeCropsOnPlot(this._adjacentPlots.south, 0, column, row, TILE_COLS, crop, id)
          this.placeCropsOnPlot(this._adjacentPlots.south._adjacentPlots.east, 0, 0, row, column, crop, id)
        }
        // Invalid placement
        else {
          console.error('invalid placement')
          return
        }
      }
    }

    else if ((crop.type as CropType) === CropType.Blueberry) {
      // Assigns them the same id so that they can be removed together
      const id: string = uniqid()

      if (row < TILE_ROWS - 1 && column < TILE_COLS - 1) {
        this.placeCropOnTiles(row, column, row + 2, column + 2, crop, id)
      }

      // Berry bush will be placed on this plot and on the east plot
      else if (
        row < TILE_ROWS - 1
        && column === TILE_COLS - 1
        && this._adjacentPlots.east
        && this._adjacentPlots.east.isActive
      ) {
        this.placeCropOnTiles(row, column, row + 2, TILE_COLS, crop, id)
        this.placeCropsOnPlot(this._adjacentPlots.east, row, 0, row + 2, 1, crop, id)
      }

      // Berry bush will be placed on this plot and on the south plot
      else if (
        row === TILE_ROWS - 1
        && column < TILE_COLS - 1
        && this._adjacentPlots.south
        && this._adjacentPlots.south.isActive
      ) {
        this.placeCropOnTiles(row, column, TILE_ROWS, column + 2, crop, id)
        this.placeCropsOnPlot(this._adjacentPlots.south, 0, column, 1, column + 2, crop, id)
      }

      // Berry bush will be placed on this plot, on the east plot, south plot, and on the southeast plot
      else if (
        row === TILE_ROWS - 1
        && column === TILE_COLS - 1
        && this._adjacentPlots.south
        && this._adjacentPlots.south.isActive
        && this._adjacentPlots.east
        && this._adjacentPlots.east.isActive
        && this._adjacentPlots.south._adjacentPlots.east
        && this._adjacentPlots.south._adjacentPlots.east.isActive
        && this._adjacentPlots.east._adjacentPlots.south
        && this._adjacentPlots.east._adjacentPlots.south.isActive
      ) {
        this.placeCropOnTile(row, column, crop, id)

        const eastPlot = this._adjacentPlots.east
        this.placeCropOnPlot(eastPlot, row, 0, crop, id)
        const southPlot = this._adjacentPlots.south
        this.placeCropOnPlot(southPlot, 0, column, crop, id)
        const southeastPlot = this._adjacentPlots.south._adjacentPlots.east
        this.placeCropOnPlot(southeastPlot, 0, 0, crop, id)
      }

      else {
        return
      }
    }
    else {
      this.removeCropFromTile(row, column)
      this._tiles[row][column].crop = crop
    }

    this.calculateBonusesReceived()

    // Recalculate bonuses for adjacent plots
    // This is done so that the bonuses of adjacent plots are updated when a crop is planted
    // TODO: Improve this so that it doesn't have to recalculate all tiles of adjacent plots
    if (this._adjacentPlots.north)
      this._adjacentPlots.north.calculateBonusesReceived()

    if (this._adjacentPlots.south)
      this._adjacentPlots.south.calculateBonusesReceived()

    if (this._adjacentPlots.east)
      this._adjacentPlots.east.calculateBonusesReceived()

    if (this._adjacentPlots.west)
      this._adjacentPlots.west.calculateBonusesReceived()
  }

  set tiles(tiles: Tile[][]) {
    this._tiles = tiles
  }

  set isActive(isActive: boolean) {
    this._isActive = isActive
  }

  get isActive(): boolean {
    return this._isActive
  }

  // Sets the plot adjacent to the given side
  setPlotAdjacent(side: Direction, plot: Plot | null | undefined): void {
    if (!plot)
      return

    switch (side) {
      case Direction.North:
        this._adjacentPlots.north = plot
        break
      case Direction.South:
        this._adjacentPlots.south = plot
        break
      case Direction.East:
        this._adjacentPlots.east = plot
        break
      case Direction.West:
        this._adjacentPlots.west = plot
        break
    }
  }

  // Returns the tiles adjacent to the given tile
  getAdjacentTiles(x: number, y: number): Tile[] {
    const getAdjacentTiles = (x: number, y: number): Tile[] => {
      const adjacentTiles: Tile[] = []
      if (x > 0)
        adjacentTiles.push(this._tiles[x - 1][y])

      if (x < TILE_COLS - 1)
        adjacentTiles.push(this._tiles[x + 1][y])

      if (x === 0 && this._adjacentPlots.north)
        adjacentTiles.push(this._adjacentPlots.north.getTile(TILE_COLS - 1, y))

      if (x === TILE_COLS - 1 && this._adjacentPlots.south)
        adjacentTiles.push(this._adjacentPlots.south.getTile(0, y))

      if (y > 0)
        adjacentTiles.push(this._tiles[x][y - 1])

      if (y < TILE_ROWS - 1)
        adjacentTiles.push(this._tiles[x][y + 1])

      if (y === 0 && this._adjacentPlots.west)
        adjacentTiles.push(this._adjacentPlots.west.getTile(x, TILE_ROWS - 1))

      if (y === TILE_ROWS - 1 && this._adjacentPlots.east)
        adjacentTiles.push(this._adjacentPlots.east.getTile(x, 0))

      return adjacentTiles
    }
    return getAdjacentTiles(x, y)
  }

  // Returns the tiles on the side of the plot, for adjacent plots
  getCardinalTiles(side: Direction): Tile[] | null {
    if (side === Direction.North)
      return this._tiles[0]
    else if (side === Direction.South)
      return this._tiles[TILE_ROWS - 1]

    const cardinalTiles: Tile[] = []
    for (let i = 0; i < TILE_ROWS; i++) {
      if (side === Direction.East)
        cardinalTiles.push(this._tiles[i][TILE_COLS - 1])
      else if (side === Direction.West)
        cardinalTiles.push(this._tiles[i][0])
    }

    return null
  }

  calculateBonusesReceived(): void {
    for (let i = 0; i < TILE_ROWS; i++) {
      for (let j = 0; j < TILE_COLS; j++) {
        const tile = this._tiles[i][j]
        tile.bonusesReceived = []
        // tiles without crops shouldn't receive bonuses
        if (tile.crop === null || tile.crop.type === CropType.None)
          continue

        const adjacentTiles = this.getAdjacentTiles(i, j)
        const bonuses: Bonus[] = []
        for (const adjacentTile of adjacentTiles) {
          // tiles with the same crop don't give bonuses
          if (adjacentTile.crop === null)
            continue
          if (adjacentTile.crop?.type === tile.crop?.type)
            continue

          if (adjacentTile.crop?.type === CropType.None)
            continue
          bonuses.push(adjacentTile.crop.cropBonus as Bonus)
        }
        tile.bonusesReceived = bonuses
      }
    }
  }

  getTileBonuses(x: number, y: number): Bonus[] {
    return this._tiles[x][y].bonuses
  }
}

export default Plot
