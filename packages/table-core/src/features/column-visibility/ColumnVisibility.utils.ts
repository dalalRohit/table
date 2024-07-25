import {
  table_getAllFlatColumns,
  table_getAllLeafColumns,
} from '../../core/columns/Columns.utils'
import { row_getAllCells } from '../../core/rows/Rows.utils'
import {
  _table_getInitialState,
  _table_getState,
} from '../../core/table/Tables.utils'
import type { CellData, RowData, Updater } from '../../types/type-utils'
import type { TableFeatures } from '../../types/TableFeatures'
import type { Table } from '../../types/Table'
import type { Cell } from '../../types/Cell'
import type { Column } from '../../types/Column'
import type { ColumnPinningPosition } from '../column-pinning/ColumnPinning.types'
import type {
  ColumnDef_ColumnVisibility,
  ColumnVisibilityState,
  TableOptions_ColumnVisibility,
} from './ColumnVisibility.types'
import type { Row } from '../../types/Row'

export function column_toggleVisibility<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column<TFeatures, TData, TValue> & {
    columnDef: Partial<ColumnDef_ColumnVisibility>
  },
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
  visible?: boolean,
): void {
  if (column_getCanHide(column, table)) {
    table_setColumnVisibility(table, (old) => ({
      ...old,
      [column.id]: visible ?? !column_getIsVisible(column, table),
    }))
  }
}

export function column_getIsVisible<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column<TFeatures, TData, TValue> & {
    columnDef: Partial<ColumnDef_ColumnVisibility>
  },
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
): boolean {
  const childColumns = column.columns
  return (
    (childColumns.length
      ? childColumns.some((c) => column_getIsVisible(c, table))
      : _table_getState(table).columnVisibility?.[column.id]) ?? true
  )
}

export function column_getCanHide<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column<TFeatures, TData, TValue> & {
    columnDef: Partial<ColumnDef_ColumnVisibility>
  },
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
) {
  return (
    (column.columnDef.enableHiding ?? true) &&
    (table.options.enableHiding ?? true)
  )
}

export function column_getToggleVisibilityHandler<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column<TFeatures, TData, TValue> & {
    columnDef: Partial<ColumnDef_ColumnVisibility>
  },
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
) {
  return (e: unknown) => {
    column_toggleVisibility(
      column,
      table,
      ((e as MouseEvent).target as HTMLInputElement).checked,
    )
  }
}

export function column_getVisibleLeafColumns<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
  position?: ColumnPinningPosition | 'center',
) {
  return !position
    ? table.getVisibleLeafColumns()
    : position === 'center'
      ? table.getCenterVisibleLeafColumns()
      : position === 'left'
        ? table.getLeftVisibleLeafColumns()
        : table.getRightVisibleLeafColumns()
}

export function row_getAllVisibleCells<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  row: Row<TFeatures, TData>,
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
) {
  return row_getAllCells(row, table).filter((cell) =>
    column_getIsVisible(cell.column, table),
  )
}

export function row_getVisibleCells<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  left: Array<Cell<TFeatures, TData, unknown>>,
  center: Array<Cell<TFeatures, TData, unknown>>,
  right: Array<Cell<TFeatures, TData, unknown>>,
) {
  return [...left, ...center, ...right]
}

export function table_getVisibleFlatColumns<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
) {
  return table_getAllFlatColumns(table).filter((column) =>
    column_getIsVisible(column, table),
  )
}

export function table_getVisibleLeafColumns<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
) {
  return table_getAllLeafColumns(table).filter((column) =>
    column_getIsVisible(column, table),
  )
}

export function table_setColumnVisibility<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
  updater: Updater<ColumnVisibilityState>,
) {
  table.options.onColumnVisibilityChange?.(updater)
}

export function table_resetColumnVisibility<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
  defaultState?: boolean,
) {
  table_setColumnVisibility(
    table,
    defaultState ? {} : _table_getInitialState(table).columnVisibility ?? {},
  )
}

export function table_toggleAllColumnsVisible<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
  value?: boolean,
) {
  value = value ?? !table_getIsAllColumnsVisible(table)

  table_setColumnVisibility(
    table,
    table.getAllLeafColumns().reduce(
      (obj, column) => ({
        ...obj,
        [column.id]: !value ? !column_getCanHide(column, table) : value,
      }),
      {},
    ),
  )
}

export function table_getIsAllColumnsVisible<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
) {
  return !table
    .getAllLeafColumns()
    .some((column) => !column_getIsVisible(column, table))
}

export function table_getIsSomeColumnsVisible<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
) {
  return table
    .getAllLeafColumns()
    .some((column) => column_getIsVisible(column, table))
}

export function table_getToggleAllColumnsVisibilityHandler<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData> & {
    options: Partial<TableOptions_ColumnVisibility>
  },
) {
  return (e: unknown) => {
    table_toggleAllColumnsVisible(
      table,
      ((e as MouseEvent).target as HTMLInputElement).checked,
    )
  }
}
