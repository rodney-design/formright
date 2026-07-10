export interface StateFilingWorksheetField {
  label: string;
  value: string;
}

export interface StateFilingWorksheet {
  state: string;
  entityType: string;
  fields: StateFilingWorksheetField[];
}
