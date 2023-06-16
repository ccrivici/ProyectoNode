import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  message: string;
  buttonText: {
    ok: string;
    cancel: string;
  };
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>Eliminar Registro</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="warn" (click)="cancel()">
        {{ data.buttonText.cancel }}
      </button>
      <button mat-raised-button style="color: white; background-color: forestgreen;"
        (click)="confirm()">{{ data.buttonText.ok }}
      </button>
    </mat-dialog-actions>`,
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
