import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WishesComponent } from './components/wishes/wishes.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApprovedWishesComponent } from './components/approved-wishes/approved-wishes.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'wishes',
    component: WishesComponent
  },
  {
    path: 'approved-wishes',
    component: ApprovedWishesComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 