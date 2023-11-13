/**
 * ! NOTE
 * ! This file is due for a revision when the plot-system re-write is done
 * ! This change will affect the way crops and fertilisers are placed on plots
 * ! Also yes, this file needs a LOT of revision
 */

import uniqid from 'uniqid'
import type Bonus from '../enums/bonus'
import CropType from '../enums/crops'
import Direction from '../enums/direction'
import CropSize from '../enums/crop-size'
import type Fertiliser from './fertiliser'
import Crop from './crop'
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
    // prevents plot from being interacted with for calculations when inactive
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
    // prevents tile from being interacted with for calculations when inactive
    if (!this._isActive)
      return new Tile(null)

    return this._tiles[x][y]
  }

  getTilesBySize(row: number, col: number, size: CropSize): Tile[] {
    const tiles: Tile[] = []

    if (size === CropSize.Tree) {
      if (row === 0 && col === 0) {
        return this._tiles.flat()
      }
      else if (
        row === 0
        && col > 0
        && this._adjacentPlots.east
        && this._adjacentPlots.east.isActive
      ) {
        this._tiles.map((row: Tile[]) => row.slice(col)).forEach((row: Tile[]) => tiles.push(...row))
        this._adjacentPlots.east.tiles.map((row: Tile[]) => row.slice(0, col)).forEach((row: Tile[]) => tiles.push(...row))
        return tiles
      }
      else if (
        row > 0
        && col === 0
        && this._adjacentPlots.south
        && this._adjacentPlots.south.isActive
      ) {
        this._tiles.slice(row).forEach((row: Tile[]) => tiles.push(...row.slice(col)))
        this._adjacentPlots.south.tiles.slice(0, row).forEach((row: Tile[]) => tiles.push(...row.slice(col)))
      }
      else if (
        row > 0
        && col > 0
        && this._adjacentPlots.south
        && this._adjacentPlots.south.isActive
        && this._adjacentPlots.east
        && this._adjacentPlots.east.isActive
        && this._adjacentPlots.south._adjacentPlots.east
        && this._adjacentPlots.south._adjacentPlots.east.isActive
        && this._adjacentPlots.east._adjacentPlots.south
        && this._adjacentPlots.east._adjacentPlots.south.isActive
      ) {
        this._tiles.slice(row).forEach((row: Tile[]) => tiles.push(...row.slice(col)))
        this._adjacentPlots.east.tiles.slice(row).forEach((row: Tile[]) => tiles.push(...row.slice(0, col)))
        this._adjacentPlots.south.tiles.slice(0, row).forEach((row: Tile[]) => tiles.push(...row.slice(col)))
        this._adjacentPlots.south._adjacentPlots.east.tiles.slice(0, row).forEach((row: Tile[]) => tiles.push(...row.slice(0, col)))
      }
    }
    else if (size === CropSize.Bush) {
      if (row < TILE_ROWS - 1 && col < TILE_COLS - 1) {
        tiles.push(...this._tiles.slice(row, row + 2).map((row: Tile[]) => row.slice(col, col + 2)).flat())
      }
      else if (
        row < TILE_ROWS - 1
        && col === TILE_COLS - 1
        && this._adjacentPlots.east
        && this._adjacentPlots.east.isActive
      ) {
        tiles.push(...this._tiles.slice(row, row + 2).map((row: Tile[]) => row.slice(col, col + 2)).flat())
        tiles.push(...this._adjacentPlots.east.tiles.slice(row, row + 2).map((row: Tile[]) => row.slice(0, 1)).flat())
      }
      else if (
        row === TILE_ROWS - 1
        && col < TILE_COLS - 1
        && this._adjacentPlots.south
        && this._adjacentPlots.south.isActive
      ) {
        tiles.push(...this._tiles.slice(row, row + 2).map((row: Tile[]) => row.slice(col, col + 2)).flat())
        tiles.push(...this._adjacentPlots.south.tiles.slice(0, 1).map((row: Tile[]) => row.slice(col, col + 2)).flat())
      }
      else if (
        row === TILE_ROWS - 1
        && col === TILE_COLS - 1
        && this._adjacentPlots.south
        && this._adjacentPlots.south.isActive
        && this._adjacentPlots.east
        && this._adjacentPlots.east.isActive
        && this._adjacentPlots.south._adjacentPlots.east
        && this._adjacentPlots.south._adjacentPlots.east.isActive
        && this._adjacentPlots.east._adjacentPlots.south
        && this._adjacentPlots.east._adjacentPlots.south.isActive
      ) {
        tiles.push(...this._tiles.slice(row, row + 2).map((row: Tile[]) => row.slice(col, col + 2)).flat())
        tiles.push(...this._adjacentPlots.east.tiles.slice(row, row + 2).map((row: Tile[]) => row.slice(0, 1)).flat())
        tiles.push(...this._adjacentPlots.south.tiles.slice(0, 1).map((row: Tile[]) => row.slice(col, col + 2)).flat())
        tiles.push(...this._adjacentPlots.south._adjacentPlots.east.tiles.slice(0, 1).map((row: Tile[]) => row.slice(0, 1)).flat())
      }
    }
    else {
      tiles.push(this._tiles[row][col])
    }

    return tiles
  }

  /**
   * Removes a crop from a tile and recursively removes adjacent tiles with the same id
   *
   * @param row - The row of the tile to remove the crop from
   * @param col - The column of the tile to remove the crop from
   * @returns
   */
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

    // This is because of how fertilisers are typically added to bushes and trees
    // I forgot to check how this behaviour works in-game
    if (crop.size !== CropSize.Single)
      this.removeFertiliserFromTile(row, col)
  }

  /**
   * Places crop on any plot, used for placing crops on adjacent plots
   * @param plot
   * @param row
   * @param col
   * @param crop
   * @param id
   */
  private placeCropOnPlot(plot: Plot, row: number, col: number, crop: Crop, id: string = uniqid()): void {
    plot.removeCropFromTile(row, col)
    plot.tiles[row][col].crop = crop
    plot.tiles[row][col].id = id

    if (crop.size !== CropSize.Single)
      plot.removeFertiliserFromTile(row, col)
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

    if ((crop.size as CropSize) === CropSize.Tree) {
      const id: string = uniqid()

      if (row === 0 && column === 0) {
        this.placeCropOnTiles(row, column, TILE_ROWS, TILE_COLS, crop, id)
      }
      else {
        if (
          row === 0
          && column > 0
          && this._adjacentPlots.east
          && this._adjacentPlots.east.isActive
        ) {
          this.placeCropOnTiles(row, column, TILE_ROWS, TILE_COLS, crop, id)
          this.placeCropsOnPlot(this._adjacentPlots.east, 0, 0, TILE_ROWS, column, crop, id)
        }
        else if (
          row > 0
          && column === 0
          && this._adjacentPlots.south
          && this._adjacentPlots.south.isActive
        ) {
          this.placeCropOnTiles(row, column, TILE_ROWS, TILE_COLS, crop, id)
          this.placeCropsOnPlot(this._adjacentPlots.south, 0, 0, row, TILE_COLS, crop, id)
        }
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
          this.placeCropOnTiles(row, column, TILE_ROWS, TILE_COLS, crop, id)
          this.placeCropsOnPlot(this._adjacentPlots.east, row, 0, TILE_ROWS, column, crop, id)
          this.placeCropsOnPlot(this._adjacentPlots.south, 0, column, row, TILE_COLS, crop, id)
          this.placeCropsOnPlot(this._adjacentPlots.south._adjacentPlots.east, 0, 0, row, column, crop, id)
        }
        else {
          throw new Error(`Cannot place plant of type: ${crop.type} using this tile`)
        }
      }
    }

    else if ((crop.size as CropSize) === CropSize.Bush) {
      const id: string = uniqid()

      if (row < TILE_ROWS - 1 && column < TILE_COLS - 1) {
        this.placeCropOnTiles(row, column, row + 2, column + 2, crop, id)
      }

      else if (
        row < TILE_ROWS - 1
        && column === TILE_COLS - 1
        && this._adjacentPlots.east
        && this._adjacentPlots.east.isActive
      ) {
        this.placeCropOnTiles(row, column, row + 2, TILE_COLS, crop, id)
        this.placeCropsOnPlot(this._adjacentPlots.east, row, 0, row + 2, 1, crop, id)
      }
      else if (
        row === TILE_ROWS - 1
        && column < TILE_COLS - 1
        && this._adjacentPlots.south
        && this._adjacentPlots.south.isActive
      ) {
        this.placeCropOnTiles(row, column, TILE_ROWS, column + 2, crop, id)
        this.placeCropsOnPlot(this._adjacentPlots.south, 0, column, 1, column + 2, crop, id)
      }
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

  addFertiliserToTile(row: number, column: number, fertiliser: Fertiliser | null, {
    removeSameId = true,
    fertiliserForcedId = '',
  }): void {
    if (!this._isActive)
      return

    if (fertiliser === null) {
      this.removeFertiliserFromTile(row, column, removeSameId)
      return
    }

    // Prevents fertilisers with the same id from being added to the same tile
    // This check is needed because the code for adding fertilisers to adjacent tiles is recursive
    if (this._tiles[row][column].fertiliser !== null && this._tiles[row][column].fertiliser?.id === fertiliser.id)
      return

    // forced id is used when adding fertilisers to bushes and trees
    const fertiliserId = (fertiliserForcedId === '') ? uniqid() : fertiliserForcedId

    fertiliser.id = fertiliserId
    this._tiles[row][column].fertiliser = fertiliser

    if (this._tiles[row][column].crop?.size === CropSize.Tree || this._tiles[row][column].crop?.size === CropSize.Bush) {
      const tileId = this._tiles[row][column].id

      // look for adjacent tiles with the same id and recursively add fertiliser to them
      const matchingTiles: Tile[] = this._tiles.flat().filter((tile: Tile) => tile.id === tileId)
      matchingTiles.forEach((tile: Tile) => {
        const tileX: number = this._tiles.findIndex((row: Tile[]) => row.includes(tile))
        const tileY: number = this._tiles[tileX].findIndex((t: Tile) => t === tile)
        this._tiles[tileX][tileY].fertiliser = fertiliser
      })

      // look for adjacent tiles with the same id in adjacent plots and recursively add fertiliser to them
      for (const adjacentPlot of Object.values(this._adjacentPlots)) {
        if (adjacentPlot === null)
          continue
        const matchingTiles: Tile[] = adjacentPlot.tiles.flat().filter((tile: Tile) => tile.id === tileId)
        matchingTiles.forEach((tile: Tile) => {
          const tileX: number = adjacentPlot.tiles.findIndex((row: Tile[]) => row.includes(tile))
          const tileY: number = adjacentPlot.tiles[tileX].findIndex((t: Tile) => t === tile)
          adjacentPlot.addFertiliserToTile(tileX, tileY, fertiliser, {
            removeSameId,
            fertiliserForcedId: fertiliserId,
          })
        })
      }
    }
  }

  removeFertiliserFromTile(row: number, column: number, removeSameId: boolean = true): void {
    if (!this._isActive)
      return

    const tileHadFertiliser = (this._tiles[row][column].fertiliser !== null)
    if (!tileHadFertiliser)
      return
    this._tiles[row][column].fertiliser = null

    // Code to remove fertilisers added to bushes and trees
    // ? Is this even how it should work? I haven't verified it
    if (this._tiles[row][column].crop?.size === CropSize.Tree || this._tiles[row][column].crop?.size === CropSize.Bush) {
      if (!removeSameId)
        return

      // remove fertilisers with the same id from the same plot
      const fertiliserId = this._tiles[row][column].id
      const matchingTiles: Tile[] = this._tiles.flat().filter((tile: Tile) => tile.id === fertiliserId)
      matchingTiles.forEach((tile: Tile) => {
        const tileX: number = this._tiles.findIndex((row: Tile[]) => row.includes(tile))
        const tileY: number = this._tiles[tileX].findIndex((t: Tile) => t === tile)
        this._tiles[tileX][tileY].fertiliser = null
      })

      // look for adjacent tiles with the same id in adjacent plots and recursively remove them
      for (const adjacentPlot of Object.values(this._adjacentPlots)) {
        if (adjacentPlot === null)
          continue
        const matchingTiles: Tile[] = adjacentPlot.tiles.flat().filter((tile: Tile) => tile.id === fertiliserId)

        matchingTiles.forEach((tile: Tile) => {
          const tileX: number = adjacentPlot.tiles.findIndex((row: Tile[]) => row.includes(tile))
          const tileY: number = adjacentPlot.tiles[tileX].findIndex((t: Tile) => t === tile)
          adjacentPlot.removeFertiliserFromTile(tileX, tileY, removeSameId)
        })
      }
    }
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

  /**
   *  Returns the tiles adjacent to the given tile, including tiles from adjacent plots
   * @param row
   * @param col
   * @returns
   */
  getAdjacentTiles(row: number, col: number): Tile[] {
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
    return getAdjacentTiles(row, col)
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

        if (tile.fertiliser !== null)
          bonuses.push(tile.fertiliser.effect)

        tile.bonusesReceived = bonuses
      }
    }
  }

  getTileBonuses(x: number, y: number): Bonus[] {
    return this._tiles[x][y].bonuses
  }

  resetTileHover(): void {
    const tiles = this._tiles.flat()
    if (!tiles.some((tile: Tile) => tile.isHovered))
      return

    for (const tile of tiles)
      tile.isHovered = false
  }

  onTileHover(row: number, col: number, selectedItem: Crop | Fertiliser | null | string = null): void {
    if (!this._isActive)
      return
    if (this._tiles[row][col].isHovered)
      return

    this.resetTileHover()
    this._tiles[row][col].isHovered = true

    if (!(selectedItem instanceof Crop)) {
      const tileCrop = this._tiles[row][col].crop
      if (tileCrop && tileCrop.size !== CropSize.Single) {
        const matchingTiles: Tile[] = this._tiles.flat().filter((tile: Tile) => tile.id === this._tiles[row][col].id)
        matchingTiles.forEach((tile: Tile) => {
          const tileX: number = this._tiles.findIndex((row: Tile[]) => row.includes(tile))
          const tileY: number = this._tiles[tileX].findIndex((t: Tile) => t === tile)
          this._tiles[tileX][tileY].isHovered = true
        })

        // look for adjacent tiles with the same id in adjacent plots and recursively hover them
        for (const adjacentPlot of Object.values(this._adjacentPlots)) {
          if (adjacentPlot === null)
            continue
          const matchingTiles: Tile[] = adjacentPlot.tiles.flat().filter((tile: Tile) => tile.id === this._tiles[row][col].id)
          matchingTiles.forEach((tile: Tile) => {
            const tileX: number = adjacentPlot.tiles.findIndex((row: Tile[]) => row.includes(tile))
            const tileY: number = adjacentPlot.tiles[tileX].findIndex((t: Tile) => t === tile)
            adjacentPlot.onTileHover(tileX, tileY, selectedItem)
          })
        }
      }
    }
    else {
      const tileSize = selectedItem.size
      const tiles = this.getTilesBySize(row, col, tileSize)
      tiles.forEach((tile: Tile) => tile.isHovered = true)
    }
  }
}

export default Plot
