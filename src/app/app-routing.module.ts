import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/guard.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule', canActivate: [AuthGuard] },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'add', loadChildren: './add/add.module#AddPageModule', canActivate: [AuthGuard] },
  { path: 'history', loadChildren: './history/history.module#HistoryPageModule' },
  { path: 'details', loadChildren: './details/details.module#DetailsPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
