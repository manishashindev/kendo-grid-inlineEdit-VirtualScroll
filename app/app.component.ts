import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddEvent, CancelEvent, EditEvent, GridComponent, GridDataResult, PageChangeEvent, RemoveEvent, SaveEvent } from '@progress/kendo-angular-grid';
import { FilterDescriptor, State, process } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { gridMockData } from './data';
import { EditService } from './edit.service';
import { Product } from './model';


@Component({
  selector: 'my-app',
  template: `
    <kendo-grid
      [data]="view | async"
      [height]="height"
      [rowHeight]="rowHeight"
      [pageSize]="gridState.take"
      [skip]="gridState.skip"
      [sort]="gridState.sort"
      [scrollable]="'virtual'"
      [filter]="filters" (edit)="editHandler($event)"
      (cancel)="cancelHandler($event)"
      (save)="saveHandler($event)"
      (remove)="removeHandler($event)"
      (add)="addHandler($event)" >
      <kendo-grid-column title="ProductID" field="ProductID" editor="numeric"></kendo-grid-column>
      <kendo-grid-column title="ProductName" field="ProductName" editor="string"></kendo-grid-column>
      <kendo-grid-command-column title="command" width="140">
      <ng-template kendoGridCellTemplate let-isNew="isNew">
        <button kendoGridEditCommand [primary]="true">Edit</button>
        <button kendoGridRemoveCommand>Remove</button>
        <button kendoGridSaveCommand>
          {{ isNew ? "Add" : "Update" }}
        </button>
        <button kendoGridCancelCommand>
          {{ isNew ? "Discard changes" : "Cancel" }}
        </button>
      </ng-template>
    </kendo-grid-command-column>
    </kendo-grid>
  `
})
export class AppComponent {
  //public gridView = gridMockData;
  public view: Observable<GridDataResult>;
  public height = 180;
  public rowHeight = 30;
  public filters: FilterDescriptor;
  public formGroup: FormGroup;
  private editService: EditService;
  private editedRowIndex: number;
  public gridState: State = {
    sort: [],
    skip: 0,
    take: 100,
  };

  constructor(@Inject(EditService) editServiceFactory: () => EditService) {
    this.editService = editServiceFactory();
  }
  public ngOnInit(): void {
    this.view = this.editService.pipe(
      map((data) => process(data, this.gridState))
    );

    this.editService.read();
  }

  public onStateChange(state: State): void {
    this.gridState = state;

    this.editService.read();
  }

  public addHandler(args: AddEvent): void {
    this.closeEditor(args.sender);
    // define all editable fields validators and default values
    this.formGroup = new FormGroup({
      ProductID: new FormControl(),
      ProductName: new FormControl("", Validators.required),
      UnitPrice: new FormControl(0),
      UnitsInStock: new FormControl(
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern("^[0-9]{1,3}"),
        ])
      ),
      Discontinued: new FormControl(false),
    });
    // show the new row editor, with the `FormGroup` build above
    args.sender.addRow(this.formGroup);
  }

  public editHandler(args: EditEvent): void {
    // define all editable fields validators and default values
    const { dataItem } = args;
    this.closeEditor(args.sender);

    this.formGroup = new FormGroup({
      ProductID: new FormControl(dataItem.ProductID),
      ProductName: new FormControl(dataItem.ProductName, Validators.required),
      UnitsInStock: new FormControl(
        3,
        Validators.compose([
          Validators.required,
          Validators.pattern("^[0-9]{1,3}"),
        ])
      ),
      Discontinued: new FormControl(false),
    });

    this.editedRowIndex = args.rowIndex;
    // put the row in edit mode, with the `FormGroup` build above
    args.sender.editRow(args.rowIndex, this.formGroup);
  }

  public cancelHandler(args: CancelEvent): void {
    // close the editor for the given row
    this.closeEditor(args.sender, args.rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew }: SaveEvent): void {
    const product: Product[] = formGroup.value;

    this.editService.save(product, isNew);

    sender.closeRow(rowIndex);
  }

  public removeHandler(args: RemoveEvent): void {
    // remove the current dataItem from the current data source,
    // `editService` in this example
    this.editService.remove(args.dataItem);
  }

  private closeEditor(grid: GridComponent, rowIndex = this.editedRowIndex) {
    // close the editor
    grid.closeRow(rowIndex);
    // reset the helpers
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }
}
