import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';
import { TaskCreateComponent } from './components/task-create/task-create.component';
import { StudentTasksComponent } from './components/student-tasks/student-tasks.component';
import { TaskReviewComponent } from './components/task-review/task-review.component';
import { AboutComponent } from './components/about/about.component';
import { ShopComponent } from './components/shop/shop.component';
import { WishesComponent } from './components/wishes/wishes.component';
import { WishListComponent } from './components/wish-list/wish-list.component';
import { ApprovedWishesComponent } from './components/approved-wishes/approved-wishes.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'tasks', component: StudentTasksComponent },
  { path: 'create-task', component: TaskCreateComponent },
  { path: 'review-tasks', component: TaskReviewComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'about', component: AboutComponent },
  { path: 'wishes', component: WishesComponent },
  { path: 'wish-list', component: WishListComponent },
  { path: 'approved-wishes', component: ApprovedWishesComponent },
  { path: '**', redirectTo: '/login' }
];
