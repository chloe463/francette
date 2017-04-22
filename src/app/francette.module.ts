import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { FrFormsModule } from './forms/forms.module';
import { FrDataTableModule } from './data-table/data-table.module';
import { FrNavbarModule } from './navbar/navbar.module';
import { FrTabsModule } from './tabs/tabs.module';
import { FrRippleModule } from './ripple/ripple.module';
import { FrSideNavModule } from './side-nav/side-nav.module';

import { FrChipComponent } from './chip/chip.component';
import { FrKpiTableComponent } from './kpi-table/kpi-table.component';

@NgModule({
  declarations: [
    FrChipComponent,
    FrKpiTableComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    FrDataTableModule,
    FrFormsModule,
    FrNavbarModule,
    FrTabsModule,
    FrRippleModule,
    FrSideNavModule
  ],
  exports: [
    FrChipComponent,
    FrKpiTableComponent,
    FrDataTableModule,
    FrFormsModule,
    FrNavbarModule,
    FrTabsModule,
    FrRippleModule,
    FrSideNavModule
  ]
})
export class FrancetteModule { }
